<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\AffiliateClick;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AffiliateController extends Controller
{
    /** Called when the app opens a referral link or scans a referral QR code. */
    public function click(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ref' => ['required', 'string', 'max:20'],
            'product_slug' => ['nullable', 'string', 'max:255'],
            'source' => ['nullable', 'in:qr,app'],
        ]);

        $affiliate = Affiliate::findActiveByCode($data['ref']);
        if (! $affiliate || $affiliate->user_id === $request->user('sanctum')?->id) {
            return response()->json(['valid' => false]);
        }

        $productId = isset($data['product_slug'])
            ? Product::where('slug', $data['product_slug'])->value('id')
            : null;
        AffiliateClick::record($affiliate, $productId, $data['source'] ?? 'app', $request->ip());

        return response()->json(['valid' => true, 'code' => $affiliate->code]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $affiliate = $request->user()->affiliate;

        return response()->json([
            'affiliate' => $affiliate,
            'stats' => $affiliate->stats(),
            'home_link' => $affiliate->link(),
        ]);
    }

    public function commissions(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->affiliate->commissions()->with('order:id,number,status,created_at')->latest()->paginate(20)
        );
    }

    public function payouts(Request $request): JsonResponse
    {
        $affiliate = $request->user()->affiliate;

        return response()->json([
            'balance' => $affiliate->availableBalance(),
            'payouts' => $affiliate->payouts()->latest()->paginate(20),
        ]);
    }

    public function requestPayout(Request $request): JsonResponse
    {
        $affiliate = $request->user()->affiliate;
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:100'],
            'method' => ['required', 'in:bkash,nagad,rocket,bank'],
            'account' => ['required', 'string', 'max:100'],
        ]);

        $payout = DB::transaction(function () use ($affiliate, $data) {
            $affiliate->newQuery()->whereKey($affiliate->id)->lockForUpdate()->first();
            if ($data['amount'] > $affiliate->availableBalance()) {
                throw ValidationException::withMessages(['amount' => 'Amount exceeds your available balance.']);
            }

            return $affiliate->payouts()->create($data);
        });

        return response()->json(['payout' => $payout], 201);
    }
}
