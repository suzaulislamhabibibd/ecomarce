import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FilterTabs from '../../Components/FilterTabs';
import Pagination from '../../Components/Pagination';
import PanelLayout from '../../Layouts/PanelLayout';
import { date } from '../../lib/format';

export default function Users({ users, filters }) {
    const { auth } = usePage().props;
    const [q, setQ] = useState(filters.q || '');

    return (
        <PanelLayout type="admin" title="Users">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <FilterTabs base="/admin/users" param="role" current={filters.role} options={[['', 'All'], ['customer', 'Customers'], ['vendor', 'Vendors'], ['admin', 'Admins']]} />
                <form
                    className="mb-4 flex gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        router.get('/admin/users', { ...filters, q }, { preserveState: true });
                    }}
                >
                    <input className="input" placeholder="Name or email" value={q} onChange={(e) => setQ(e.target.value)} />
                    <button className="btn-secondary">Search</button>
                </form>
            </div>
            <div className="card overflow-x-auto">
                <table className="table">
                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Orders</th><th>Joined</th><th>Status</th><th /></tr></thead>
                    <tbody>
                        {users.data.map((u) => (
                            <tr key={u.id}>
                                <td className="font-medium">{u.name}</td>
                                <td>{u.email}</td>
                                <td className="capitalize">{u.role}</td>
                                <td>{u.orders_count}</td>
                                <td>{date(u.created_at)}</td>
                                <td>
                                    <span className={`text-xs font-semibold ${u.is_active ? 'text-emerald-700' : 'text-rose-600'}`}>
                                        {u.is_active ? 'Active' : 'Deactivated'}
                                    </span>
                                </td>
                                <td className="text-right">
                                    {u.id !== auth.user.id && (
                                        <button
                                            onClick={() => router.post(`/admin/users/${u.id}/toggle-active`, {}, { preserveScroll: true })}
                                            className="btn-secondary btn-sm"
                                        >
                                            {u.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination paginator={users} />
        </PanelLayout>
    );
}
