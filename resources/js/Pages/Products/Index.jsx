import { router } from '@inertiajs/react';
import { useState } from 'react';
import Pagination from '../../Components/Pagination';
import ProductCard from '../../Components/ProductCard';
import ShopLayout from '../../Layouts/ShopLayout';

export default function ProductsIndex({ products, filters, categories }) {
    const [min, setMin] = useState(filters.min ?? '');
    const [max, setMax] = useState(filters.max ?? '');

    const apply = (changes) => {
        const params = { ...filters, ...changes };
        Object.keys(params).forEach((k) => (params[k] === '' || params[k] == null) && delete params[k]);
        router.get('/products', params, { preserveState: true, preserveScroll: true });
    };

    const active = categories.find((c) => c.slug === filters.category);

    return (
        <ShopLayout title="Products">
            <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
                <aside className="space-y-5">
                    <div className="card p-4">
                        <h3 className="mb-2 text-sm font-semibold">Categories</h3>
                        <ul className="space-y-1 text-sm">
                            <li>
                                <button onClick={() => apply({ category: '' })} className={!filters.category ? 'font-semibold text-brand-700' : 'hover:text-brand-700'}>
                                    All
                                </button>
                            </li>
                            {categories.map((c) => (
                                <li key={c.id}>
                                    <button
                                        onClick={() => apply({ category: c.slug })}
                                        className={filters.category === c.slug ? 'font-semibold text-brand-700' : 'hover:text-brand-700'}
                                    >
                                        {c.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <form
                        className="card space-y-2 p-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            apply({ min, max });
                        }}
                    >
                        <h3 className="text-sm font-semibold">Price (৳)</h3>
                        <div className="flex gap-2">
                            <input className="input" type="number" min="0" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} />
                            <input className="input" type="number" min="0" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} />
                        </div>
                        <button className="btn-secondary btn-sm w-full">Apply</button>
                    </form>
                </aside>

                <div>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-bold">
                                {filters.q ? `Results for “${filters.q}”` : active ? active.name : 'All products'}
                            </h1>
                            <p className="text-sm text-slate-500">{products.total} products found</p>
                        </div>
                        <select className="input w-auto" value={filters.sort || 'newest'} onChange={(e) => apply({ sort: e.target.value })} aria-label="Sort">
                            <option value="newest">Newest</option>
                            <option value="price_asc">Price: low to high</option>
                            <option value="price_desc">Price: high to low</option>
                            <option value="rating">Top rated</option>
                        </select>
                    </div>
                    {products.data.length ? (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                            {products.data.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    ) : (
                        <div className="card p-12 text-center text-slate-500">No products match your filters.</div>
                    )}
                    <Pagination paginator={products} />
                </div>
            </div>
        </ShopLayout>
    );
}
