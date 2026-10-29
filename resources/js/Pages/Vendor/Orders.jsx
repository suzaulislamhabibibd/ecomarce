import { router } from '@inertiajs/react';
import FilterTabs from '../../Components/FilterTabs';
import Pagination from '../../Components/Pagination';
import StatusBadge from '../../Components/StatusBadge';
import PanelLayout from '../../Layouts/PanelLayout';
import { date, money } from '../../lib/format';

const nextLabel = { processing: 'Accept', shipped: 'Mark shipped', delivered: 'Mark delivered', cancelled: 'Cancel' };

export default function Orders({ items, filters, transitions }) {
    const setStatus = (item, status) => {
        if (status === 'cancelled' && !confirm('Cancel this item? Stock will be restored.')) return;
        router.patch(`/vendor/orders/${item.id}`, { status }, { preserveScroll: true });
    };

    return (
        <PanelLayout type="vendor" title="Orders">
            <FilterTabs
                base="/vendor/orders"
                current={filters.status}
                options={[['', 'All'], ['pending', 'Pending'], ['processing', 'Processing'], ['shipped', 'Shipped'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled']]}
            />
            <div className="space-y-3">
                {items.data.map((item) => (
                    <div key={item.id} className="card flex flex-col gap-4 p-4 md:flex-row md:items-center">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-sm font-semibold">{item.order.number}</span>
                                <StatusBadge status={item.status} />
                                <span className="text-xs text-slate-500">{date(item.created_at)}</span>
                            </div>
                            <div className="mt-1 font-medium">
                                {item.product_name} × {item.quantity}
                            </div>
                            <div className="text-xs text-slate-500">
                                Total {money(item.line_total)} · Commission {money(item.commission)} ·{' '}
                                <span className="font-semibold text-brand-700">You earn {money(item.vendor_earning)}</span>
                            </div>
                        </div>
                        <div className="text-sm text-slate-600 md:w-64">
                            <div className="font-medium">{item.order.shipping_name} · {item.order.shipping_phone}</div>
                            <div className="text-xs">{item.order.shipping_address}, {item.order.shipping_city}</div>
                            {item.order.note && <div className="text-xs text-amber-700">Note: {item.order.note}</div>}
                        </div>
                        <div className="flex flex-wrap gap-2 md:w-56 md:justify-end">
                            {transitions[item.status].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatus(item, status)}
                                    className={status === 'cancelled' ? 'btn-secondary btn-sm text-rose-600' : 'btn-primary btn-sm'}
                                >
                                    {nextLabel[status]}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                {!items.data.length && <div className="card p-10 text-center text-slate-500">No orders found.</div>}
            </div>
            <Pagination paginator={items} />
        </PanelLayout>
    );
}
