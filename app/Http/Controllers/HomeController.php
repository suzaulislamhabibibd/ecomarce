<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Vendor;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Home', [
            'latest' => Product::visible()->with('vendor:id,shop_name,slug')
                ->withAvg('reviews', 'rating')->latest()->take(8)->get(),
            'deals' => Product::visible()->with('vendor:id,shop_name,slug')
                ->whereColumn('compare_price', '>', 'price')
                ->withAvg('reviews', 'rating')->inRandomOrder()->take(4)->get(),
            'categories' => Category::withCount(['products' => fn ($q) => $q->visible()])
                ->orderBy('name')->get(),
            'vendors' => Vendor::approved()->withCount(['products' => fn ($q) => $q->where('status', 'active')])
                ->latest()->take(6)->get(),
        ]);
    }
}
