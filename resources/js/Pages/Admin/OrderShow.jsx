import { Link } from '@inertiajs/react';
import StatusBadge from '../../Components/StatusBadge';
import PanelLayout from '../../Layouts/PanelLayout';
import { date, money } from '../../lib/format';

export default function OrderShow({ order }) {
    const commission = order.items.filter((i) => i.status !== 'cancelled').reduce((sum, i) => sum + i.commission, 0);

    return (
        <PanelLayout type="admin" title={`Order ${order.number}`} actions={<Link href="/admin/orders" className="btn-secondary btn-sm">← Back</Link>}>
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
                <StatusBadge status={order.status} />
                <StatusBadge status={order.payment_status} />
                <span className="text-slate-500">Placed {date(order.created_at)}</span>
            </div>
            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                <div className="card overflow-x-auto">
                    <table className="table">
                        <thead><tr><th>Product</th><th>Vendor</th><th>Qty</th><th>Total</th><th>Commission</th><th>Vendor earning</th><th>Status</th></tr></thead>
                        <tbody>
                            {order.items.map((i) => (
                                <tr key={i.id}>
                                    <td className="font-medium">{i.product_name}</td>
                                    <td>{i.vendor?.shop_name}</td>
                                    <td>{i.quantity}</td>
                                    <td>{money(i.line_total)}</td>
                                    <td className="text-brand-700">{money(i.commission)}</td>
                                    <td>{money(i.vendor_earning)}</td>
                                    <td><StatusBadge status={i.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="space-y-4 text-sm">
                    <div className="card p-5">
                        <h2 className="mb-2 font-semibold">Summary</h2>
                        <div className="flex justify-between"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
                        <div className="flex justify-between"><span>Shipping</span><span>{money(order.shipping_fee)}</span></div>
                        <div className="flex justify-between font-bold"><span>Total</span><span>{money(order.total)}</span></div>
                        <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-brand-700"><span>Platform commission</span><span>{money(commission)}</span></div>
                    </div>
                    <div className="card p-5">
                        <h2 className="mb-2 font-semibold">Customer</h2>
                        <p>{order.user?.name} · {order.user?.email}</p>
                        <h2 className="mt-3 mb-1 font-semibold">Ship to</h2>
                        <p>{order.shipping_name} · {order.shipping_phone}</p>
                        <p>{order.shipping_address}, {order.shipping_city}</p>
                        {order.note && <p className="mt-2 text-slate-500">Note: {order.note}</p>}
                    </div>
                </div>
            </div>
        </PanelLayout>
    );
}
