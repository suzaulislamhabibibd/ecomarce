<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'min' => ['nullable', 'numeric', 'min:0'],
            'max' => ['nullable', 'numeric', 'min:0'],
            'sort' => ['nullable', 'in:newest,price_asc,price_desc,rating'],
        ]);

        $query = Product::visible()->with('vendor:id,shop_name,slug')->withAvg('reviews', 'rating');

        if ($q = $filters['q'] ?? null) {
            $query->where(fn ($w) => $w->where('name', 'like', "%{$q}%")->orWhere('description', 'like', "%{$q}%"));
        }
        if ($slug = $filters['category'] ?? null) {
            $query->whereHas('category', fn ($c) => $c->where('slug', $slug));
        }
        if (isset($filters['min'])) {
            $query->where('price', '>=', $filters['min']);
        }
        if (isset($filters['max'])) {
            $query->where('price', '<=', $filters['max']);
        }

        match ($filters['sort'] ?? 'newest') {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'rating' => $query->orderByDesc('reviews_avg_rating'),
            default => $query->latest(),
        };

        return Inertia::render('Products/Index', [
            'products' => $query->paginate(12)->withQueryString(),
            'filters' => $filters,
            'categories' => Category::orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }

    public function show(Request $request, Product $product): Response
    {
        abort_unless($product->isPurchasable(), 404);

        $product->load(['vendor', 'category'])->loadAvg('reviews', 'rating')->loadCount('reviews');
        $user = $request->user();

        $canReview = $user
            && ! $product->reviews()->where('user_id', $user->id)->exists()
            && OrderItem::where('product_id', $product->id)->where('status', 'delivered')
                ->whereHas('order', fn ($o) => $o->where('user_id', $user->id))->exists();

        return Inertia::render('Products/Show', [
            'product' => $product,
            'reviews' => $product->reviews()->with('user:id,name')->latest()->take(20)->get(),
            'canReview' => $canReview,
            'related' => Product::visible()->with('vendor:id,shop_name,slug')->withAvg('reviews', 'rating')
                ->where('id', '!=', $product->id)
                ->where(fn ($q) => $q->where('category_id', $product->category_id)->orWhere('vendor_id', $product->vendor_id))
                ->inRandomOrder()->take(4)->get(),
        ]);
    }
}
