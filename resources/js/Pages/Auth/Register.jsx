import { Link, useForm } from '@inertiajs/react';
import { TextInput } from '../../Components/Form';
import ShopLayout from '../../Layouts/ShopLayout';

export default function Register({ asVendor }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        as_vendor: asVendor,
        shop_name: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <ShopLayout title="Create account">
            <div className="card mx-auto max-w-lg p-8">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 text-sm font-semibold">
                    <button type="button" onClick={() => setData('as_vendor', false)} className={`rounded-md py-2 ${!data.as_vendor ? 'bg-white shadow' : 'text-slate-500'}`}>
                        I want to shop
                    </button>
                    <button type="button" onClick={() => setData('as_vendor', true)} className={`rounded-md py-2 ${data.as_vendor ? 'bg-white shadow' : 'text-slate-500'}`}>
                        I want to sell
                    </button>
                </div>
                <form onSubmit={submit} className="mt-6 space-y-4">
                    <TextInput label="Full name" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} required />
                    {data.as_vendor && (
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
                        {data.as_vendor ? 'Create seller account' : 'Create account'}
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
