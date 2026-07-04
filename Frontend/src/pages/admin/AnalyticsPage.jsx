import { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiLink, FiClipboard, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { analyticsData } from '../../utils/mockData';

const ranges = [
  { key: '7days', label: '7 Days' },
  { key: '30days', label: '30 Days' },
  { key: '12months', label: '12 Months' },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState('30days');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(analyticsData['30days']);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setData(analyticsData[range]);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [range]);

  const maxActivity = Math.max(...data.weeklyActivity.map((d) => d.value));

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
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard icon={FiUsers} label="Signups" value={data.signups} color="blue" change="New users" />
            <StatCard icon={FiLink} label="Pairings" value={data.pairings} color="green" change="New pairings" />
            <StatCard icon={FiClipboard} label="Tasks" value={data.tasks} color="indigo" change="Tasks created" />
            <StatCard icon={FiMessageSquare} label="Messages" value={data.messages} color="purple" change="Messages sent" />
            <StatCard icon={FiCheckCircle} label="Completion Rate" value={`${data.completionRate}%`} color="yellow" change="Task completion" />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <FiTrendingUp className="h-5 w-5 text-brand-600" />
                <h2 className="text-lg font-semibold text-slate-900">Activity Overview</h2>
              </div>
              <div className="flex items-end gap-2" style={{ height: '200px' }}>
                {data.weeklyActivity.map((item) => (
                  <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
                    <div className="relative w-full flex-1">
                      <div
                        className="absolute bottom-0 w-full rounded-t-md bg-brand-500 transition-all duration-500"
                        style={{ height: `${(item.value / maxActivity) * 100}%` }}
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
                {data.pathways.map((pathway) => (
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
