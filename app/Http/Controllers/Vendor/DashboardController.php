<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $vendor = $request->user()->vendor;
        $items = $vendor->orderItems();

        return Inertia::render('Vendor/Dashboard', [
            'vendor' => $vendor,
            'stats' => [
                'products' => $vendor->products()->count(),
                'low_stock' => $vendor->products()->where('stock', '<=', 5)->count(),
                'pending_items' => (clone $items)->whereIn('status', ['pending', 'processing'])->count(),
                'sales' => (float) (clone $items)->where('status', '!=', 'cancelled')->sum('line_total'),
                'earned' => $vendor->totalEarned(),
                'balance' => $vendor->availableBalance(),
                'commission_rate' => $vendor->effectiveCommissionRate(),
            ],
            'recentItems' => $vendor->orderItems()->with('order:id,number,created_at,shipping_name')
                ->latest()->take(8)->get(),
        ]);
    }
}
