<?php

namespace App\Services;

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
     * Place an order from the cart. Each line keeps its vendor, so one
     * order can contain items from many vendors, each fulfilled separately.
     */
    public function place(User $user, array $shipping, Cart $cart): Order
    {
        $raw = $cart->raw();
        if (! $raw) {
            throw ValidationException::withMessages(['cart' => 'Your cart is empty.']);
        }

        $order = DB::transaction(function () use ($user, $shipping, $raw) {
            $products = Product::visible()->with('vendor')
                ->whereIn('id', array_keys($raw))
                ->lockForUpdate()->get()->keyBy('id');

            $lines = [];
            $subtotal = 0;
            foreach ($raw as $productId => $qty) {
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
                'subtotal' => round($subtotal, 2),
                'shipping_fee' => $shippingFee,
                'total' => round($subtotal + $shippingFee, 2),
                'payment_method' => 'cod',
            ]);
            $order->items()->createMany($lines);

            return $order;
        });

        $cart->clear();

        return $order;
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
    }

    private function newOrderNumber(): string
    {
        do {
            $number = 'HB'.now()->format('ymd').strtoupper(Str::random(5));
        } while (Order::where('number', $number)->exists());

        return $number;
    }
}
