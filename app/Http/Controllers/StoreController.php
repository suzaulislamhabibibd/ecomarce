<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Stores/Index', [
            'vendors' => Vendor::approved()
                ->withCount(['products' => fn ($q) => $q->where('status', 'active')])
                ->orderBy('shop_name')->paginate(18),
        ]);
    }

    public function show(Vendor $vendor): Response
    {
        abort_unless($vendor->isApproved(), 404);

        return Inertia::render('Stores/Show', [
            'vendor' => $vendor,
            'products' => $vendor->products()->where('status', 'active')
                ->with('vendor:id,shop_name,slug')->withAvg('reviews', 'rating')
                ->latest()->paginate(12),
        ]);
    }
}
