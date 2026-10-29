<?php

namespace App\Services;

use App\Models\Affiliate;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * Place an order. Each line keeps its vendor, so one order can contain
     * items from many vendors, each fulfilled separately.
     *
     * @param  array<int, int>  $raw  product id => quantity
     */
    public function place(User $user, array $shipping, array $raw, ?Affiliate $affiliate = null): Order
    {
        if (! $raw) {
            throw ValidationException::withMessages(['cart' => 'Your cart is empty.']);
        }

        // Affiliates cannot earn commission on their own purchases.
        if ($affiliate && ($affiliate->user_id === $user->id || ! $affiliate->isApproved())) {
            $affiliate = null;
        }

        return DB::transaction(function () use ($user, $shipping, $raw, $affiliate) {
            $products = Product::visible()->with('vendor')
                ->whereIn('id', array_keys($raw))
                ->lockForUpdate()->get()->keyBy('id');

            $lines = [];
            $subtotal = 0;
            foreach ($raw as $productId => $qty) {
                $qty = (int) $qty;
                if ($qty < 1) {
                    continue;
                }
                $product = $products->get($productId);
                if (! $product) {
                    throw ValidationException::withMessages(['cart' => 'A product in your cart is no longer available.']);
                }
                if ($product->vendor->user_id === $user->id) {
                    throw ValidationException::withMessages(['cart' => 'You cannot buy your own product: '.$product->name]);
                }
                if ($product->stock < $qty) {
                    throw ValidationException::withMessages(['cart' => "Only {$product->stock} left of {$product->name}."]);
                }

                $lineTotal = round($product->price * $qty, 2);
                $commission = round($lineTotal * $product->vendor->effectiveCommissionRate() / 100, 2);
                $subtotal += $lineTotal;

                $lines[] = [
                    'product_id' => $product->id,
                    'vendor_id' => $product->vendor_id,
                    'product_name' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => $qty,
                    'line_total' => $lineTotal,
                    'commission' => $commission,
                    'vendor_earning' => round($lineTotal - $commission, 2),
                ];

                $product->decrement('stock', $qty);
            }

            $shippingFee = (float) Setting::get('shipping_fee', 0);

            $order = Order::create([
                ...$shipping,
                'number' => $this->newOrderNumber(),
                'user_id' => $user->id,
                'affiliate_id' => $affiliate?->id,
                'subtotal' => round($subtotal, 2),
                'shipping_fee' => $shippingFee,
                'total' => round($subtotal + $shippingFee, 2),
                'payment_method' => 'cod',
            ]);
            $order->items()->createMany($lines);

            if ($affiliate) {
                $rate = $affiliate->effectiveCommissionRate();
                $order->affiliateCommission()->create([
                    'affiliate_id' => $affiliate->id,
                    'rate' => $rate,
                    'order_amount' => $order->subtotal,
                    'amount' => round($order->subtotal * $rate / 100, 2),
                ]);
            }

            return $order;
        });
    }

    public function updateItemStatus(OrderItem $item, string $status): void
    {
        if (! $item->canTransitionTo($status)) {
            throw ValidationException::withMessages(['status' => "Cannot change status from {$item->status} to {$status}."]);
        }

        DB::transaction(function () use ($item, $status) {
            if ($status === 'cancelled' && $item->product_id) {
                Product::whereKey($item->product_id)->increment('stock', $item->quantity);
            }
            $item->update(['status' => $status]);
            $this->refreshOrderStatus($item->order);
        });
    }

    public function cancelByCustomer(Order $order): void
    {
        $order->loadMissing('items');
        if (! $order->isCancellableByCustomer()) {
            throw ValidationException::withMessages(['order' => 'This order is already being processed and cannot be cancelled.']);
        }

        DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                if ($item->product_id) {
                    Product::whereKey($item->product_id)->increment('stock', $item->quantity);
                }
                $item->update(['status' => 'cancelled']);
            }
            $this->refreshOrderStatus($order);
        });
    }

    /** Derive the overall order status from its items. */
    public function refreshOrderStatus(Order $order): void
    {
        $statuses = $order->items()->pluck('status');
        $active = $statuses->reject(fn ($s) => $s === 'cancelled');

        $status = match (true) {
            $active->isEmpty() => 'cancelled',
            $active->every(fn ($s) => $s === 'delivered') => 'delivered',
            $active->contains(fn ($s) => in_array($s, ['shipped', 'delivered'])) => 'shipped',
            $active->contains('processing') => 'processing',
            default => 'pending',
        };

        $order->update([
            'status' => $status,
            'payment_status' => $status === 'delivered' ? 'paid' : $order->payment_status,
        ]);

        $this->syncAffiliateCommission($order);
    }

    /**
     * Keep the affiliate commission in line with what is actually sold:
     * cancelled items are excluded and it is approved only on delivery.
     */
    private function syncAffiliateCommission(Order $order): void
    {
        $commission = $order->affiliateCommission()->first();
        if (! $commission) {
            return;
        }

        $amount = (float) $order->items()->where('status', '!=', 'cancelled')->sum('line_total');

        $commission->update([
            'order_amount' => $amount,
            'amount' => round($amount * $commission->rate / 100, 2),
            'status' => match ($order->status) {
                'delivered' => 'approved',
                'cancelled' => 'cancelled',
                default => 'pending',
            },
        ]);
    }

    private function newOrderNumber(): string
    {
        do {
            $number = 'HB'.now()->format('ymd').strtoupper(Str::random(5));
        } while (Order::where('number', $number)->exists());

        return $number;
    }
}
