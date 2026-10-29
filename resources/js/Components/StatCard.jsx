export default function StatCard({ label, value, hint, accent = 'text-slate-900' }) {
    return (
        <div className="card p-5">
            <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</div>
            <div className={`mt-2 text-2xl font-bold ${accent}`}>{value}</div>
            {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
        </div>
    );
}
