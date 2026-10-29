<?php

namespace App\Http\Controllers;

use App\Http\Middleware\CaptureReferral;
use App\Models\Affiliate;
use App\Models\Setting;
use App\Services\Cart;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(private Cart $cart) {}

    public function create(Request $request): Response|RedirectResponse
    {
        $lines = $this->cart->lines();
        if ($lines->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        $subtotal = round($lines->sum('line_total'), 2);
        $shipping = (float) Setting::get('shipping_fee', 0);

        return Inertia::render('Checkout', [
            'lines' => $lines,
            'subtotal' => $subtotal,
            'shippingFee' => $shipping,
            'total' => round($subtotal + $shipping, 2),
            'defaults' => [
                'shipping_name' => $request->user()->name,
                'shipping_phone' => $request->user()->phone ?? '',
            ],
        ]);
    }

    public function store(Request $request, OrderService $orders): RedirectResponse
    {
        $shipping = $request->validate([
            'shipping_name' => ['required', 'string', 'max:100'],
            'shipping_phone' => ['required', 'string', 'max:30'],
            'shipping_address' => ['required', 'string', 'max:255'],
            'shipping_city' => ['required', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $affiliate = Affiliate::findActiveByCode($request->cookie(CaptureReferral::COOKIE));
        $order = $orders->place($request->user(), $shipping, $this->cart->raw(), $affiliate);
        $this->cart->clear();

        return redirect()->route('account.orders.show', $order)
            ->with('success', "Order {$order->number} placed successfully. Pay with cash on delivery.");
    }
}
