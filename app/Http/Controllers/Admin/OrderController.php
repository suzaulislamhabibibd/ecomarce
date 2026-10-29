<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $search = $request->string('q')->toString();

        return Inertia::render('Admin/Orders', [
            'orders' => Order::with('user:id,name,email')->withCount('items')
                ->when($status, fn ($q) => $q->where('status', $status))
                ->when($search, fn ($q) => $q->where('number', 'like', "%{$search}%"))
                ->latest()->paginate(20)->withQueryString(),
            'filters' => ['status' => $status, 'q' => $search],
        ]);
    }

    public function show(Order $order): Response
    {
        return Inertia::render('Admin/OrderShow', [
            'order' => $order->load(['user:id,name,email,phone', 'items.vendor:id,shop_name,slug']),
        ]);
    }
}
