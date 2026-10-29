<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Account/Orders', [
            'orders' => $request->user()->orders()->withCount('items')->latest()->paginate(10),
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        abort_unless($order->user_id === $request->user()->id, 404);
        $order->load(['items.vendor:id,shop_name,slug', 'items.product:id,slug,image']);

        return Inertia::render('Account/OrderShow', [
            'order' => $order,
            'cancellable' => $order->isCancellableByCustomer(),
        ]);
    }

    public function cancel(Request $request, Order $order, OrderService $orders): RedirectResponse
    {
        abort_unless($order->user_id === $request->user()->id, 404);
        $orders->cancelByCustomer($order);

        return back()->with('success', 'Order cancelled.');
    }
}
