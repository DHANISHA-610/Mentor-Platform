import { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiPlus, FiX, FiCheck, FiEdit2 } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import { useAuth } from '../../hooks/useAuth';

const API_URL = 'http://localhost:5000/api/admin/users';

export default function UserManagementPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'intern' });

  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load users');
      }
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadUsers();
    }
  }, [token]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const newUser = {
      id: Date.now(),
      ...form,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.name}`,
    };
    setUsers((prev) => [newUser, ...prev]);
    setAddModal(false);
    setForm({ name: '', email: '', role: 'intern' });
    showToast('User created successfully');
  };

  const handleEdit = (e) => {
    e.preventDefault();
    setUsers((prev) =>
      prev.map((u) => (u.id === editModal.id ? { ...u, ...form } : u))
    );
    setEditModal(null);
    setForm({ name: '', email: '', role: 'intern' });
    showToast('User updated successfully');
  };

  const handleToggleStatus = () => {
    const user = confirmModal;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );
    setConfirmModal(null);
    showToast(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
  };

  const openEdit = (user) => {
    setForm({ name: user.name, email: user.email, role: user.role });
    setEditModal(user);
  };

  if (error) {
    return (
      <DashboardLayout>
        <PageHeader title="User Management" subtitle="Manage platform users" />
        <ErrorState message="Failed to load users. Please try again." onRetry={loadUsers} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="User Management"
        subtitle="Search, filter, and manage platform users"
        action={
          <button
            onClick={() => { setForm({ name: '', email: '', role: 'intern' }); setAddModal(true); }}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <FiPlus className="h-4 w-4" />
            Add User
          </button>
        }
      />

      {toast && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <FiCheck className="h-4 w-4" />
          {toast}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="all">All Roles</option>
          <option value="intern">Intern</option>
          <option value="mentor">Mentor</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FiSearch}
          title="No users found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">User</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:table-cell">Role</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 md:table-cell">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full bg-slate-100" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
                      {user.role}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-slate-500 md:table-cell">{user.joinedDate}</td>
                  <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(user)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmModal(user)}
                        className={`rounded-lg px-2 py-1 text-xs font-medium ${
                          user.status === 'active'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(addModal || editModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setAddModal(false); setEditModal(null); }} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editModal ? 'Edit User' : 'Add User'}</h2>
              <button onClick={() => { setAddModal(false); setEditModal(null); }} className="text-slate-400 hover:text-slate-600">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={editModal ? handleEdit : handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
                  <option value="intern">Intern</option>
                  <option value="mentor">Mentor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setAddModal(false); setEditModal(null); }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                  {editModal ? 'Save Changes' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmModal(null)} />
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              {confirmModal.status === 'active' ? 'Deactivate' : 'Activate'} User
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to {confirmModal.status === 'active' ? 'deactivate' : 'activate'} {confirmModal.name}?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setConfirmModal(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={handleToggleStatus} className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                confirmModal.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
