import { router } from '@inertiajs/react';
import FilterTabs from '../../Components/FilterTabs';
import Pagination from '../../Components/Pagination';
import StatusBadge from '../../Components/StatusBadge';
import PanelLayout from '../../Layouts/PanelLayout';
import { date, money } from '../../lib/format';

export default function Vendors({ vendors, filters }) {
    const update = (vendor, data) => router.patch(`/admin/vendors/${vendor.id}`, data, { preserveScroll: true });

    const editCommission = (vendor) => {
        const value = prompt('Commission rate (%) for this vendor. Leave empty to use the global rate.', vendor.commission_rate ?? '');
        if (value === null) return;
        update(vendor, { commission_rate: value === '' ? null : value });
    };

    return (
        <PanelLayout type="admin" title="Vendors">
            <FilterTabs
                base="/admin/vendors"
                current={filters.status}
                options={[['', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['suspended', 'Suspended']]}
            />
            <div className="card overflow-x-auto">
                <table className="table">
                    <thead><tr><th>Shop</th><th>Owner</th><th>Products</th><th>Sales</th><th>Commission</th><th>Status</th><th /></tr></thead>
                    <tbody>
                        {vendors.data.map((v) => (
                            <tr key={v.id}>
                                <td>
                                    <div className="font-semibold">{v.shop_name}</div>
                                    <div className="text-xs text-slate-500">Joined {date(v.created_at)}</div>
                                </td>
                                <td>
                                    <div>{v.user?.name}</div>
                                    <div className="text-xs text-slate-500">{v.user?.email}</div>
                                </td>
                                <td>{v.products_count}</td>
                                <td>{money(v.sales)}</td>
                                <td>
                                    <button onClick={() => editCommission(v)} className="text-sm text-brand-700 hover:underline">
                                        {v.commission_rate !== null ? `${v.commission_rate}%` : 'Global'}
                                    </button>
                                </td>
                                <td><StatusBadge status={v.status} /></td>
                                <td className="space-x-2 text-right whitespace-nowrap">
                                    {v.status !== 'approved' && (
                                        <button onClick={() => update(v, { status: 'approved' })} className="btn-primary btn-sm">Approve</button>
                                    )}
                                    {v.status !== 'suspended' && (
                                        <button onClick={() => confirm(`Suspend ${v.shop_name}?`) && update(v, { status: 'suspended' })} className="btn-secondary btn-sm text-rose-600">
                                            Suspend
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {!vendors.data.length && <tr><td colSpan={7} className="py-8 text-center text-slate-500">No vendors found.</td></tr>}
                    </tbody>
                </table>
            </div>
            <Pagination paginator={vendors} />
        </PanelLayout>
    );
}
