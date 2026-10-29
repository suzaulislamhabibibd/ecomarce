import { router } from '@inertiajs/react';
import { useState } from 'react';
import Pagination from '../../Components/Pagination';
import ProductImage from '../../Components/ProductImage';
import QrCard from '../../Components/QrCard';
import PanelLayout from '../../Layouts/PanelLayout';
import { money } from '../../lib/format';

export default function Links({ products, filters, approved }) {
    const [q, setQ] = useState(filters.q || '');
    const [open, setOpen] = useState(null);

    return (
        <PanelLayout type="affiliate" title="Links & QR codes">
            {!approved && (
                <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Links will start earning once your account is approved.</div>
            )}
            <form
                className="mb-4 flex max-w-md gap-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    router.get('/affiliate/links', q ? { q } : {}, { preserveState: true });
                }}
            >
                <input className="input" placeholder="Search products to promote" value={q} onChange={(e) => setQ(e.target.value)} />
                <button className="btn-secondary">Search</button>
            </form>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {products.data.map((p) => (
                    <div key={p.id} className="card p-4">
                        <div className="flex gap-3">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                                <ProductImage src={p.image_url} name={p.name} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="truncate font-medium">{p.name}</div>
                                <div className="text-xs text-slate-500">{p.vendor}</div>
                                <div className="text-sm">
                                    {money(p.price)} · <span className="font-semibold text-brand-700">earn {money(p.commission)}</span>
                                </div>
                            </div>
                        </div>
                        <input readOnly value={p.link} className="input mt-3 font-mono text-xs" onFocus={(e) => e.target.select()} aria-label="Referral link" />
                        {open === p.id ? (
                            <div className="mt-3">
                                <QrCard value={`${p.link}&src=qr`} size={140} fileName={`qr-${p.id}`} />
                            </div>
                        ) : (
                            <button onClick={() => setOpen(p.id)} className="btn-secondary btn-sm mt-3 w-full">
                                Show QR code
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <Pagination paginator={products} />
        </PanelLayout>
    );
}
