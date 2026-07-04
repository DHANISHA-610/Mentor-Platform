import { useState } from 'react';
import { FiCheckSquare } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import TaskCard from '../../components/intern/TaskCard';
import EmptyState from '../../components/ui/EmptyState';
import { internTasks } from '../../utils/mockData';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'overdue', label: 'Overdue' },
];

export default function MyTasksPage() {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = activeTab === 'all'
    ? internTasks
    : internTasks.filter((t) => t.status === activeTab);

  const stats = {
    total: internTasks.length,
    inProgress: internTasks.filter((t) => t.status === 'in_progress').length,
    completed: internTasks.filter((t) => t.status === 'completed').length,
    overdue: internTasks.filter((t) => t.status === 'overdue').length,
  };

  return (
    <DashboardLayout>
      <PageHeader title="My Tasks" subtitle="Tasks assigned by your mentors" />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FiCheckSquare} label="Total Tasks" value={stats.total} color="blue" />
        <StatCard label="In Progress" value={stats.inProgress} color="indigo" />
        <StatCard label="Completed" value={stats.completed} color="green" />
        <StatCard label="Overdue" value={stats.overdue} color="red" />
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-200 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FiCheckSquare}
          title="No tasks found"
          description={`You don't have any ${activeTab === 'all' ? '' : activeTab.replace('_', ' ')} tasks.`}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
