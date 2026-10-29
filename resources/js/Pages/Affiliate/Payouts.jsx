import { useForm } from '@inertiajs/react';
import { Select, TextInput } from '../../Components/Form';
import Pagination from '../../Components/Pagination';
import StatCard from '../../Components/StatCard';
import StatusBadge from '../../Components/StatusBadge';
import PanelLayout from '../../Layouts/PanelLayout';
import { date, money } from '../../lib/format';

export default function Payouts({ payouts, balance, earned }) {
    const { data, setData, post, processing, errors, reset } = useForm({ amount: '', method: 'bkash', account: '' });

    const submit = (e) => {
        e.preventDefault();
        post('/affiliate/payouts', { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <PanelLayout type="affiliate" title="Payouts">
            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                <div>
                    <div className="mb-6 grid gap-4 sm:grid-cols-2">
                        <StatCard label="Total earned" value={money(earned)} hint="Approved commissions" />
                        <StatCard label="Available to withdraw" value={money(balance)} accent="text-brand-700" />
                    </div>
                    <div className="card overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr><th>Date</th><th>Amount</th><th>Method</th><th>Status</th><th>Note</th></tr>
                            </thead>
                            <tbody>
                                {payouts.data.map((p) => (
                                    <tr key={p.id}>
                                        <td>{date(p.created_at)}</td>
                                        <td className="font-semibold">{money(p.amount)}</td>
                                        <td className="capitalize">{p.method} · {p.account}</td>
                                        <td><StatusBadge status={p.status} /></td>
                                        <td className="text-xs text-slate-500">{p.admin_note}</td>
                                    </tr>
                                ))}
                                {!payouts.data.length && <tr><td colSpan={5} className="py-8 text-center text-slate-500">No withdrawals yet.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <Pagination paginator={payouts} />
                </div>
                <form onSubmit={submit} className="card h-fit space-y-4 p-6">
                    <h2 className="font-semibold">Request withdrawal</h2>
                    <TextInput label="Amount (৳)" type="number" min="100" step="0.01" max={balance} value={data.amount} onChange={(e) => setData('amount', e.target.value)} error={errors.amount} hint="Minimum ৳100" required />
                    <Select label="Method" value={data.method} onChange={(e) => setData('method', e.target.value)} error={errors.method}>
                        <option value="bkash">bKash</option>
                        <option value="nagad">Nagad</option>
                        <option value="rocket">Rocket</option>
                        <option value="bank">Bank transfer</option>
                    </Select>
                    <TextInput label="Account number" value={data.account} onChange={(e) => setData('account', e.target.value)} error={errors.account} required />
                    <button className="btn-primary w-full" disabled={processing || balance < 100}>
                        Request payout
                    </button>
                </form>
            </div>
        </PanelLayout>
    );
}
