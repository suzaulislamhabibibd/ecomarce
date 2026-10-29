import { Link } from '@inertiajs/react';
import StatCard from '../../Components/StatCard';
import StatusBadge from '../../Components/StatusBadge';
import PanelLayout from '../../Layouts/PanelLayout';
import { date, money } from '../../lib/format';

export default function Dashboard({ stats, recentOrders, topVendors }) {
    return (
        <PanelLayout type="admin" title="Dashboard">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Gross sales (GMV)" value={money(stats.gmv)} hint={`${stats.orders} orders`} />
                <StatCard
                    label="Commission earned"
                    value={money(stats.commission)}
                    hint={`${money(stats.affiliate_commission)} owed to affiliates`}
                    accent="text-brand-700"
                />
                <StatCard label="Vendors" value={stats.vendors} hint={<Link href="/admin/vendors?status=pending" className="text-amber-600">{stats.pending_vendors} awaiting approval</Link>} />
                <StatCard label="Customers" value={stats.customers} hint={`${stats.products} products · ${stats.pending_payouts} payout requests`} />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
                <div className="card overflow-x-auto">
                    <div className="flex items-center justify-between p-4">
                        <h2 className="font-semibold">Recent orders</h2>
                        <Link href="/admin/orders" className="text-sm font-semibold text-brand-700">View all</Link>
                    </div>
                    <table className="table">
                        <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                        <tbody>
                            {recentOrders.map((o) => (
                                <tr key={o.id}>
                                    <td><Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold text-brand-700">{o.number}</Link></td>
                                    <td>{o.user?.name}</td>
                                    <td className="font-semibold">{money(o.total)}</td>
                                    <td><StatusBadge status={o.status} /></td>
                                    <td>{date(o.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="card p-4">
                    <h2 className="mb-3 font-semibold">Top vendors</h2>
                    <ol className="space-y-2">
                        {topVendors.map((v, i) => (
                            <li key={v.id} className="flex items-center justify-between text-sm">
                                <span>
                                    <span className="mr-2 text-slate-400">{i + 1}.</span>
                                    {v.shop_name}
                                </span>
                                <span className="font-semibold">{money(v.sales)}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </PanelLayout>
    );
}
