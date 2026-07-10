import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiInbox, FiClipboard, FiMessageSquare, FiArrowRight } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import IncomingRequestCard from '../../components/mentor/IncomingRequestCard';
import InternCard from '../../components/mentor/InternCard';
import MentorTaskCard from '../../components/mentor/MentorTaskCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import { useAuth } from '../../hooks/useAuth';

const API_URL = 'http://localhost:5000/api/dashboard';

export default function MentorDashboard() {
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

  const assignedInterns = data?.assignedInterns ?? [];
  const pendingRequests = data?.pendingRequests ?? 0;
  const activeTasks = data?.activeTasks ?? 0;
  const unreadMessages = data?.unreadMessages ?? 0;
  const recentRequests = data?.recentRequests ?? [];
  const recentTasks = data?.recentTasks ?? [];
  const recentConversations = data?.recentConversations ?? [];

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Mentor'}`}
        subtitle="Manage your mentees and mentorship activities"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FiUsers} label="Assigned Interns" value={assignedInterns.length} color="blue" />
        <StatCard icon={FiInbox} label="Pending Requests" value={pendingRequests} color="yellow" />
        <StatCard icon={FiClipboard} label="Active Tasks" value={activeTasks} color="green" />
        <StatCard icon={FiMessageSquare} label="Unread Messages" value={unreadMessages} color="purple" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {[
          { label: 'Incoming Requests', path: '/incoming-requests', icon: FiInbox },
          { label: 'Assigned Interns', path: '/assigned-interns', icon: FiUsers },
          { label: 'Task Management', path: '/task-management', icon: FiClipboard },
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
            <h2 className="text-lg font-semibold text-slate-900">Recent Requests</h2>
            <button onClick={() => navigate('/incoming-requests')} className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700">
              View all <FiArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {recentRequests.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                No incoming requests at the moment.
              </div>
            ) : (
              recentRequests.map((request) => (
                <IncomingRequestCard key={request._id} request={request} onAccept={() => {}} onDecline={() => {}} />
              ))
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Active Interns</h2>
            <button onClick={() => navigate('/assigned-interns')} className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700">
              View all <FiArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {assignedInterns.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                No active interns assigned yet.
              </div>
            ) : (
              assignedInterns.slice(0, 2).map((intern) => <InternCard key={intern.id} intern={intern} />)
            )}
          </div>
        </section>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Active Tasks</h2>
          <button onClick={() => navigate('/task-management')} className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700">
            Manage tasks <FiArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-3">
          {recentTasks.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              No active tasks assigned yet.
            </div>
          ) : (
            recentTasks.map((task) => <MentorTaskCard key={task._id} task={task} onEdit={() => {}} onDelete={() => {}} />)
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Messages</h2>
          <button onClick={() => navigate('/chat')} className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700">
            Open chat <FiArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recentConversations.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              No recent messages yet.
            </div>
          ) : (
            recentConversations.map((conv) => (
              <div key={conv.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative">
                  <img src={conv.avatar} alt={conv.name} className="h-10 w-10 rounded-full bg-slate-100" />
                  {conv.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{conv.name}</p>
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
