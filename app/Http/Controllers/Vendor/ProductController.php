<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Support\Slug;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('q')->toString();

        return Inertia::render('Vendor/Products/Index', [
            'products' => $request->user()->vendor->products()->with('category:id,name')
                ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
                ->latest()->paginate(15)->withQueryString(),
            'filters' => ['q' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Vendor/Products/Form', [
            'product' => null,
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $vendor = $request->user()->vendor;
        $data = $this->validated($request);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $vendor->products()->create([
            ...$data,
            'slug' => Slug::unique(Product::class, $data['name']),
        ]);

        return redirect()->route('vendor.products.index')->with('success', 'Product created.');
    }

    public function edit(Request $request, Product $product): Response
    {
        $this->authorizeOwner($request, $product);

        return Inertia::render('Vendor/Products/Form', [
            'product' => $product,
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $this->authorizeOwner($request, $product);
        $data = $this->validated($request);

        // A product blocked by an admin stays blocked until an admin unblocks it.
        if ($product->status === 'blocked') {
            unset($data['status']);
        }

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        if ($data['name'] !== $product->name) {
            $data['slug'] = Slug::unique(Product::class, $data['name'], $product->id);
        }

        $product->update($data);

        return redirect()->route('vendor.products.index')->with('success', 'Product updated.');
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $this->authorizeOwner($request, $product);

        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }
        $product->delete();

        return back()->with('success', 'Product deleted.');
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'description' => ['nullable', 'string', 'max:5000'],
            'price' => ['required', 'numeric', 'min:1', 'max:9999999'],
            'compare_price' => ['nullable', 'numeric', 'gt:price', 'max:9999999'],
            'stock' => ['required', 'integer', 'min:0', 'max:1000000'],
            'status' => ['required', 'in:active,draft'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);
        unset($data['image']);

        return $data;
    }

    private function authorizeOwner(Request $request, Product $product): void
    {
        abort_unless($product->vendor_id === $request->user()->vendor->id, 404);
    }
}
