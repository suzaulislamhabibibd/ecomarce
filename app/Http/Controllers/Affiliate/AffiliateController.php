<?php

namespace App\Http\Controllers\Affiliate;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AffiliateController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $affiliate = $request->user()->affiliate;

        return Inertia::render('Affiliate/Dashboard', [
            'affiliate' => $affiliate,
            'stats' => $affiliate->stats(),
            'homeLink' => $affiliate->link(),
            'topProducts' => $affiliate->clicks()->whereNotNull('product_id')
                ->selectRaw('product_id, count(*) as clicks')->groupBy('product_id')
                ->orderByDesc('clicks')->with('product:id,name,slug')->take(5)->get(),
            'recentCommissions' => $affiliate->commissions()->with('order:id,number,created_at')
                ->latest()->take(5)->get(),
        ]);
    }

    /** Product picker that builds referral links and QR codes. */
    public function links(Request $request): Response
    {
        $affiliate = $request->user()->affiliate;
        $search = $request->string('q')->toString();

        $products = Product::visible()->with('vendor:id,shop_name,slug')
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->latest()->paginate(12)->withQueryString();

        $products->getCollection()->transform(fn (Product $p) => [
            'id' => $p->id,
            'name' => $p->name,
            'price' => $p->price,
            'image_url' => $p->image_url,
            'vendor' => $p->vendor->shop_name,
            'link' => $affiliate->link($p),
            'commission' => round($p->price * $affiliate->effectiveCommissionRate() / 100, 2),
        ]);

        return Inertia::render('Affiliate/Links', [
            'products' => $products,
            'filters' => ['q' => $search],
            'approved' => $affiliate->isApproved(),
        ]);
    }

    public function commissions(Request $request): Response
    {
        return Inertia::render('Affiliate/Commissions', [
            'commissions' => $request->user()->affiliate->commissions()
                ->with('order:id,number,created_at,status')->latest()->paginate(15),
        ]);
    }

    public function payouts(Request $request): Response
    {
        $affiliate = $request->user()->affiliate;

        return Inertia::render('Affiliate/Payouts', [
            'payouts' => $affiliate->payouts()->latest()->paginate(15),
            'balance' => $affiliate->availableBalance(),
            'earned' => $affiliate->totalEarned(),
        ]);
    }

    public function requestPayout(Request $request): RedirectResponse
    {
        $affiliate = $request->user()->affiliate;
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:100'],
            'method' => ['required', 'in:bkash,nagad,rocket,bank'],
            'account' => ['required', 'string', 'max:100'],
        ]);

        DB::transaction(function () use ($affiliate, $data) {
            // Lock the affiliate row so concurrent requests cannot overdraw the balance.
            $affiliate->newQuery()->whereKey($affiliate->id)->lockForUpdate()->first();

            if ($data['amount'] > $affiliate->availableBalance()) {
                throw ValidationException::withMessages(['amount' => 'Amount exceeds your available balance.']);
            }
            $affiliate->payouts()->create($data);
        });

        return back()->with('success', 'Withdrawal request submitted.');
    }

    /** Lets an existing customer join the affiliate program. */
    public function join(Request $request): Response|RedirectResponse
    {
        if ($request->user()->affiliate) {
            return redirect()->route('affiliate.dashboard');
        }

        return Inertia::render('Affiliate/Join');
    }

    public function storeJoin(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->role === User::ROLE_CUSTOMER && ! $user->affiliate, 403);

        $data = $request->validate(['promo_channel' => ['required', 'string', 'max:255']]);

        DB::transaction(function () use ($user, $data) {
            Affiliate::create([...$data, 'user_id' => $user->id, 'code' => Affiliate::generateCode()]);
            $user->update(['role' => User::ROLE_AFFILIATE]);
        });

        return redirect()->route('affiliate.dashboard')->with('success', 'Application submitted! An admin will review it soon.');
    }
}
