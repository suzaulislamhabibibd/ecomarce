<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AffiliateController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();

        return Inertia::render('Admin/Affiliates', [
            'affiliates' => Affiliate::with('user:id,name,email')
                ->withCount(['clicks', 'commissions as orders_count' => fn ($q) => $q->where('status', '!=', 'cancelled')])
                ->withSum(['commissions as earned' => fn ($q) => $q->where('status', 'approved')], 'amount')
                ->when($status, fn ($q) => $q->where('status', $status))
                ->latest()->paginate(15)->withQueryString(),
            'filters' => ['status' => $status],
        ]);
    }

    public function update(Request $request, Affiliate $affiliate): RedirectResponse
    {
        $affiliate->update($request->validate([
            'status' => ['sometimes', 'in:pending,approved,suspended'],
            'commission_rate' => ['sometimes', 'nullable', 'numeric', 'between:0,100'],
        ]));

        return back()->with('success', "Affiliate {$affiliate->code} updated.");
    }
}
