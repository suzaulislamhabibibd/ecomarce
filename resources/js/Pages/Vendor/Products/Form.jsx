import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Field, Select, TextArea, TextInput } from '../../../Components/Form';
import PanelLayout from '../../../Layouts/PanelLayout';

export default function ProductForm({ product, categories }) {
    const editing = Boolean(product);
    const [preview, setPreview] = useState(product?.image_url || null);
    const { data, setData, post, processing, errors, transform } = useForm({
        name: product?.name || '',
        category_id: product?.category_id || '',
        description: product?.description || '',
        price: product?.price ?? '',
        compare_price: product?.compare_price ?? '',
        stock: product?.stock ?? 10,
        status: product?.status === 'draft' ? 'draft' : 'active',
        image: null,
    });

    const submit = (e) => {
        e.preventDefault();
        // Files need multipart POST; spoof PUT for updates.
        transform((d) => (editing ? { ...d, _method: 'put' } : d));
        post(editing ? `/vendor/products/${product.id}` : '/vendor/products', { forceFormData: true });
    };

    const pickImage = (e) => {
        const file = e.target.files[0];
        setData('image', file || null);
        setPreview(file ? URL.createObjectURL(file) : product?.image_url || null);
    };

    return (
        <PanelLayout type="vendor" title={editing ? 'Edit product' : 'Add product'}>
            {product?.status === 'blocked' && (
                <div className="mb-4 rounded-lg bg-rose-50 p-4 text-sm text-rose-800">
                    This product has been blocked by an admin and is hidden from customers.
                </div>
            )}
            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="card space-y-4 p-6">
                    <TextInput label="Product name" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} required />
                    <TextArea label="Description" value={data.description} onChange={(e) => setData('description', e.target.value)} error={errors.description} rows={6} />
                    <div className="grid gap-4 sm:grid-cols-3">
                        <TextInput label="Price (৳)" type="number" step="0.01" min="1" value={data.price} onChange={(e) => setData('price', e.target.value)} error={errors.price} required />
                        <TextInput label="Compare-at price (৳)" type="number" step="0.01" value={data.compare_price} onChange={(e) => setData('compare_price', e.target.value)} error={errors.compare_price} hint="Original price, shows a discount" />
                        <TextInput label="Stock" type="number" min="0" value={data.stock} onChange={(e) => setData('stock', e.target.value)} error={errors.stock} required />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="card space-y-4 p-6">
                        <Select label="Status" value={data.status} onChange={(e) => setData('status', e.target.value)} error={errors.status}>
                            <option value="active">Active (visible)</option>
                            <option value="draft">Draft (hidden)</option>
                        </Select>
                        <Select label="Category" value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} error={errors.category_id}>
                            <option value="">Uncategorised</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </Select>
                        <Field label="Image" error={errors.image} hint="JPG, PNG or WebP, max 2MB">
                            {preview && <img src={preview} alt="" className="mb-2 aspect-square w-full rounded-lg object-cover" />}
                            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickImage} className="text-sm" />
                        </Field>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-primary flex-1" disabled={processing}>
                            {editing ? 'Save changes' : 'Create product'}
                        </button>
                        <Link href="/vendor/products" className="btn-secondary">Cancel</Link>
                    </div>
                </div>
            </form>
        </PanelLayout>
    );
}
