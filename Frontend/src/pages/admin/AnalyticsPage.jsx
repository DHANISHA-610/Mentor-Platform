import { useEffect, useState } from 'react';
import { FiTrendingUp, FiUsers, FiLink, FiClipboard, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../hooks/useAuth';

const API_URL = 'http://localhost:5000/api/dashboard';

const ranges = [
  { key: '7days', label: '7 Days' },
  { key: '30days', label: '30 Days' },
  { key: '12months', label: '12 Months' },
];

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [range, setRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load analytics data');
        }

        setDashboard(data.dashboard);
      } catch (err) {
        setError(err.message || 'Unable to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  const analytics = dashboard?.analytics?.[range] || {
    signups: 0,
    pairings: 0,
    tasks: 0,
    messages: 0,
    completionRate: 0,
    weeklyActivity: [],
    pathways: [],
  };

  const metrics = dashboard?.metrics;
  const maxActivity = Math.max(...(analytics.weeklyActivity.map((d) => d.value) || [0]));

  return (
    <DashboardLayout>
      <PageHeader
        title="Analytics"
        subtitle="Platform activity and growth metrics"
        action={
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            {ranges.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  range === r.key
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="py-12">
          <ErrorState message={error} />
        </div>
      ) : !dashboard ? (
        <div className="py-12">
          <EmptyState title="No analytics data" description="No analytics are available for this admin account." />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard icon={FiUsers} label="Signups" value={analytics.signups} color="blue" change="New users" />
            <StatCard icon={FiLink} label="Pairings" value={analytics.pairings} color="green" change="New pairings" />
            <StatCard icon={FiClipboard} label="Tasks" value={analytics.tasks} color="indigo" change="Tasks created" />
            <StatCard icon={FiMessageSquare} label="Messages" value={analytics.messages} color="purple" change="Messages sent" />
            <StatCard icon={FiCheckCircle} label="Completion Rate" value={`${analytics.completionRate}%`} color="yellow" change="Task completion" />
          </div>

          {metrics && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Users" value={metrics.totalUsers} color="blue" />
              <StatCard label="Active Pairings" value={metrics.activePairings} color="green" />
              <StatCard label="Pending Approvals" value={metrics.pendingApprovals} color="yellow" />
              <StatCard label="Tasks This Month" value={metrics.tasksThisMonth} color="purple" />
            </div>
          )}

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <FiTrendingUp className="h-5 w-5 text-brand-600" />
                <h2 className="text-lg font-semibold text-slate-900">Activity Overview</h2>
              </div>
              <div className="flex items-end gap-2" style={{ height: '200px' }}>
                {analytics.weeklyActivity.map((item) => (
                  <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
                    <div className="relative w-full flex-1">
                      <div
                        className="absolute bottom-0 w-full rounded-t-md bg-brand-500 transition-all duration-500"
                        style={{ height: `${maxActivity ? (item.value / maxActivity) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{item.day}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-slate-900">Career Pathway Popularity</h2>
              <div className="space-y-4">
                {analytics.pathways.map((pathway) => (
                  <div key={pathway.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{pathway.name}</span>
                      <span className="text-slate-500">{pathway.count} ({pathway.percentage}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-500"
                        style={{ width: `${pathway.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
