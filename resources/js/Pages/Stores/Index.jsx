import { Link } from '@inertiajs/react';
import Pagination from '../../Components/Pagination';
import ShopLayout from '../../Layouts/ShopLayout';

export default function StoresIndex({ vendors }) {
    return (
        <ShopLayout title="Stores">
            <h1 className="mb-4 text-2xl font-bold">All stores</h1>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {vendors.data.map((v) => (
                    <Link key={v.id} href={`/store/${v.slug}`} className="card flex gap-4 p-5 transition hover:border-brand-500">
                        {v.logo_url ? (
                            <img src={v.logo_url} alt={v.shop_name} className="h-14 w-14 rounded-full object-cover" />
                        ) : (
                            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
                                {v.shop_name.charAt(0)}
                            </span>
                        )}
                        <div>
                            <div className="font-semibold">{v.shop_name}</div>
                            <p className="line-clamp-2 text-sm text-slate-500">{v.description}</p>
                            <div className="mt-1 text-xs text-brand-700">{v.products_count} products</div>
                        </div>
                    </Link>
                ))}
            </div>
            <Pagination paginator={vendors} />
        </ShopLayout>
    );
}
