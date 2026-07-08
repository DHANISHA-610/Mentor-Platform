import { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiUsers } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import InternCard from '../../components/mentor/InternCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import { useAuth } from '../../hooks/useAuth';

const API_URL = 'http://localhost:5000/api/dashboard';

export default function AssignedInternsPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssignedInterns = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.message || 'Failed to load assigned interns');
        }

        setInterns(result.dashboard.assignedInterns || []);
      } catch (err) {
        setError(err.message || 'Unable to load assigned interns');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAssignedInterns();
    }
  }, [token]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return interns.filter(
      (intern) =>
        !q ||
        intern.name.toLowerCase().includes(q) ||
        intern.field.toLowerCase().includes(q) ||
        intern.skills.some((s) => s.toLowerCase().includes(q))
    );
  }, [interns, search]);

  const activeInterns = interns.filter((i) => i.status === 'active').length;
  const avgProgress = interns.length === 0 ? 0 : Math.round(
    interns.reduce((sum, i) => sum + i.progress, 0) / interns.length
  );
  const totalTasksDone = interns.reduce((sum, i) => sum + i.tasksCompleted, 0);

  return (
    <DashboardLayout>
      <PageHeader title="Assigned Interns" subtitle="Manage your mentee roster" />

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="py-12">
          <ErrorState message={error} />
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={FiUsers} label="Total Interns" value={interns.length} color="blue" />
            <StatCard label="Active Interns" value={activeInterns} color="green" />
            <StatCard label="Avg Progress" value={`${avgProgress}%`} color="indigo" />
            <StatCard label="Tasks Done" value={totalTasksDone} color="purple" />
          </div>

          <div className="relative mb-6">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, field, or skill..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={FiUsers}
              title="No interns found"
              description="Try adjusting your search to find assigned interns."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((intern) => (
                <InternCard key={intern.id} intern={intern} />
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
