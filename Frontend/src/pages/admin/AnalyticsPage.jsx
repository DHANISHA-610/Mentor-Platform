import { useEffect, useState } from 'react';
import { FiUsers, FiLink, FiClipboard, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { ActivityLineChart, MonthlyGrowthChart, PathwayBarChart, TaskStatusPie } from '../../components/admin/AnalyticsCharts';
import { AnalyticsStatCard, DataCard } from '../../components/admin/AnalyticsCards';

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
    signupsTrend: 0,
    pairings: 0,
    pairingsTrend: 0,
    tasks: 0,
    tasksTrend: 0,
    messages: 0,
    messagesTrend: 0,
    completionRate: 0,
    completionRateTrend: 0,
  };
  const timeline = dashboard?.timeline?.[range] || [];
  const pathways = dashboard?.pathways || [];
  const monthlyGrowth = dashboard?.monthlyGrowth || [];
  const taskStatusDistribution = dashboard?.taskStatusDistribution || [];
  const topMentors = dashboard?.topMentors || [];
  const topInterns = dashboard?.topInterns || [];
  const recentActivities = dashboard?.recentActivities || [];
  const careerInsights = dashboard?.careerInsights || {};
  const metrics = dashboard?.metrics;

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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <AnalyticsStatCard
              icon={FiUsers}
              label="Signups"
              value={analytics.signups}
              description="New users"
              trend={analytics.signupsTrend}
            />
            <AnalyticsStatCard
              icon={FiLink}
              label="Pairings"
              value={analytics.pairings}
              description="Approved mentor pairings"
              trend={analytics.pairingsTrend}
            />
            <AnalyticsStatCard
              icon={FiClipboard}
              label="Tasks"
              value={analytics.tasks}
              description="Tasks created"
              trend={analytics.tasksTrend}
            />
            <AnalyticsStatCard
              icon={FiMessageSquare}
              label="Messages"
              value={analytics.messages}
              description="Chat activity"
              trend={analytics.messagesTrend}
            />
            <AnalyticsStatCard
              icon={FiCheckCircle}
              label="Completion Rate"
              value={`${analytics.completionRate}%`}
              description="Tasks completed"
              trend={analytics.completionRateTrend}
            />
          </div>

          {metrics && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total Users" value={metrics.totalUsers} color="blue" compact />
              <StatCard label="Active Pairings" value={metrics.activePairings} color="green" compact />
              <StatCard label="Pending Approvals" value={metrics.pendingApprovals} color="yellow" compact />
              <StatCard label="Tasks This Month" value={metrics.tasksThisMonth} color="purple" compact />
            </div>
          )}

          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            <DataCard title="Activity Timeline" subtitle="Trends for the selected period">
              <ActivityLineChart data={timeline} />
            </DataCard>

            <DataCard title="Task Status Distribution" subtitle="Current task progress mix">
              {taskStatusDistribution.length > 0 ? (
                <TaskStatusPie data={taskStatusDistribution} />
              ) : (
                <p className="text-sm text-slate-500">No task status data available yet.</p>
              )}
            </DataCard>

            <DataCard title="Top Pathways" subtitle="Most active intern pathways">
              {pathways.length > 0 ? (
                <PathwayBarChart data={pathways} />
              ) : (
                <p className="text-sm text-slate-500">No pathway data available yet.</p>
              )}
            </DataCard>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <DataCard title="Monthly Growth" subtitle="New users, mentors, and interns">
              {monthlyGrowth.length > 0 ? (
                <MonthlyGrowthChart data={monthlyGrowth} />
              ) : (
                <p className="text-sm text-slate-500">No monthly growth data available yet.</p>
              )}
            </DataCard>

            <div className="grid gap-6">
              <DataCard title="Top Mentors" subtitle="Most productive mentor leaders">
                <div className="space-y-4">
                  {topMentors.length > 0 ? (
                    topMentors.map((mentor) => (
                      <div key={mentor.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{mentor.name}</p>
                            <p className="text-sm text-slate-500">{mentor.completedTasks} completed tasks</p>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{mentor.successRate}%</span>
                        </div>
                        <div className="mt-3 text-sm text-slate-500">Assigned interns: {mentor.assignedInterns}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No mentor data available yet.</p>
                  )}
                </div>
              </DataCard>

              <DataCard title="Top Interns" subtitle="Highest task completion rates">
                <div className="space-y-4">
                  {topInterns.length > 0 ? (
                    topInterns.map((intern) => (
                      <div key={intern.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{intern.name}</p>
                            <p className="text-sm text-slate-500">Active tasks: {intern.activeTasks}</p>
                          </div>
                          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">{intern.successRate}%</span>
                        </div>
                        <div className="mt-3 text-sm text-slate-500">Completed tasks: {intern.completedTasks}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No intern data available yet.</p>
                  )}
                </div>
              </DataCard>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            <DataCard title="Recent Activity" subtitle="Latest platform events">
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={`${activity.label}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-800">{activity.label}</p>
                        <span className="text-xs text-slate-500">{new Date(activity.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No recent activity available yet.</p>
                )}
              </div>
            </DataCard>

            <DataCard title="Career Insights" subtitle="What interns are learning most">
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700">Most popular skill</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{careerInsights.mostPopularSkill || 'N/A'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700">Fastest growing pathway</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{careerInsights.fastestGrowingPathway || 'N/A'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700">Average interns per pathway</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{careerInsights.averageInternsPerPathway ?? 'N/A'}</p>
                </div>
              </div>
            </DataCard>

            <DataCard title="Performance Snapshot" subtitle="Role and approval overview">
              <div className="grid gap-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Admin users</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{metrics?.roleCounts?.admin || 0}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Mentor users</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{metrics?.roleCounts?.mentor || 0}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Intern users</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{metrics?.roleCounts?.intern || 0}</p>
                </div>
              </div>
            </DataCard>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
