import { useNavigate } from 'react-router-dom';
import { FiUsers, FiLink, FiClipboard, FiUserCheck, FiArrowRight } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { adminMetrics, adminUsers, mentorApplications } from '../../utils/mockData';

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <PageHeader title="Admin Dashboard" subtitle="Platform overview and management" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FiUsers} label="Total Users" value={adminMetrics.totalUsers} color="blue" />
        <StatCard icon={FiLink} label="Active Pairings" value={adminMetrics.activePairings} color="green" />
        <StatCard icon={FiUserCheck} label="Pending Approvals" value={adminMetrics.pendingApprovals} color="yellow" />
        <StatCard icon={FiClipboard} label="Tasks This Month" value={adminMetrics.tasksThisMonth} color="purple" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {[
          { label: 'Analytics', path: '/analytics' },
          { label: 'User Management', path: '/user-management' },
          { label: 'Mentor Approvals', path: '/mentor-approvals' },
          { label: 'Settings', path: '/settings' },
        ].map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Pending Mentor Approvals</h2>
            <button onClick={() => navigate('/mentor-approvals')} className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700">
              Review all <FiArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {mentorApplications.slice(0, 3).map((app) => (
              <div key={app.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <img src={app.avatar} alt={app.name} className="h-10 w-10 rounded-full bg-slate-100" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{app.name}</p>
                  <p className="text-sm text-slate-500">{app.title} at {app.company}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Users</h2>
            <button onClick={() => navigate('/user-management')} className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700">
              Manage users <FiArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {adminUsers.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <img src={u.avatar} alt={u.name} className="h-10 w-10 rounded-full bg-slate-100" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{u.name}</p>
                  <p className="text-sm text-slate-500">{u.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
                    {u.role}
                  </span>
                  <StatusBadge status={u.status} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Users by Role</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {Object.entries(adminMetrics.roleCounts).map(([role, count]) => (
            <div key={role} className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-bold text-brand-600">{count}</p>
              <p className="mt-1 text-sm capitalize text-slate-500">{role}s</p>
            </div>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}
