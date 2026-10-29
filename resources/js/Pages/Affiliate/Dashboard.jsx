import { Link } from '@inertiajs/react';
import QrCard from '../../Components/QrCard';
import StatCard from '../../Components/StatCard';
import StatusBadge from '../../Components/StatusBadge';
import PanelLayout from '../../Layouts/PanelLayout';
import { date, money } from '../../lib/format';

export default function Dashboard({ affiliate, stats, homeLink, topProducts, recentCommissions }) {
    const approved = affiliate.status === 'approved';

    return (
        <PanelLayout type="affiliate" title="Affiliate dashboard">
            {!approved && (
                <div className={`mb-6 rounded-xl p-4 text-sm ${affiliate.status === 'pending' ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800'}`}>
                    {affiliate.status === 'pending'
                        ? '⏳ Your affiliate account is awaiting admin approval. Your links start earning once approved.'
                        : '⛔ Your affiliate account is suspended. Your links no longer earn commission.'}
                </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Clicks" value={stats.clicks} hint={`${stats.conversion}% conversion`} />
                <StatCard label="Referred orders" value={stats.orders} hint={`You earn ${stats.rate}% per order`} />
                <StatCard label="Pending earnings" value={money(stats.pending)} hint="Confirmed when orders are delivered" accent="text-amber-600" />
                <StatCard label="Available balance" value={money(stats.balance)} hint={<Link href="/affiliate/payouts" className="text-brand-700">Withdraw →</Link>} accent="text-brand-700" />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                    <div className="card p-5">
                        <h2 className="font-semibold">Your referral code</h2>
                        <div className="mt-2 inline-block rounded-lg bg-brand-50 px-4 py-2 font-mono text-2xl font-bold tracking-widest text-brand-700">
                            {affiliate.code}
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                            Add <code className="rounded bg-slate-100 px-1">?ref={affiliate.code}</code> to any product link, or build links and QR codes on the{' '}
                            <Link href="/affiliate/links" className="font-semibold text-brand-700">Links &amp; QR</Link> page.
                        </p>
                    </div>
                    <div className="card overflow-x-auto">
                        <div className="flex items-center justify-between p-4">
                            <h2 className="font-semibold">Recent commissions</h2>
                            <Link href="/affiliate/commissions" className="text-sm font-semibold text-brand-700">View all</Link>
                        </div>
                        <table className="table">
                            <thead><tr><th>Order</th><th>Order amount</th><th>Commission</th><th>Status</th><th>Date</th></tr></thead>
                            <tbody>
                                {recentCommissions.map((c) => (
                                    <tr key={c.id}>
                                        <td className="font-mono">{c.order?.number}</td>
                                        <td>{money(c.order_amount)}</td>
                                        <td className="font-semibold text-brand-700">{money(c.amount)}</td>
                                        <td><StatusBadge status={c.status} /></td>
                                        <td>{date(c.created_at)}</td>
                                    </tr>
                                ))}
                                {!recentCommissions.length && <tr><td colSpan={5} className="py-8 text-center text-slate-500">No referred orders yet. Share your links!</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="card p-5">
                        <QrCard value={`${homeLink}&src=qr`} title="Store QR code" caption="Print it or post it. Anyone who scans it is credited to you." fileName={`haatbazar-${affiliate.code}`} />
                    </div>
                    <div className="card p-5">
                        <h2 className="mb-3 font-semibold">Most clicked products</h2>
                        <ol className="space-y-2 text-sm">
                            {topProducts.map((t) => (
                                <li key={t.product_id} className="flex justify-between gap-2">
                                    <span className="truncate">{t.product?.name}</span>
                                    <span className="font-semibold">{t.clicks}</span>
                                </li>
                            ))}
                            {!topProducts.length && <li className="text-slate-500">No clicks yet.</li>}
                        </ol>
                    </div>
                </div>
            </div>
        </PanelLayout>
    );
}
