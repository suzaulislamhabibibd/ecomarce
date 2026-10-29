import Pagination from '../../Components/Pagination';
import StatusBadge from '../../Components/StatusBadge';
import PanelLayout from '../../Layouts/PanelLayout';
import { date, money } from '../../lib/format';

export default function Commissions({ commissions }) {
    return (
        <PanelLayout type="affiliate" title="Commissions">
            <p className="mb-4 text-sm text-slate-500">
                A commission stays <b>pending</b> until every item in the order is delivered. Cancelled items are deducted automatically.
            </p>
            <div className="card overflow-x-auto">
                <table className="table">
                    <thead><tr><th>Date</th><th>Order</th><th>Order status</th><th>Order amount</th><th>Rate</th><th>Commission</th><th>Status</th></tr></thead>
                    <tbody>
                        {commissions.data.map((c) => (
                            <tr key={c.id}>
                                <td>{date(c.created_at)}</td>
                                <td className="font-mono">{c.order?.number}</td>
                                <td><StatusBadge status={c.order?.status} /></td>
                                <td>{money(c.order_amount)}</td>
                                <td>{c.rate}%</td>
                                <td className="font-semibold text-brand-700">{money(c.amount)}</td>
                                <td><StatusBadge status={c.status} /></td>
                            </tr>
                        ))}
                        {!commissions.data.length && <tr><td colSpan={7} className="py-8 text-center text-slate-500">No commissions yet.</td></tr>}
                    </tbody>
                </table>
            </div>
            <Pagination paginator={commissions} />
        </PanelLayout>
    );
}
