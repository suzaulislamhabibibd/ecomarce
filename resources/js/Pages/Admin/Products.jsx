import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import FilterTabs from '../../Components/FilterTabs';
import Pagination from '../../Components/Pagination';
import ProductImage from '../../Components/ProductImage';
import StatusBadge from '../../Components/StatusBadge';
import PanelLayout from '../../Layouts/PanelLayout';
import { money } from '../../lib/format';

export default function Products({ products, filters }) {
    const [q, setQ] = useState(filters.q || '');

    return (
        <PanelLayout type="admin" title="Products">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <FilterTabs
                    base="/admin/products"
                    current={filters.status}
                    options={[['', 'All'], ['active', 'Active'], ['draft', 'Draft'], ['blocked', 'Blocked']]}
                />
                <form
                    className="mb-4 flex gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        router.get('/admin/products', { ...filters, q }, { preserveState: true });
                    }}
                >
                    <input className="input" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
                    <button className="btn-secondary">Search</button>
                </form>
            </div>
            <div className="card overflow-x-auto">
                <table className="table">
                    <thead><tr><th>Product</th><th>Vendor</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr></thead>
                    <tbody>
                        {products.data.map((p) => (
                            <tr key={p.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md">
                                            <ProductImage src={p.image_url} name={p.name} />
                                        </div>
                                        {p.status === 'active' ? (
                                            <Link href={`/product/${p.slug}`} className="font-medium hover:text-brand-700">{p.name}</Link>
                                        ) : (
                                            <span className="font-medium">{p.name}</span>
                                        )}
                                    </div>
                                </td>
                                <td>{p.vendor?.shop_name}</td>
                                <td>{p.category?.name || '—'}</td>
                                <td>{money(p.price)}</td>
                                <td>{p.stock}</td>
                                <td><StatusBadge status={p.status} /></td>
                                <td className="text-right">
                                    <button
                                        onClick={() => router.post(`/admin/products/${p.id}/toggle-block`, {}, { preserveScroll: true })}
                                        className={`btn-sm ${p.status === 'blocked' ? 'btn-secondary' : 'btn-secondary text-rose-600'}`}
                                    >
                                        {p.status === 'blocked' ? 'Unblock' : 'Block'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination paginator={products} />
        </PanelLayout>
    );
}
