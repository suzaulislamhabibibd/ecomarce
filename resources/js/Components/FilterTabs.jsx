import { Link } from '@inertiajs/react';

/** Status filter tabs that keep the current page path. */
export default function FilterTabs({ base, param = 'status', current, options }) {
    return (
        <div className="mb-4 flex flex-wrap gap-2">
            {options.map(([value, label]) => (
                <Link
                    key={value}
                    href={value ? `${base}?${param}=${value}` : base}
                    preserveState
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                        (current || '') === value ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {label}
                </Link>
            ))}
        </div>
    );
}
