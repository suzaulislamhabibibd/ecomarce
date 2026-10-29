<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payout;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'gmv' => (float) OrderItem::where('status', '!=', 'cancelled')->sum('line_total'),
            'commission' => (float) OrderItem::where('status', 'delivered')->sum('commission'),
            'affiliate_commission' => (float) AffiliateCommission::where('status', 'approved')->sum('amount'),
            'orders' => Order::count(),
            'orders_today' => Order::whereDate('created_at', today())->count(),
            'customers' => User::where('role', User::ROLE_CUSTOMER)->count(),
            'vendors' => Vendor::approved()->count(),
            'pending_vendors' => Vendor::where('status', Vendor::STATUS_PENDING)->count(),
            'pending_affiliates' => Affiliate::where('status', Affiliate::STATUS_PENDING)->count(),
            'pending_payouts' => Payout::where('status', 'requested')->count(),
        ]);
    }

    public function vendors(Request $request): JsonResponse
    {
        return response()->json(Vendor::with('user:id,name,email')->withCount('products')
            ->when($request->string('status')->toString(), fn ($q, $s) => $q->where('status', $s))
            ->latest()->paginate(20));
    }

    public function updateVendor(Request $request, Vendor $vendor): JsonResponse
    {
        $vendor->update($request->validate([
            'status' => ['sometimes', 'in:pending,approved,suspended'],
            'commission_rate' => ['sometimes', 'nullable', 'numeric', 'between:0,100'],
        ]));

        return response()->json(['vendor' => $vendor]);
    }

    public function affiliates(Request $request): JsonResponse
    {
        return response()->json(Affiliate::with('user:id,name,email')->withCount('clicks')
            ->when($request->string('status')->toString(), fn ($q, $s) => $q->where('status', $s))
            ->latest()->paginate(20));
    }

    public function updateAffiliate(Request $request, Affiliate $affiliate): JsonResponse
    {
        $affiliate->update($request->validate([
            'status' => ['sometimes', 'in:pending,approved,suspended'],
            'commission_rate' => ['sometimes', 'nullable', 'numeric', 'between:0,100'],
        ]));

        return response()->json(['affiliate' => $affiliate]);
    }

    public function orders(Request $request): JsonResponse
    {
        return response()->json(Order::with('user:id,name,email')->withCount('items')
            ->when($request->string('status')->toString(), fn ($q, $s) => $q->where('status', $s))
            ->latest()->paginate(20));
    }

    public function order(Order $order): JsonResponse
    {
        return response()->json(['order' => $order->load(['user:id,name,email,phone', 'items.vendor:id,shop_name'])]);
    }

    public function payouts(Request $request): JsonResponse
    {
        return response()->json(Payout::with(['vendor:id,shop_name', 'affiliate:id,code,user_id', 'affiliate.user:id,name'])
            ->when($request->string('status')->toString(), fn ($q, $s) => $q->where('status', $s))
            ->latest()->paginate(20));
    }

    public function updatePayout(Request $request, Payout $payout): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:paid,rejected'],
            'admin_note' => ['nullable', 'string', 'max:255'],
        ]);
        abort_if($payout->status !== 'requested', 422, 'This payout has already been processed.');

        $payout->update($data);

        return response()->json(['payout' => $payout]);
    }
}
