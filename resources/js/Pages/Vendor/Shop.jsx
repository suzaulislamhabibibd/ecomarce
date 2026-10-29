import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Field, TextArea, TextInput } from '../../Components/Form';
import StatusBadge from '../../Components/StatusBadge';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Shop({ vendor }) {
    const [preview, setPreview] = useState(vendor.logo_url);
    const { data, setData, post, processing, errors } = useForm({
        shop_name: vendor.shop_name,
        description: vendor.description || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        logo: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/vendor/shop', { forceFormData: true, preserveScroll: true });
    };

    return (
        <PanelLayout type="vendor" title="Shop settings">
            <form onSubmit={submit} className="card max-w-2xl space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        Status: <StatusBadge status={vendor.status} />
                    </div>
                    {vendor.status === 'approved' && (
                        <Link href={`/store/${vendor.slug}`} className="text-sm font-semibold text-brand-700">View my store →</Link>
                    )}
                </div>
                <TextInput label="Shop name" value={data.shop_name} onChange={(e) => setData('shop_name', e.target.value)} error={errors.shop_name} required />
                <TextArea label="About the shop" value={data.description} onChange={(e) => setData('description', e.target.value)} error={errors.description} />
                <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput label="Phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} error={errors.phone} />
                    <TextInput label="Address" value={data.address} onChange={(e) => setData('address', e.target.value)} error={errors.address} />
                </div>
                <Field label="Logo" error={errors.logo} hint="Square image, max 1MB">
                    <div className="flex items-center gap-4">
                        {preview && <img src={preview} alt="" className="h-16 w-16 rounded-full object-cover" />}
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="text-sm"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                setData('logo', file || null);
                                setPreview(file ? URL.createObjectURL(file) : vendor.logo_url);
                            }}
                        />
                    </div>
                </Field>
                <button className="btn-primary" disabled={processing}>Save</button>
            </form>
        </PanelLayout>
    );
}
