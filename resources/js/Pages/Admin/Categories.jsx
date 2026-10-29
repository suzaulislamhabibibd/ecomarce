import { router, useForm } from '@inertiajs/react';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Categories({ categories }) {
    const { data, setData, post, processing, errors, reset } = useForm({ name: '' });

    const rename = (category) => {
        const name = prompt('New name', category.name);
        if (name && name !== category.name) router.put(`/admin/categories/${category.id}`, { name }, { preserveScroll: true });
    };

    const destroy = (category) => {
        if (confirm(`Delete "${category.name}"? ${category.products_count} products will become uncategorised.`)) {
            router.delete(`/admin/categories/${category.id}`, { preserveScroll: true });
        }
    };

    return (
        <PanelLayout type="admin" title="Categories">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post('/admin/categories', { preserveScroll: true, onSuccess: () => reset() });
                }}
                className="mb-6 flex max-w-md gap-2"
            >
                <div className="flex-1">
                    <input className="input" placeholder="New category name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                    {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                </div>
                <button className="btn-primary" disabled={processing}>Add</button>
            </form>
            <div className="card max-w-2xl overflow-x-auto">
                <table className="table">
                    <thead><tr><th>Name</th><th>Slug</th><th>Products</th><th /></tr></thead>
                    <tbody>
                        {categories.map((c) => (
                            <tr key={c.id}>
                                <td className="font-medium">{c.name}</td>
                                <td className="font-mono text-xs text-slate-500">{c.slug}</td>
                                <td>{c.products_count}</td>
                                <td className="space-x-3 text-right">
                                    <button onClick={() => rename(c)} className="text-sm font-semibold text-brand-700">Rename</button>
                                    <button onClick={() => destroy(c)} className="text-sm font-semibold text-rose-600">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </PanelLayout>
    );
}
