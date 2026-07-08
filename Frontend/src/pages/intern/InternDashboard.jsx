import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiSend, FiCheckSquare, FiMessageSquare, FiSearch, FiArrowRight } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import TaskCard from '../../components/intern/TaskCard';
import RequestCard from '../../components/intern/RequestCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import { useAuth } from '../../hooks/useAuth';

const API_URL = 'http://localhost:5000/api/dashboard';

export default function InternDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.message || 'Failed to load dashboard');
        }
        setData(result.dashboard);
      } catch (err) {
        setError(err.message || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [token]);

  const activeMentors = data?.activeMentors ?? 0;
  const pendingRequests = data?.pendingRequests ?? 0;
  const completedTasks = data?.completedTasks ?? 0;
  const unreadMessages = data?.unreadMessages ?? 0;
  const recentTasks = data?.recentTasks ?? [];
  const recentRequests = data?.recentRequests ?? [];
  const recentConversations = data?.recentConversations ?? [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-80 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="py-12">
          <ErrorState message={error} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Intern'}`}
        subtitle="Here's an overview of your mentorship journey"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FiUsers} label="Active Mentors" value={activeMentors} color="blue" />
        <StatCard icon={FiSend} label="Pending Requests" value={pendingRequests} color="yellow" />
        <StatCard icon={FiCheckSquare} label="Tasks Completed" value={completedTasks} color="green" />
        <StatCard icon={FiMessageSquare} label="Unread Messages" value={unreadMessages} color="purple" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {[
          { label: 'Search Mentors', path: '/search-mentors', icon: FiSearch },
          { label: 'My Requests', path: '/my-requests', icon: FiSend },
          { label: 'My Tasks', path: '/my-tasks', icon: FiCheckSquare },
          { label: 'Chat', path: '/chat', icon: FiMessageSquare },
        ].map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Tasks</h2>
            <button onClick={() => navigate('/my-tasks')} className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700">
              View all <FiArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                No recent tasks yet.
              </div>
            ) : (
              recentTasks.map((task) => <TaskCard key={task._id} task={task} />)
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Requests</h2>
            <button onClick={() => navigate('/my-requests')} className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700">
              View all <FiArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {recentRequests.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                No recent requests yet.
              </div>
            ) : (
              recentRequests.map((request) => <RequestCard key={request._id} request={request} />)
            )}
          </div>
        </section>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Conversations</h2>
          <button onClick={() => navigate('/chat')} className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700">
            Open chat <FiArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {recentConversations.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              No conversation data available yet.
            </div>
          ) : (
            recentConversations.map((conv) => (
              <div key={conv.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative">
                  <img src={conv.avatar} alt={conv.name} className="h-10 w-10 rounded-full bg-slate-100" />
                  {conv.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-slate-900">{conv.name}</p>
                    <span className="text-xs text-slate-400">{conv.lastMessageTime}</span>
                  </div>
                  <p className="truncate text-xs text-slate-500">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-medium text-white">
                    {conv.unread}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
