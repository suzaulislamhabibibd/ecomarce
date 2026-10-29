import { useForm } from '@inertiajs/react';
import { TextInput } from '../../Components/Form';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Settings({ values }) {
    const { data, setData, put, processing, errors } = useForm({
        site_name: values.site_name,
        commission_rate: values.commission_rate,
        shipping_fee: values.shipping_fee,
    });

    return (
        <PanelLayout type="admin" title="Settings">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    put('/admin/settings', { preserveScroll: true });
                }}
                className="card max-w-xl space-y-4 p-6"
            >
                <TextInput label="Marketplace name" value={data.site_name} onChange={(e) => setData('site_name', e.target.value)} error={errors.site_name} required />
                <TextInput
                    label="Default commission rate (%)"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={data.commission_rate}
                    onChange={(e) => setData('commission_rate', e.target.value)}
                    error={errors.commission_rate}
                    hint="Applied to new orders. Vendors can have a custom rate."
                    required
                />
                <TextInput
                    label="Shipping fee per order (৳)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.shipping_fee}
                    onChange={(e) => setData('shipping_fee', e.target.value)}
                    error={errors.shipping_fee}
                    required
                />
                <button className="btn-primary" disabled={processing}>Save settings</button>
            </form>
        </PanelLayout>
    );
}
