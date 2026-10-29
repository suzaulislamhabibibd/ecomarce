import { Link } from '@inertiajs/react';
import StatCard from '../../Components/StatCard';
import StatusBadge from '../../Components/StatusBadge';
import PanelLayout from '../../Layouts/PanelLayout';
import { date, money } from '../../lib/format';

export default function Dashboard({ vendor, stats, recentItems }) {
    return (
        <PanelLayout type="vendor" title="Dashboard">
            {vendor.status !== 'approved' && (
                <div className={`mb-6 rounded-xl p-4 text-sm ${vendor.status === 'pending' ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800'}`}>
                    {vendor.status === 'pending'
                        ? '⏳ Your shop is awaiting admin approval. You can add products now; they will appear on the storefront once approved.'
                        : '⛔ Your shop has been suspended. Your products are hidden from customers. Please contact support.'}
                </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total sales" value={money(stats.sales)} hint="Excluding cancelled items" />
                <StatCard label="Earned" value={money(stats.earned)} hint={`After ${stats.commission_rate}% commission, delivered only`} accent="text-brand-700" />
                <StatCard label="Available balance" value={money(stats.balance)} hint={<Link href="/vendor/payouts" className="text-brand-700">Withdraw →</Link>} />
                <StatCard label="Orders to fulfil" value={stats.pending_items} hint={`${stats.products} products · ${stats.low_stock} low stock`} accent="text-amber-600" />
            </div>

            <div className="card mt-6 overflow-x-auto">
                <div className="flex items-center justify-between p-4">
                    <h2 className="font-semibold">Recent order items</h2>
                    <Link href="/vendor/orders" className="text-sm font-semibold text-brand-700">View all</Link>
                </div>
                <table className="table">
                    <thead>
                        <tr><th>Order</th><th>Product</th><th>Qty</th><th>Earning</th><th>Status</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                        {recentItems.map((item) => (
                            <tr key={item.id}>
                                <td className="font-mono">{item.order.number}</td>
                                <td>{item.product_name}</td>
                                <td>{item.quantity}</td>
                                <td className="font-semibold">{money(item.vendor_earning)}</td>
                                <td><StatusBadge status={item.status} /></td>
                                <td>{date(item.created_at)}</td>
                            </tr>
                        ))}
                        {!recentItems.length && (
                            <tr><td colSpan={6} className="py-8 text-center text-slate-500">No orders yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </PanelLayout>
    );
}
