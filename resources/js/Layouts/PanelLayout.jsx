import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Flash from '../Components/Flash';

const menus = {
    vendor: [
        ['/vendor', 'Dashboard'],
        ['/vendor/products', 'Products'],
        ['/vendor/orders', 'Orders'],
        ['/vendor/payouts', 'Payouts'],
        ['/vendor/shop', 'Shop settings'],
    ],
    affiliate: [
        ['/affiliate', 'Dashboard'],
        ['/affiliate/links', 'Links & QR codes'],
        ['/affiliate/commissions', 'Commissions'],
        ['/affiliate/payouts', 'Payouts'],
    ],
    admin: [
        ['/admin', 'Dashboard'],
        ['/admin/vendors', 'Vendors'],
        ['/admin/products', 'Products'],
        ['/admin/categories', 'Categories'],
        ['/admin/orders', 'Orders'],
        ['/admin/affiliates', 'Affiliates'],
        ['/admin/payouts', 'Payouts'],
        ['/admin/users', 'Users'],
        ['/admin/settings', 'Settings'],
    ],
};

export default function PanelLayout({ type, title, actions, children }) {
    const { url, props } = usePage();
    const { auth, settings } = props;
    const [open, setOpen] = useState(false);
    const path = url.split('?')[0];

    const isActive = (href) => (href === `/${type}` ? path === href : path.startsWith(href));

    const nav = (
        <nav className="space-y-1 p-3">
            {menus[type].map(([href, label]) => (
                <Link
                    key={href}
                    href={href}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                        isActive(href) ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    {label}
                </Link>
            ))}
            <div className="my-3 border-t border-slate-800" />
            <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white">
                ← View storefront
            </Link>
            <button
                onClick={() => router.post('/logout')}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
            >
                Log out
            </button>
        </nav>
    );

    return (
        <div className="min-h-screen lg:flex">
            <Head title={title} />
            <Flash />
            <aside className={`${open ? 'block' : 'hidden'} bg-slate-900 lg:block lg:min-h-screen lg:w-60 lg:shrink-0`}>
                <div className="hidden px-5 py-5 lg:block">
                    <div className="text-lg font-bold text-white">{settings.site_name}</div>
                    <div className="text-xs tracking-wide text-brand-500 uppercase">{{ admin: 'Admin', vendor: 'Seller center', affiliate: 'Affiliate center' }[type]}</div>
                </div>
                {nav}
            </aside>
            <div className="flex-1">
                <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setOpen(!open)} className="rounded-md p-1.5 hover:bg-slate-100 lg:hidden" aria-label="Menu">
                            ☰
                        </button>
                        <h1 className="text-lg font-bold">{title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {actions}
                        <span className="hidden text-sm text-slate-500 sm:inline">{auth.user.name}</span>
                    </div>
                </header>
                <main className="p-4 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
