import { Link } from '@inertiajs/react';
import Pagination from '../../Components/Pagination';
import StatusBadge from '../../Components/StatusBadge';
import ShopLayout from '../../Layouts/ShopLayout';
import { date, money } from '../../lib/format';

export default function Orders({ orders }) {
    return (
        <ShopLayout title="My orders">
            <h1 className="mb-4 text-2xl font-bold">My orders</h1>
            {orders.data.length ? (
                <div className="card overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.map((o) => (
                                <tr key={o.id}>
                                    <td className="font-mono font-semibold">{o.number}</td>
                                    <td>{date(o.created_at)}</td>
                                    <td>{o.items_count}</td>
                                    <td className="font-semibold">{money(o.total)}</td>
                                    <td><StatusBadge status={o.status} /></td>
                                    <td className="text-right">
                                        <Link href={`/account/orders/${o.id}`} className="text-sm font-semibold text-brand-700 hover:underline">
                                            Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card p-12 text-center text-slate-500">
                    You have no orders yet.{' '}
                    <Link href="/products" className="font-semibold text-brand-700">
                        Start shopping
                    </Link>
                </div>
            )}
            <Pagination paginator={orders} />
        </ShopLayout>
    );
}
