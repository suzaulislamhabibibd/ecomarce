<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\Cart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(private Cart $cart) {}

    public function index(): Response
    {
        $lines = $this->cart->lines();

        return Inertia::render('Cart', [
            'lines' => $lines,
            'subtotal' => round($lines->sum('line_total'), 2),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $product = Product::visible()->with('vendor')->findOrFail($data['product_id']);

        if ($request->user() && $product->vendor->user_id === $request->user()->id) {
            return back()->with('error', 'You cannot add your own product to the cart.');
        }
        if ($product->stock < 1) {
            return back()->with('error', 'This product is out of stock.');
        }

        $this->cart->add($product, $data['quantity'] ?? 1);

        return back()->with('success', "{$product->name} added to cart.");
    }

    public function update(Request $request, int $product): RedirectResponse
    {
        $data = $request->validate(['quantity' => ['required', 'integer', 'min:0', 'max:100']]);
        $this->cart->update($product, $data['quantity']);

        return back();
    }

    public function destroy(int $product): RedirectResponse
    {
        $this->cart->remove($product);

        return back()->with('success', 'Item removed from cart.');
    }
}
