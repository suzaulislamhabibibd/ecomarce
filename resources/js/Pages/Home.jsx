import { Link } from '@inertiajs/react';
import ProductCard from '../Components/ProductCard';
import ShopLayout from '../Layouts/ShopLayout';

function Section({ title, link, children }) {
    return (
        <section className="mt-10">
            <div className="mb-4 flex items-end justify-between">
                <h2 className="text-xl font-bold">{title}</h2>
                {link && (
                    <Link href={link} className="text-sm font-semibold text-brand-700 hover:underline">
                        View all →
                    </Link>
                )}
            </div>
            {children}
        </section>
    );
}

export default function Home({ latest, deals, categories, vendors }) {
    return (
        <ShopLayout>
            <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-teal-500 px-6 py-12 text-white sm:px-12">
                <div className="max-w-xl">
                    <p className="text-sm font-semibold tracking-wide text-brand-100 uppercase">Multivendor marketplace</p>
                    <h1 className="mt-2 text-3xl leading-tight font-bold sm:text-5xl">Everything you need, from sellers you trust.</h1>
                    <p className="mt-4 text-brand-50">Thousands of products from verified local shops. Cash on delivery across Bangladesh.</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link href="/products" className="btn bg-white text-brand-700 hover:bg-brand-50">
                            Shop now
                        </Link>
                        <Link href="/register?vendor=1" className="btn border border-white/60 text-white hover:bg-white/10">
                            Become a seller
                        </Link>
                    </div>
                </div>
            </section>

            <Section title="Shop by category">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {categories.map((c) => (
                        <Link key={c.id} href={`/products?category=${c.slug}`} className="card p-4 text-center transition hover:border-brand-500">
                            <div className="font-semibold">{c.name}</div>
                            <div className="text-xs text-slate-500">{c.products_count} products</div>
                        </Link>
                    ))}
                </div>
            </Section>

            {deals.length > 0 && (
                <Section title="🔥 Hot deals" link="/products">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {deals.map((p) => <ProductCard key={p.id} product={p} />)}
                    </div>
                </Section>
            )}

            <Section title="New arrivals" link="/products">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {latest.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
            </Section>

            <Section title="Featured stores" link="/stores">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {vendors.map((v) => (
                        <Link key={v.id} href={`/store/${v.slug}`} className="card flex flex-col items-center p-4 text-center transition hover:border-brand-500">
                            {v.logo_url ? (
                                <img src={v.logo_url} alt={v.shop_name} className="h-14 w-14 rounded-full object-cover" />
                            ) : (
                                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
                                    {v.shop_name.charAt(0)}
                                </span>
                            )}
                            <div className="mt-2 text-sm font-semibold">{v.shop_name}</div>
                            <div className="text-xs text-slate-500">{v.products_count} products</div>
                        </Link>
                    ))}
                </div>
            </Section>
        </ShopLayout>
    );
}
