import { Link, useForm } from '@inertiajs/react';
import { TextInput } from '../../Components/Form';
import ShopLayout from '../../Layouts/ShopLayout';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({ email: '', password: '', remember: false });

    const submit = (e) => {
        e.preventDefault();
        post('/login', { onFinish: () => setData('password', '') });
    };

    return (
        <ShopLayout title="Login">
            <div className="card mx-auto max-w-md p-8">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="mt-1 text-sm text-slate-500">Log in to your account</p>
                <form onSubmit={submit} className="mt-6 space-y-4">
                    <TextInput label="Email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} autoComplete="email" required autoFocus />
                    <TextInput label="Password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} error={errors.password} autoComplete="current-password" required />
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                        Remember me
                    </label>
                    <button className="btn-primary w-full" disabled={processing}>
                        Log in
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-500">
                    New here?{' '}
                    <Link href="/register" className="font-semibold text-brand-700">
                        Create an account
                    </Link>
                </p>
            </div>
        </ShopLayout>
    );
}
