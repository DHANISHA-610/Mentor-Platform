import { useEffect, useState } from 'react';
import { FiInbox, FiCheck, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import IncomingRequestCard from '../../components/mentor/IncomingRequestCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import { useAuth } from '../../hooks/useAuth';

const API_URL = 'http://localhost:5000/api/requests';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Accepted' },
  { key: 'rejected', label: 'Declined' },
];

export default function IncomingRequestsPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } });
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

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAccept = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'approved' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update request');
      setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: 'approved', responseDate: data.request.responseDate } : r)));
      showToast('Request accepted successfully');
    } catch (err) {
      showToast(err.message || 'Unable to update request');
    }
  };

  const handleDecline = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'rejected' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update request');
      setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: 'rejected', responseDate: data.request.responseDate } : r)));
      showToast('Request declined');
    } catch (err) {
      showToast(err.message || 'Unable to update request');
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Incoming Requests" subtitle="Review mentorship requests from interns" />

      {toast && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <FiCheck className="h-4 w-4" />
          {toast}
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FiInbox} label="Total Requests" value={counts.all} color="blue" />
        <StatCard icon={FiClock} label="Pending" value={counts.pending} color="yellow" />
        <StatCard icon={FiCheckCircle} label="Accepted" value={counts.approved} color="green" />
        <StatCard icon={FiXCircle} label="Declined" value={counts.rejected} color="red" />
      </div>

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
          icon={FiInbox}
          title="No requests found"
          description={`There are no ${activeTab === 'all' ? '' : activeTab} requests to show.`}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((request) => (
            <IncomingRequestCard
              key={request._id}
              request={request}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
