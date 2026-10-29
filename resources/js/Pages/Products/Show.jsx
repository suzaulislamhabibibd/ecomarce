import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import ProductCard from '../../Components/ProductCard';
import ProductImage from '../../Components/ProductImage';
import Stars from '../../Components/Stars';
import ShopLayout from '../../Layouts/ShopLayout';
import { date, discountPercent, money } from '../../lib/format';

function ReviewForm({ product }) {
    const { data, setData, post, processing, errors, reset } = useForm({ rating: 5, comment: '' });

    const submit = (e) => {
        e.preventDefault();
        post(`/product/${product.id}/reviews`, { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <form onSubmit={submit} className="card space-y-3 p-4">
            <h3 className="font-semibold">Write a review</h3>
            <div className="flex gap-1 text-2xl">
                {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} onClick={() => setData('rating', n)} className={n <= data.rating ? 'text-amber-400' : 'text-slate-300'}>
                        ★
                    </button>
                ))}
            </div>
            <textarea className="input" rows={3} placeholder="Share your experience..." value={data.comment} onChange={(e) => setData('comment', e.target.value)} />
            {errors.comment && <p className="text-xs text-rose-600">{errors.comment}</p>}
            <button className="btn-primary" disabled={processing}>
                Submit review
            </button>
        </form>
    );
}

export default function ProductShow({ product, reviews, canReview, related }) {
    const [quantity, setQuantity] = useState(1);
    const discount = discountPercent(product.price, product.compare_price);

    const addToCart = (buyNow = false) => {
        router.post(
            '/cart',
            { product_id: product.id, quantity },
            { preserveScroll: true, onSuccess: () => buyNow && router.visit('/checkout') },
        );
    };

    return (
        <ShopLayout title={product.name}>
            <nav className="mb-4 text-sm text-slate-500">
                <Link href="/" className="hover:text-brand-700">Home</Link> /{' '}
                {product.category && (
                    <>
                        <Link href={`/products?category=${product.category.slug}`} className="hover:text-brand-700">
                            {product.category.name}
                        </Link>{' '}
                        /{' '}
                    </>
                )}
                <span className="text-slate-700">{product.name}</span>
            </nav>

            <div className="card grid gap-8 p-6 md:grid-cols-2">
                <div className="aspect-square overflow-hidden rounded-xl">
                    <ProductImage src={product.image_url} name={product.name} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <Stars rating={product.reviews_avg_rating} />
                        <span>({product.reviews_count} reviews)</span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-brand-700">{money(product.price)}</span>
                        {discount > 0 && (
                            <>
                                <span className="text-lg text-slate-400 line-through">{money(product.compare_price)}</span>
                                <span className="rounded bg-rose-100 px-2 py-0.5 text-sm font-semibold text-rose-700">-{discount}%</span>
                            </>
                        )}
                    </div>
                    <p className={`mt-3 text-sm font-medium ${product.stock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {product.stock > 0 ? `In stock (${product.stock} available)` : 'Out of stock'}
                    </p>

                    {product.stock > 0 && (
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <div className="flex items-center rounded-lg border border-slate-300">
                                <button className="px-3 py-2" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease">
                                    −
                                </button>
                                <span className="w-10 text-center font-semibold">{quantity}</span>
                                <button className="px-3 py-2" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} aria-label="Increase">
                                    +
                                </button>
                            </div>
                            <button className="btn-secondary" onClick={() => addToCart(false)}>
                                Add to cart
                            </button>
                            <button className="btn-primary" onClick={() => addToCart(true)}>
                                Buy now
                            </button>
                        </div>
                    )}

                    <Link href={`/store/${product.vendor.slug}`} className="mt-8 flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:border-brand-500">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                            {product.vendor.shop_name.charAt(0)}
                        </span>
                        <span>
                            <span className="block text-xs text-slate-500">Sold by</span>
                            <span className="font-semibold">{product.vendor.shop_name}</span>
                        </span>
                        <span className="ml-auto text-sm text-brand-700">Visit store →</span>
                    </Link>

                    <div className="mt-6">
                        <h2 className="mb-2 font-semibold">Description</h2>
                        <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600">{product.description || 'No description provided.'}</p>
                    </div>
                </div>
            </div>

            <section className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
                <div>
                    <h2 className="mb-3 text-xl font-bold">Customer reviews</h2>
                    {reviews.length ? (
                        <div className="space-y-3">
                            {reviews.map((r) => (
                                <div key={r.id} className="card p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">{r.user?.name}</span>
                                        <span className="text-xs text-slate-500">{date(r.created_at)}</span>
                                    </div>
                                    <Stars rating={r.rating} />
                                    {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">No reviews yet.</p>
                    )}
                </div>
                <div>{canReview && <ReviewForm product={product} />}</div>
            </section>

            {related.length > 0 && (
                <section className="mt-10">
                    <h2 className="mb-4 text-xl font-bold">You may also like</h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {related.map((p) => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}
        </ShopLayout>
    );
}
