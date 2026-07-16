import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckSquare, FiClock, FiActivity, FiEye, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import TaskCard from '../../components/intern/TaskCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import { useAuth } from '../../hooks/useAuth';

const API_URL = 'http://localhost:5000/api/tasks';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'completed', label: 'Completed' },
  { key: 'overdue', label: 'Overdue' },
];

export default function MyTasksPage() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load tasks');
        setTasks(data.tasks || []);
      } catch (err) {
        setError(err.message || 'Unable to load tasks');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchTasks();
  }, [token]);

  const filtered = activeTab === 'all'
    ? tasks
    : tasks.filter((t) => t.status === activeTab);

  const navigate = useNavigate();
  const openTask = (taskId) => navigate(`/tasks/${taskId}`);

  const handleStatusChange = async (taskId, status) => {
    try {
      const res = await fetch(`${API_URL}/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update task status');
      setTasks((prev) => prev.map((task) => (task._id === taskId ? data.task : task)));
    } catch (err) {
      setError(err.message || 'Unable to update task status');
    }
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    underReview: tasks.filter((t) => t.status === 'under_review').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: tasks.filter((t) => t.status === 'overdue').length,
  };

  return (
    <DashboardLayout>
      <PageHeader title="My Tasks" subtitle="Tasks assigned by your mentors" />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard icon={FiCheckSquare} label="Total Tasks" value={stats.total} color="blue" />
        <StatCard icon={FiClock} label="Pending" value={stats.pending} color="yellow" />
        <StatCard icon={FiActivity} label="In Progress" value={stats.inProgress} color="indigo" />
        <StatCard icon={FiEye} label="Under Review" value={stats.underReview} color="purple" />
        <StatCard icon={FiCheckCircle} label="Completed" value={stats.completed} color="green" />
        <StatCard icon={FiAlertCircle} label="Overdue" value={stats.overdue} color="red" />
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

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState title="Unable to load tasks" message={error} onRetry={() => window.location.reload()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FiCheckSquare}
          title="No tasks found"
          description={`You don't have any ${activeTab === 'all' ? '' : activeTab.replace('_', ' ')} tasks.`}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((task) => (
            <TaskCard key={task._id} task={task} onStatusChange={handleStatusChange} onOpen={openTask} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
