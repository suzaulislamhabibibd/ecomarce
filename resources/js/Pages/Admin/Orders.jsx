import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import FilterTabs from '../../Components/FilterTabs';
import Pagination from '../../Components/Pagination';
import StatusBadge from '../../Components/StatusBadge';
import PanelLayout from '../../Layouts/PanelLayout';
import { date, money } from '../../lib/format';

export default function Orders({ orders, filters }) {
    const [q, setQ] = useState(filters.q || '');

    return (
        <PanelLayout type="admin" title="Orders">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <FilterTabs
                    base="/admin/orders"
                    current={filters.status}
                    options={[['', 'All'], ['pending', 'Pending'], ['processing', 'Processing'], ['shipped', 'Shipped'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled']]}
                />
                <form
                    className="mb-4 flex gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        router.get('/admin/orders', { ...filters, q }, { preserveState: true });
                    }}
                >
                    <input className="input" placeholder="Order number" value={q} onChange={(e) => setQ(e.target.value)} />
                    <button className="btn-secondary">Search</button>
                </form>
            </div>
            <div className="card overflow-x-auto">
                <table className="table">
                    <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                        {orders.data.map((o) => (
                            <tr key={o.id}>
                                <td><Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold text-brand-700">{o.number}</Link></td>
                                <td>
                                    <div>{o.user?.name}</div>
                                    <div className="text-xs text-slate-500">{o.user?.email}</div>
                                </td>
                                <td>{o.items_count}</td>
                                <td className="font-semibold">{money(o.total)}</td>
                                <td><StatusBadge status={o.payment_status} /></td>
                                <td><StatusBadge status={o.status} /></td>
                                <td>{date(o.created_at)}</td>
                            </tr>
                        ))}
                        {!orders.data.length && <tr><td colSpan={7} className="py-8 text-center text-slate-500">No orders found.</td></tr>}
                    </tbody>
                </table>
            </div>
            <Pagination paginator={orders} />
        </PanelLayout>
    );
}
