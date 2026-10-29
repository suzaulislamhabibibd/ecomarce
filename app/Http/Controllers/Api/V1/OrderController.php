<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json($request->user()->orders()->withCount('items')->latest()->paginate(20));
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id, 404);

        return response()->json([
            'order' => $order->load('items.vendor:id,shop_name,slug', 'items.product:id,slug'),
            'cancellable' => $order->isCancellableByCustomer(),
        ]);
    }

    /** Checkout from the app. The cart lives on the device and is sent with the order. */
    public function store(Request $request, OrderService $orders): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => ['required', 'integer', 'distinct'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100'],
            'shipping_name' => ['required', 'string', 'max:100'],
            'shipping_phone' => ['required', 'string', 'max:30'],
            'shipping_address' => ['required', 'string', 'max:255'],
            'shipping_city' => ['required', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:500'],
            'ref' => ['nullable', 'string', 'max:20'],
        ]);

        $items = collect($data['items'])->pluck('quantity', 'product_id')->all();
        $shipping = collect($data)->only(['shipping_name', 'shipping_phone', 'shipping_address', 'shipping_city', 'note'])->all();

        $order = $orders->place($request->user(), $shipping, $items, Affiliate::findActiveByCode($data['ref'] ?? null));

        return response()->json(['order' => $order->load('items')], 201);
    }

    public function cancel(Request $request, Order $order, OrderService $orders): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id, 404);
        $orders->cancelByCustomer($order);

        return response()->json(['order' => $order->fresh('items')]);
    }
}
