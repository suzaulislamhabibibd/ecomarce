<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PayoutController extends Controller
{
    public function index(Request $request): Response
    {
        $vendor = $request->user()->vendor;

        return Inertia::render('Vendor/Payouts', [
            'payouts' => $vendor->payouts()->latest()->paginate(15),
            'balance' => $vendor->availableBalance(),
            'earned' => $vendor->totalEarned(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $vendor = $request->user()->vendor;
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:100'],
            'method' => ['required', 'in:bkash,nagad,rocket,bank'],
            'account' => ['required', 'string', 'max:100'],
        ]);

        DB::transaction(function () use ($vendor, $data) {
            // Lock the vendor row so concurrent requests cannot overdraw the balance.
            $vendor->newQuery()->whereKey($vendor->id)->lockForUpdate()->first();

            if ($data['amount'] > $vendor->availableBalance()) {
                throw ValidationException::withMessages(['amount' => 'Amount exceeds your available balance.']);
            }
            $vendor->payouts()->create($data);
        });

        return back()->with('success', 'Withdrawal request submitted.');
    }
}
