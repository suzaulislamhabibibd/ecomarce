<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = $request->user();
        $purchased = OrderItem::where('product_id', $product->id)->where('status', 'delivered')
            ->whereHas('order', fn ($o) => $o->where('user_id', $user->id))->exists();

        if (! $purchased) {
            return back()->with('error', 'You can review only products delivered to you.');
        }
        if ($product->reviews()->where('user_id', $user->id)->exists()) {
            return back()->with('error', 'You have already reviewed this product.');
        }

        $product->reviews()->create([...$data, 'user_id' => $user->id]);

        return back()->with('success', 'Thanks for your review!');
    }
}
