import { router } from '@inertiajs/react';
import FilterTabs from '../../Components/FilterTabs';
import Pagination from '../../Components/Pagination';
import StatusBadge from '../../Components/StatusBadge';
import PanelLayout from '../../Layouts/PanelLayout';
import { date, money } from '../../lib/format';

export default function Payouts({ payouts, filters }) {
    const process = (payout, status) => {
        const note = prompt(status === 'paid' ? 'Transaction ID / note (optional)' : 'Reason for rejection (optional)');
        if (note === null) return;
        router.patch(`/admin/payouts/${payout.id}`, { status, admin_note: note }, { preserveScroll: true });
    };

    return (
        <PanelLayout type="admin" title="Payouts">
            <FilterTabs base="/admin/payouts" current={filters.status} options={[['', 'All'], ['requested', 'Requested'], ['paid', 'Paid'], ['rejected', 'Rejected']]} />
            <div className="card overflow-x-auto">
                <table className="table">
                    <thead><tr><th>Date</th><th>Vendor</th><th>Amount</th><th>Method</th><th>Status</th><th>Note</th><th /></tr></thead>
                    <tbody>
                        {payouts.data.map((p) => (
                            <tr key={p.id}>
                                <td>{date(p.created_at)}</td>
                                <td className="font-medium">{p.vendor?.shop_name}</td>
                                <td className="font-semibold">{money(p.amount)}</td>
                                <td className="capitalize">{p.method} · {p.account}</td>
                                <td><StatusBadge status={p.status} /></td>
                                <td className="text-xs text-slate-500">{p.admin_note}</td>
                                <td className="space-x-2 text-right whitespace-nowrap">
                                    {p.status === 'requested' && (
                                        <>
                                            <button onClick={() => process(p, 'paid')} className="btn-primary btn-sm">Mark paid</button>
                                            <button onClick={() => process(p, 'rejected')} className="btn-secondary btn-sm text-rose-600">Reject</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {!payouts.data.length && <tr><td colSpan={7} className="py-8 text-center text-slate-500">No payout requests.</td></tr>}
                    </tbody>
                </table>
            </div>
            <Pagination paginator={payouts} />
        </PanelLayout>
    );
}
