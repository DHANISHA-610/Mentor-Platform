import { useState, useMemo } from 'react';
import { FiSearch, FiUsers } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import InternCard from '../../components/mentor/InternCard';
import EmptyState from '../../components/ui/EmptyState';
import { assignedInterns } from '../../utils/mockData';

export default function AssignedInternsPage() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return assignedInterns.filter(
      (intern) =>
        !q ||
        intern.name.toLowerCase().includes(q) ||
        intern.field.toLowerCase().includes(q) ||
        intern.skills.some((s) => s.toLowerCase().includes(q))
    );
  }, [search]);

  const activeInterns = assignedInterns.filter((i) => i.status === 'active').length;
  const avgProgress = Math.round(
    assignedInterns.reduce((sum, i) => sum + i.progress, 0) / assignedInterns.length
  );
  const totalTasksDone = assignedInterns.reduce((sum, i) => sum + i.tasksCompleted, 0);

  return (
    <DashboardLayout>
      <PageHeader title="Assigned Interns" subtitle="Manage your mentee roster" />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FiUsers} label="Total Interns" value={assignedInterns.length} color="blue" />
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
    </DashboardLayout>
  );
}
