import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Pagination from '../../../Components/Pagination';
import ProductImage from '../../../Components/ProductImage';
import StatusBadge from '../../../Components/StatusBadge';
import PanelLayout from '../../../Layouts/PanelLayout';
import { money } from '../../../lib/format';

export default function ProductsIndex({ products, filters }) {
    const [q, setQ] = useState(filters.q || '');

    const destroy = (product) => {
        if (confirm(`Delete "${product.name}"?`)) router.delete(`/vendor/products/${product.id}`, { preserveScroll: true });
    };

    return (
        <PanelLayout
            type="vendor"
            title="Products"
            actions={<Link href="/vendor/products/create" className="btn-primary btn-sm">+ Add product</Link>}
        >
            <form
                className="mb-4 flex max-w-md gap-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    router.get('/vendor/products', q ? { q } : {}, { preserveState: true });
                }}
            >
                <input className="input" placeholder="Search your products" value={q} onChange={(e) => setQ(e.target.value)} />
                <button className="btn-secondary">Search</button>
            </form>
            <div className="card overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr>
                    </thead>
                    <tbody>
                        {products.data.map((p) => (
                            <tr key={p.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md">
                                            <ProductImage src={p.image_url} name={p.name} />
                                        </div>
                                        <span className="font-medium">{p.name}</span>
                                    </div>
                                </td>
                                <td>{p.category?.name || '—'}</td>
                                <td>{money(p.price)}</td>
                                <td className={p.stock <= 5 ? 'font-semibold text-rose-600' : ''}>{p.stock}</td>
                                <td><StatusBadge status={p.status} /></td>
                                <td className="space-x-3 text-right whitespace-nowrap">
                                    <Link href={`/vendor/products/${p.id}/edit`} className="text-sm font-semibold text-brand-700">Edit</Link>
                                    <button onClick={() => destroy(p)} className="text-sm font-semibold text-rose-600">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {!products.data.length && (
                            <tr><td colSpan={6} className="py-10 text-center text-slate-500">No products yet. Add your first product!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination paginator={products} />
        </PanelLayout>
    );
}
