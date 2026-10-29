<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('q')->toString();
        $status = $request->string('status')->toString();

        return Inertia::render('Admin/Products', [
            'products' => Product::with(['vendor:id,shop_name,slug', 'category:id,name'])
                ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
                ->when($status, fn ($q) => $q->where('status', $status))
                ->latest()->paginate(20)->withQueryString(),
            'filters' => ['q' => $search, 'status' => $status],
        ]);
    }

    /** Block a product from the storefront, or restore it as a draft for the vendor. */
    public function toggleBlock(Product $product): RedirectResponse
    {
        $product->update(['status' => $product->status === 'blocked' ? 'draft' : 'blocked']);

        return back()->with('success', $product->status === 'blocked'
            ? "{$product->name} blocked."
            : "{$product->name} unblocked (set to draft for the vendor to republish).");
    }
}
