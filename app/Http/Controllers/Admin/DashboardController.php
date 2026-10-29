<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payout;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $activeItems = OrderItem::where('status', '!=', 'cancelled');

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'gmv' => (float) (clone $activeItems)->sum('line_total'),
                'commission' => (float) OrderItem::where('status', 'delivered')->sum('commission'),
                'orders' => Order::count(),
                'customers' => User::where('role', User::ROLE_CUSTOMER)->count(),
                'vendors' => Vendor::approved()->count(),
                'pending_vendors' => Vendor::where('status', Vendor::STATUS_PENDING)->count(),
                'products' => Product::count(),
                'pending_payouts' => Payout::where('status', 'requested')->count(),
            ],
            'recentOrders' => Order::with('user:id,name')->latest()->take(8)->get(),
            'topVendors' => Vendor::approved()
                ->withSum(['orderItems as sales' => fn ($q) => $q->where('status', '!=', 'cancelled')], 'line_total')
                ->orderByDesc('sales')->take(5)->get(['id', 'shop_name', 'slug']),
        ]);
    }
}
