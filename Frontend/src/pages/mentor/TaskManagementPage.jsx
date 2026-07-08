import { useEffect, useState } from 'react';
import { FiPlus, FiCheck, FiClipboard } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import MentorTaskCard from '../../components/mentor/MentorTaskCard';
import CreateTaskModal from '../../components/mentor/CreateTaskModal';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import { useAuth } from '../../hooks/useAuth';

const API_URL = 'http://localhost:5000/api/tasks';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'overdue', label: 'Overdue' },
];

export default function TaskManagementPage() {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interns, setInterns] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [tasksRes, internsRes] = await Promise.all([
          fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/interns'),
        ]);
        const tasksData = await tasksRes.json();
        const internsData = await internsRes.json();
        if (!tasksRes.ok || !tasksData.success) throw new Error(tasksData.message || 'Failed to load tasks');
        if (!internsRes.ok || !internsData.success) throw new Error(internsData.message || 'Failed to load interns');
        setTasks(tasksData.tasks || []);
        setInterns((internsData.interns || []).map((intern) => ({ id: intern._id, name: intern.name })));
      } catch (err) {
        setError(err.message || 'Unable to load tasks');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const filtered = activeTab === 'all'
    ? tasks
    : tasks.filter((t) => t.status === activeTab);

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
      showToast('Task status updated');
    } catch (err) {
      showToast(err.message || 'Unable to update task status');
    }
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: tasks.filter((t) => t.status === 'overdue').length,
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async (taskData) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create task');
      setTasks((prev) => [data.task, ...prev]);
      showToast('Task created successfully');
    } catch (err) {
      showToast(err.message || 'Unable to create task');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete task');
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showToast('Task deleted successfully');
    } catch (err) {
      showToast(err.message || 'Unable to delete task');
    }
  };

  const handleEdit = () => {
    showToast('Task editing coming soon');
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Task Management"
        subtitle="Create and manage tasks for your interns"
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <FiPlus className="h-4 w-4" />
            Create Task
          </button>
        }
      />

      {toast && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <FiCheck className="h-4 w-4" />
          {toast}
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={FiClipboard} label="Total" value={stats.total} color="blue" />
        <StatCard label="Pending" value={stats.pending} color="yellow" />
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

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState title="Unable to load tasks" message={error} onRetry={() => window.location.reload()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FiClipboard}
          title="No tasks found"
          description={`There are no ${activeTab === 'all' ? '' : activeTab.replace('_', ' ')} tasks.`}
          actionLabel="Create Task"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((task) => (
            <MentorTaskCard
              key={task._id}
              task={task}
              onEdit={handleEdit}
              onDelete={() => handleDelete(task._id)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <CreateTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        interns={interns}
      />
    </DashboardLayout>
  );
}
