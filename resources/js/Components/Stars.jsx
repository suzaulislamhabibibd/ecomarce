export default function Stars({ rating, size = 'text-sm' }) {
    const value = Math.round(Number(rating || 0));
    return (
        <span className={`${size} tracking-tight text-amber-400`} aria-label={`${value} out of 5 stars`}>
            {'★'.repeat(value)}
            <span className="text-slate-300">{'★'.repeat(5 - value)}</span>
        </span>
    );
}
