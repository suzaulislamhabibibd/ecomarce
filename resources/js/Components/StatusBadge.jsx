const styles = {
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-sky-100 text-sky-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-rose-100 text-rose-800',
    approved: 'bg-emerald-100 text-emerald-800',
    suspended: 'bg-rose-100 text-rose-800',
    active: 'bg-emerald-100 text-emerald-800',
    draft: 'bg-slate-200 text-slate-700',
    blocked: 'bg-rose-100 text-rose-800',
    requested: 'bg-amber-100 text-amber-800',
    paid: 'bg-emerald-100 text-emerald-800',
    unpaid: 'bg-slate-200 text-slate-700',
    rejected: 'bg-rose-100 text-rose-800',
};

export default function StatusBadge({ status }) {
    return (
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status] || 'bg-slate-100'}`}>
            {status}
        </span>
    );
}
