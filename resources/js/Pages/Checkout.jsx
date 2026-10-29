import { useForm } from '@inertiajs/react';
import { TextArea, TextInput } from '../Components/Form';
import ShopLayout from '../Layouts/ShopLayout';
import { money } from '../lib/format';

export default function Checkout({ lines, subtotal, shippingFee, total, defaults }) {
    const { data, setData, post, processing, errors } = useForm({
        shipping_name: defaults.shipping_name,
        shipping_phone: defaults.shipping_phone,
        shipping_address: '',
        shipping_city: 'Dhaka',
        note: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/checkout');
    };

    // Group lines by vendor so the customer sees each seller's package.
    const byVendor = lines.reduce((acc, line) => {
        (acc[line.product.vendor.shop_name] ||= []).push(line);
        return acc;
    }, {});

    return (
        <ShopLayout title="Checkout">
            <h1 className="mb-4 text-2xl font-bold">Checkout</h1>
            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
                <div className="card space-y-4 p-6">
                    <h2 className="font-semibold">Shipping details</h2>
                    {errors.cart && <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{errors.cart}</div>}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextInput label="Full name" value={data.shipping_name} onChange={(e) => setData('shipping_name', e.target.value)} error={errors.shipping_name} required />
                        <TextInput label="Phone" value={data.shipping_phone} onChange={(e) => setData('shipping_phone', e.target.value)} error={errors.shipping_phone} placeholder="01XXXXXXXXX" required />
                    </div>
                    <TextInput label="Address" value={data.shipping_address} onChange={(e) => setData('shipping_address', e.target.value)} error={errors.shipping_address} placeholder="House, road, area" required />
                    <TextInput label="City" value={data.shipping_city} onChange={(e) => setData('shipping_city', e.target.value)} error={errors.shipping_city} required />
                    <TextArea label="Order note (optional)" value={data.note} onChange={(e) => setData('note', e.target.value)} error={errors.note} rows={2} />
                    <div className="rounded-lg border-2 border-brand-500 bg-brand-50 p-4">
                        <div className="font-semibold text-brand-900">💵 Cash on Delivery</div>
                        <div className="text-sm text-brand-700">Pay when you receive your order.</div>
                    </div>
                </div>

                <div className="card h-fit p-5">
                    <h2 className="mb-3 font-semibold">Your order</h2>
                    {Object.entries(byVendor).map(([vendor, items]) => (
                        <div key={vendor} className="mb-3 rounded-lg bg-slate-50 p-3">
                            <div className="mb-1 text-xs font-semibold text-slate-500 uppercase">{vendor}</div>
                            {items.map(({ product, quantity, line_total }) => (
                                <div key={product.id} className="flex justify-between text-sm">
                                    <span>
                                        {product.name} × {quantity}
                                    </span>
                                    <span>{money(line_total)}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                    <div className="space-y-1 border-t border-slate-200 pt-3 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{money(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{money(shippingFee)}</span>
                        </div>
                        <div className="flex justify-between pt-2 text-lg font-bold">
                            <span>Total</span>
                            <span className="text-brand-700">{money(total)}</span>
                        </div>
                    </div>
                    <button className="btn-primary mt-4 w-full" disabled={processing}>
                        {processing ? 'Placing order...' : 'Place order'}
                    </button>
                </div>
            </form>
        </ShopLayout>
    );
}
