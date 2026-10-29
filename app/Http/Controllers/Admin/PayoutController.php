<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PayoutController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();

        return Inertia::render('Admin/Payouts', [
            'payouts' => Payout::with(['vendor:id,shop_name,slug', 'affiliate:id,code,user_id', 'affiliate.user:id,name'])
                ->when($status, fn ($q) => $q->where('status', $status))
                ->latest()->paginate(20)->withQueryString(),
            'filters' => ['status' => $status],
        ]);
    }

    public function update(Request $request, Payout $payout): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:paid,rejected'],
            'admin_note' => ['nullable', 'string', 'max:255'],
        ]);

        if ($payout->status !== 'requested') {
            return back()->with('error', 'This payout has already been processed.');
        }

        $payout->update($data);

        return back()->with('success', "Payout marked as {$data['status']}.");
    }
}
