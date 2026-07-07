import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSend, FiPlus } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import RequestCard from '../../components/intern/RequestCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import { useAuth } from '../../hooks/useAuth';

const API_URL = 'http://localhost:5000/api/requests';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function MyRequestsPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load requests');
        setRequests(data.requests || []);
      } catch (err) {
        setError(err.message || 'Unable to load requests');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchRequests();
  }, [token]);

  const filtered = activeTab === 'all'
    ? requests
    : requests.filter((r) => r.status === activeTab);

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="My Requests"
        subtitle="Track your mentorship request status"
        action={
          <button
            onClick={() => navigate('/search-mentors')}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <FiPlus className="h-4 w-4" />
            New Request
          </button>
        }
      />

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-200 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${
              activeTab === tab.key ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState title="Unable to load requests" message={error} onRetry={() => window.location.reload()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FiSend}
          title="No requests found"
          description={`You don't have any ${activeTab === 'all' ? '' : activeTab} mentorship requests.`}
          actionLabel="Find Mentors"
          onAction={() => navigate('/search-mentors')}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((request) => (
            <RequestCard key={request._id} request={request} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
