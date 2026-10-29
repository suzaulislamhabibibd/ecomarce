import { useForm } from '@inertiajs/react';
import { TextInput } from '../../Components/Form';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Settings({ values }) {
    const { data, setData, put, processing, errors } = useForm({
        site_name: values.site_name,
        commission_rate: values.commission_rate,
        shipping_fee: values.shipping_fee,
        affiliate_commission_rate: values.affiliate_commission_rate,
        affiliate_cookie_days: values.affiliate_cookie_days,
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
                <div className="border-t border-slate-200 pt-4 text-sm font-semibold">Affiliate program</div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput
                        label="Affiliate commission (%)"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={data.affiliate_commission_rate}
                        onChange={(e) => setData('affiliate_commission_rate', e.target.value)}
                        error={errors.affiliate_commission_rate}
                        hint="Of the order subtotal, paid by the platform"
                        required
                    />
                    <TextInput
                        label="Referral cookie (days)"
                        type="number"
                        min="1"
                        max="365"
                        value={data.affiliate_cookie_days}
                        onChange={(e) => setData('affiliate_cookie_days', e.target.value)}
                        error={errors.affiliate_cookie_days}
                        required
                    />
                </div>
                <button className="btn-primary" disabled={processing}>Save settings</button>
            </form>
        </PanelLayout>
    );
}
