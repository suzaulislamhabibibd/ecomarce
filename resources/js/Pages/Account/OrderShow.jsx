import { Link, router } from '@inertiajs/react';
import StatusBadge from '../../Components/StatusBadge';
import ShopLayout from '../../Layouts/ShopLayout';
import { date, money } from '../../lib/format';

export default function OrderShow({ order, cancellable }) {
    const cancel = () => {
        if (confirm('Cancel this order?')) router.post(`/account/orders/${order.id}/cancel`, {}, { preserveScroll: true });
    };

    return (
        <ShopLayout title={`Order ${order.number}`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <Link href="/account/orders" className="text-sm text-brand-700">← My orders</Link>
                    <h1 className="text-2xl font-bold">
                        Order <span className="font-mono">{order.number}</span>
                    </h1>
                    <p className="text-sm text-slate-500">Placed on {date(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    {cancellable && (
                        <button onClick={cancel} className="btn-danger btn-sm">
                            Cancel order
                        </button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="card overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Seller</th>
                                <th>Qty</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        {item.product ? (
                                            <Link href={`/product/${item.product.slug}`} className="font-medium hover:text-brand-700">
                                                {item.product_name}
                                            </Link>
                                        ) : (
                                            item.product_name
                                        )}
                                        <div className="text-xs text-slate-500">{money(item.unit_price)} each</div>
                                    </td>
                                    <td>{item.vendor?.shop_name}</td>
                                    <td>{item.quantity}</td>
                                    <td className="font-semibold">{money(item.line_total)}</td>
                                    <td><StatusBadge status={item.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="space-y-4">
                    <div className="card p-5 text-sm">
                        <h2 className="mb-2 font-semibold">Payment</h2>
                        <div className="flex justify-between"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
                        <div className="flex justify-between"><span>Shipping</span><span>{money(order.shipping_fee)}</span></div>
                        <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base font-bold"><span>Total</span><span>{money(order.total)}</span></div>
                        <div className="mt-3 flex items-center justify-between">
                            <span>Cash on delivery</span>
                            <StatusBadge status={order.payment_status} />
                        </div>
                    </div>
                    <div className="card p-5 text-sm">
                        <h2 className="mb-2 font-semibold">Shipping to</h2>
                        <p className="font-medium">{order.shipping_name}</p>
                        <p>{order.shipping_phone}</p>
                        <p>{order.shipping_address}, {order.shipping_city}</p>
                        {order.note && <p className="mt-2 text-slate-500">Note: {order.note}</p>}
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}
