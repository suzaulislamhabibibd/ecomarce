import { useForm } from '@inertiajs/react';
import { TextArea, TextInput } from '../../Components/Form';
import ShopLayout from '../../Layouts/ShopLayout';

export default function Apply() {
    const { data, setData, post, processing, errors } = useForm({ shop_name: '', phone: '', address: '', description: '' });

    return (
        <ShopLayout title="Become a seller">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post('/sell');
                }}
                className="card mx-auto max-w-lg space-y-4 p-8"
            >
                <h1 className="text-2xl font-bold">Open your shop</h1>
                <p className="text-sm text-slate-500">Reach thousands of customers. We review every application before your shop goes live.</p>
                <TextInput label="Shop name" value={data.shop_name} onChange={(e) => setData('shop_name', e.target.value)} error={errors.shop_name} required />
                <TextInput label="Business phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} error={errors.phone} required />
                <TextInput label="Address" value={data.address} onChange={(e) => setData('address', e.target.value)} error={errors.address} />
                <TextArea label="What do you sell?" value={data.description} onChange={(e) => setData('description', e.target.value)} error={errors.description} />
                <button className="btn-primary w-full" disabled={processing}>Submit application</button>
            </form>
        </ShopLayout>
    );
}
