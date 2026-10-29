<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function home(): JsonResponse
    {
        return response()->json([
            'settings' => [
                'site_name' => Setting::get('site_name'),
                'shipping_fee' => (float) Setting::get('shipping_fee'),
            ],
            'categories' => Category::orderBy('name')->get(['id', 'name', 'slug']),
            'latest' => $this->baseQuery()->latest()->take(10)->get(),
            'deals' => $this->baseQuery()->whereColumn('compare_price', '>', 'price')->inRandomOrder()->take(10)->get(),
        ]);
    }

    public function products(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'in:newest,price_asc,price_desc'],
        ]);

        $query = $this->baseQuery();
        if ($q = $filters['q'] ?? null) {
            $query->where('name', 'like', "%{$q}%");
        }
        if ($slug = $filters['category'] ?? null) {
            $query->whereHas('category', fn ($c) => $c->where('slug', $slug));
        }
        match ($filters['sort'] ?? 'newest') {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            default => $query->latest(),
        };

        return response()->json($query->paginate(20));
    }

    public function product(Request $request, Product $product): JsonResponse
    {
        abort_unless($product->isPurchasable(), 404, 'Product not available.');

        $product->load(['vendor:id,shop_name,slug', 'category:id,name,slug'])
            ->loadAvg('reviews', 'rating')->loadCount('reviews');
        $affiliate = $request->user('sanctum')?->affiliate;

        return response()->json([
            'product' => $product,
            'url' => route('products.show', $product),
            'affiliate_link' => $affiliate?->isApproved() ? $affiliate->link($product) : null,
            'reviews' => $product->reviews()->with('user:id,name')->latest()->take(10)->get(),
        ]);
    }

    private function baseQuery()
    {
        return Product::visible()->with('vendor:id,shop_name,slug')->withAvg('reviews', 'rating');
    }
}
