import { Link, router } from '@inertiajs/react';
import ProductImage from '../Components/ProductImage';
import ShopLayout from '../Layouts/ShopLayout';
import { money } from '../lib/format';

export default function Cart({ lines, subtotal }) {
    const update = (id, quantity) => router.patch(`/cart/${id}`, { quantity }, { preserveScroll: true });
    const remove = (id) => router.delete(`/cart/${id}`, { preserveScroll: true });

    if (!lines.length) {
        return (
            <ShopLayout title="Cart">
                <div className="card mx-auto max-w-md p-12 text-center">
                    <div className="text-5xl">🛒</div>
                    <h1 className="mt-4 text-xl font-bold">Your cart is empty</h1>
                    <Link href="/products" className="btn-primary mt-6">
                        Start shopping
                    </Link>
                </div>
            </ShopLayout>
        );
    }

    return (
        <ShopLayout title="Cart">
            <h1 className="mb-4 text-2xl font-bold">Shopping cart</h1>
            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                <div className="card divide-y divide-slate-100">
                    {lines.map(({ product, quantity, line_total }) => (
                        <div key={product.id} className="flex gap-4 p-4">
                            <Link href={`/product/${product.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                                <ProductImage src={product.image_url} name={product.name} />
                            </Link>
                            <div className="flex-1">
                                <Link href={`/product/${product.slug}`} className="font-medium hover:text-brand-700">
                                    {product.name}
                                </Link>
                                <div className="text-xs text-slate-500">Sold by {product.vendor.shop_name}</div>
                                <div className="mt-1 text-sm font-semibold">{money(product.price)}</div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <select className="input w-20" value={quantity} onChange={(e) => update(product.id, e.target.value)} aria-label="Quantity">
                                    {Array.from({ length: Math.min(product.stock, 20) }, (_, i) => i + 1).map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </select>
                                <div className="font-bold">{money(line_total)}</div>
                                <button onClick={() => remove(product.id)} className="text-xs text-rose-600 hover:underline">
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="card h-fit p-5">
                    <h2 className="mb-3 font-semibold">Order summary</h2>
                    <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span className="font-semibold">{money(subtotal)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Shipping is calculated at checkout.</p>
                    <Link href="/checkout" className="btn-primary mt-4 w-full">
                        Proceed to checkout
                    </Link>
                </div>
            </div>
        </ShopLayout>
    );
}
