<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Collection;

/**
 * Session-backed shopping cart. Stores only product ids and quantities;
 * prices and availability are always re-read from the database.
 */
class Cart
{
    private const KEY = 'cart';

    public function raw(): array
    {
        return session(self::KEY, []);
    }

    public function count(): int
    {
        return array_sum($this->raw());
    }

    public function add(Product $product, int $quantity): void
    {
        $cart = $this->raw();
        $cart[$product->id] = min(($cart[$product->id] ?? 0) + $quantity, $product->stock);
        session([self::KEY => $cart]);
    }

    public function update(int $productId, int $quantity): void
    {
        $cart = $this->raw();
        if ($quantity <= 0) {
            unset($cart[$productId]);
        } elseif (isset($cart[$productId])) {
            $cart[$productId] = $quantity;
        }
        session([self::KEY => $cart]);
    }

    public function remove(int $productId): void
    {
        $this->update($productId, 0);
    }

    public function clear(): void
    {
        session()->forget(self::KEY);
    }

    /**
     * Cart lines with fresh product data. Products that are no longer
     * purchasable are dropped and quantities are clamped to stock.
     *
     * @return Collection<int, array{product: Product, quantity: int, line_total: float}>
     */
    public function lines(): Collection
    {
        $raw = $this->raw();
        if (! $raw) {
            return collect();
        }

        $products = Product::visible()->with('vendor:id,shop_name,slug,status')
            ->whereIn('id', array_keys($raw))->get()->keyBy('id');

        $lines = collect();
        $clean = [];
        foreach ($raw as $id => $qty) {
            $product = $products->get($id);
            if (! $product || $product->stock < 1) {
                continue;
            }
            $qty = max(1, min((int) $qty, $product->stock));
            $clean[$id] = $qty;
            $lines->push([
                'product' => $product,
                'quantity' => $qty,
                'line_total' => round($product->price * $qty, 2),
            ]);
        }

        if ($clean !== $raw) {
            session([self::KEY => $clean]);
        }

        return $lines;
    }
}
