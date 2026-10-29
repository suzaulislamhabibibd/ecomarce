import { router } from '@inertiajs/react';
import FilterTabs from '../../Components/FilterTabs';
import Pagination from '../../Components/Pagination';
import StatusBadge from '../../Components/StatusBadge';
import PanelLayout from '../../Layouts/PanelLayout';
import { date, money } from '../../lib/format';

export default function Affiliates({ affiliates, filters }) {
    const update = (affiliate, data) => router.patch(`/admin/affiliates/${affiliate.id}`, data, { preserveScroll: true });

    const editRate = (affiliate) => {
        const value = prompt('Commission rate (%) for this affiliate. Leave empty to use the global rate.', affiliate.commission_rate ?? '');
        if (value === null) return;
        update(affiliate, { commission_rate: value === '' ? null : value });
    };

    return (
        <PanelLayout type="admin" title="Affiliates">
            <FilterTabs base="/admin/affiliates" current={filters.status} options={[['', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['suspended', 'Suspended']]} />
            <div className="card overflow-x-auto">
                <table className="table">
                    <thead><tr><th>Affiliate</th><th>Code</th><th>Channel</th><th>Clicks</th><th>Orders</th><th>Earned</th><th>Rate</th><th>Status</th><th /></tr></thead>
                    <tbody>
                        {affiliates.data.map((a) => (
                            <tr key={a.id}>
                                <td>
                                    <div className="font-semibold">{a.user?.name}</div>
                                    <div className="text-xs text-slate-500">{a.user?.email} · {date(a.created_at)}</div>
                                </td>
                                <td className="font-mono">{a.code}</td>
                                <td className="max-w-40 truncate text-xs">{a.promo_channel}</td>
                                <td>{a.clicks_count}</td>
                                <td>{a.orders_count}</td>
                                <td>{money(a.earned)}</td>
                                <td>
                                    <button onClick={() => editRate(a)} className="text-sm text-brand-700 hover:underline">
                                        {a.commission_rate !== null ? `${a.commission_rate}%` : 'Global'}
                                    </button>
                                </td>
                                <td><StatusBadge status={a.status} /></td>
                                <td className="space-x-2 text-right whitespace-nowrap">
                                    {a.status !== 'approved' && <button onClick={() => update(a, { status: 'approved' })} className="btn-primary btn-sm">Approve</button>}
                                    {a.status !== 'suspended' && (
                                        <button onClick={() => confirm(`Suspend ${a.code}?`) && update(a, { status: 'suspended' })} className="btn-secondary btn-sm text-rose-600">
                                            Suspend
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {!affiliates.data.length && <tr><td colSpan={9} className="py-8 text-center text-slate-500">No affiliates found.</td></tr>}
                    </tbody>
                </table>
            </div>
            <Pagination paginator={affiliates} />
        </PanelLayout>
    );
}
