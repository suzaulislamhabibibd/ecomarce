import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Flash from '../Components/Flash';

function UserMenu({ user }) {
    const [open, setOpen] = useState(false);
    const panel = user.role === 'admin' ? ['/admin', 'Admin panel'] : user.role === 'vendor' ? ['/vendor', 'Seller dashboard'] : null;

    return (
        <div className="relative">
            <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-100">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                    {user.name.charAt(0)}
                </span>
                <span className="hidden font-medium md:inline">{user.name.split(' ')[0]}</span>
            </button>
            {open && (
                <div className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg">
                    {panel && (
                        <Link href={panel[0]} className="block px-4 py-2 font-semibold text-brand-700 hover:bg-slate-50">
                            {panel[1]}
                        </Link>
                    )}
                    <Link href="/account/orders" className="block px-4 py-2 hover:bg-slate-50">
                        My orders
                    </Link>
                    {user.role === 'customer' && (
                        <Link href="/sell" className="block px-4 py-2 hover:bg-slate-50">
                            Become a seller
                        </Link>
                    )}
                    <button onClick={() => router.post('/logout')} className="block w-full px-4 py-2 text-left text-rose-600 hover:bg-slate-50">
                        Log out
                    </button>
                </div>
            )}
        </div>
    );
}

export default function ShopLayout({ title, children }) {
    const { auth, cartCount, settings, navCategories } = usePage().props;
    const [search, setSearch] = useState(() =>
        typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') || '' : '',
    );

    const submitSearch = (e) => {
        e.preventDefault();
        router.get('/products', search ? { q: search } : {});
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Head title={title} />
            <Flash />
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-brand-700">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">H</span>
                        <span className="hidden sm:inline">{settings.site_name}</span>
                    </Link>
                    <form onSubmit={submitSearch} className="flex flex-1">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="input rounded-r-none"
                            aria-label="Search products"
                        />
                        <button className="btn-primary rounded-l-none">Search</button>
                    </form>
                    <Link href="/cart" className="relative rounded-lg p-2 hover:bg-slate-100" aria-label="Cart">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-xs font-bold text-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    {auth.user ? (
                        <UserMenu user={auth.user} />
                    ) : (
                        <div className="flex items-center gap-2 text-sm">
                            <Link href="/login" className="font-medium hover:text-brand-700">
                                Login
                            </Link>
                            <Link href="/register" className="btn-primary btn-sm hidden sm:inline-flex">
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
                <nav className="border-t border-slate-100 bg-white">
                    <div className="mx-auto flex max-w-7xl gap-5 overflow-x-auto px-4 py-2 text-sm whitespace-nowrap text-slate-600">
                        <Link href="/products" className="font-semibold hover:text-brand-700">
                            All products
                        </Link>
                        <Link href="/stores" className="font-semibold hover:text-brand-700">
                            Stores
                        </Link>
                        {navCategories.map((c) => (
                            <Link key={c.id} href={`/products?category=${c.slug}`} className="hover:text-brand-700">
                                {c.name}
                            </Link>
                        ))}
                    </div>
                </nav>
            </header>

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>

            <footer className="mt-10 bg-slate-900 text-slate-400">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm sm:grid-cols-3">
                    <div>
                        <div className="text-lg font-bold text-white">{settings.site_name}</div>
                        <p className="mt-2">Bangladesh's multivendor marketplace. Shop from trusted local sellers, pay cash on delivery.</p>
                    </div>
                    <div>
                        <div className="font-semibold text-white">Shop</div>
                        <ul className="mt-2 space-y-1">
                            <li><Link href="/products" className="hover:text-white">All products</Link></li>
                            <li><Link href="/stores" className="hover:text-white">All stores</Link></li>
                            <li><Link href="/account/orders" className="hover:text-white">Track my order</Link></li>
                        </ul>
                    </div>
                    <div>
                        <div className="font-semibold text-white">Sell with us</div>
                        <p className="mt-2">Open your shop and reach customers nationwide.</p>
                        <Link href="/register?vendor=1" className="btn-primary btn-sm mt-3">
                            Start selling
                        </Link>
                    </div>
                </div>
                <div className="border-t border-slate-800 py-4 text-center text-xs">
                    © {new Date().getFullYear()} {settings.site_name}. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
