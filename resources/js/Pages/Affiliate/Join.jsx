import { useForm } from '@inertiajs/react';
import { TextInput } from '../../Components/Form';
import ShopLayout from '../../Layouts/ShopLayout';

export default function Join() {
    const { data, setData, post, processing, errors } = useForm({ promo_channel: '' });

    return (
        <ShopLayout title="Join affiliate program">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post('/affiliate/join');
                }}
                className="card mx-auto max-w-lg space-y-4 p-8"
            >
                <h1 className="text-2xl font-bold">Earn with HaatBazar</h1>
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
                    <li>Share product links and QR codes on social media, YouTube or your website</li>
                    <li>Earn commission on every delivered order from your referrals</li>
                    <li>Withdraw to bKash, Nagad, Rocket or your bank</li>
                </ul>
                <TextInput
                    label="Where will you promote?"
                    value={data.promo_channel}
                    onChange={(e) => setData('promo_channel', e.target.value)}
                    error={errors.promo_channel}
                    placeholder="Facebook page, YouTube channel, website..."
                    required
                />
                <button className="btn-primary w-full" disabled={processing}>Apply now</button>
            </form>
        </ShopLayout>
    );
}
