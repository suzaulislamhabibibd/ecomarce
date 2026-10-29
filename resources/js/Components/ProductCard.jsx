import { Link, router } from '@inertiajs/react';
import { discountPercent, money } from '../lib/format';
import ProductImage from './ProductImage';
import Stars from './Stars';

export default function ProductCard({ product }) {
    const discount = discountPercent(product.price, product.compare_price);

    const addToCart = () => {
        router.post('/cart', { product_id: product.id, quantity: 1 }, { preserveScroll: true });
    };

    return (
        <div className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
            <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden">
                <ProductImage src={product.image_url} name={product.name} className="transition group-hover:scale-105" />
                {discount > 0 && (
                    <span className="absolute top-2 left-2 rounded-md bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">
                        -{discount}%
                    </span>
                )}
            </Link>
            <div className="flex flex-1 flex-col p-3">
                {product.vendor && (
                    <Link href={`/store/${product.vendor.slug}`} className="text-xs text-slate-500 hover:text-brand-600">
                        {product.vendor.shop_name}
                    </Link>
                )}
                <Link href={`/product/${product.slug}`} className="mt-0.5 line-clamp-2 font-medium hover:text-brand-700">
                    {product.name}
                </Link>
                {product.reviews_avg_rating && <Stars rating={product.reviews_avg_rating} size="text-xs" />}
                <div className="mt-auto flex items-end justify-between pt-2">
                    <div>
                        <div className="text-lg font-bold text-brand-700">{money(product.price)}</div>
                        {discount > 0 && <div className="text-xs text-slate-400 line-through">{money(product.compare_price)}</div>}
                    </div>
                    <button
                        onClick={addToCart}
                        disabled={product.stock < 1}
                        className="btn-primary btn-sm"
                        title={product.stock < 1 ? 'Out of stock' : 'Add to cart'}
                    >
                        {product.stock < 1 ? 'Sold out' : '+ Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
}
