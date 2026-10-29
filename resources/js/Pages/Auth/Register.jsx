import { Link, useForm } from '@inertiajs/react';
import { TextInput } from '../../Components/Form';
import ShopLayout from '../../Layouts/ShopLayout';

export default function Register({ accountType }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        account_type: accountType,
        shop_name: '',
        promo_channel: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <ShopLayout title="Create account">
            <div className="card mx-auto max-w-lg p-8">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <div className="mt-4 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 text-sm font-semibold">
                    {[
                        ['customer', 'Shop'],
                        ['vendor', 'Sell'],
                        ['affiliate', 'Affiliate'],
                    ].map(([type, label]) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setData('account_type', type)}
                            className={`rounded-md py-2 ${data.account_type === type ? 'bg-white shadow' : 'text-slate-500'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                {data.account_type === 'affiliate' && (
                    <p className="mt-3 rounded-lg bg-brand-50 p-3 text-xs text-brand-900">
                        Share product links and QR codes and earn commission on every delivered order you refer.
                    </p>
                )}
                <form onSubmit={submit} className="mt-6 space-y-4">
                    <TextInput label="Full name" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} required />
                    {data.account_type === 'affiliate' && (
                        <TextInput
                            label="Where will you promote?"
                            value={data.promo_channel}
                            onChange={(e) => setData('promo_channel', e.target.value)}
                            error={errors.promo_channel}
                            placeholder="Facebook page, YouTube channel, website..."
                            required
                        />
                    )}
                    {data.account_type === 'vendor' && (
                        <TextInput label="Shop name" value={data.shop_name} onChange={(e) => setData('shop_name', e.target.value)} error={errors.shop_name} hint="Your shop goes live after admin approval." required />
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextInput label="Email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} required />
                        <TextInput label="Phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} error={errors.phone} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextInput label="Password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} error={errors.password} autoComplete="new-password" required />
                        <TextInput label="Confirm password" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} autoComplete="new-password" required />
                    </div>
                    <button className="btn-primary w-full" disabled={processing}>
                        {{ vendor: 'Create seller account', affiliate: 'Join affiliate program' }[data.account_type] || 'Create account'}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-brand-700">
                        Log in
                    </Link>
                </p>
            </div>
        </ShopLayout>
    );
}
