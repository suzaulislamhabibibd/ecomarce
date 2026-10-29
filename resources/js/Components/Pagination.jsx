import { Link } from '@inertiajs/react';

export default function Pagination({ paginator }) {
    if (!paginator || paginator.last_page <= 1) return null;

    return (
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-1">
            {paginator.links.map((link, i) => {
                const label = link.label.replace('&laquo;', '«').replace('&raquo;', '»');
                return link.url ? (
                    <Link
                        key={i}
                        href={link.url}
                        preserveScroll
                        className={`min-w-9 rounded-md px-3 py-1.5 text-center text-sm ${
                            link.active ? 'bg-brand-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                        } border border-slate-200`}
                    >
                        {label}
                    </Link>
                ) : (
                    <span key={i} className="min-w-9 rounded-md px-3 py-1.5 text-center text-sm text-slate-400">
                        {label}
                    </span>
                );
            })}
        </nav>
    );
}
