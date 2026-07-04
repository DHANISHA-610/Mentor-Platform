import { useState } from 'react';
import { FiInbox, FiCheck } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import IncomingRequestCard from '../../components/mentor/IncomingRequestCard';
import EmptyState from '../../components/ui/EmptyState';
import { mentorIncomingRequests as initialRequests } from '../../utils/mockData';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'declined', label: 'Declined' },
];

export default function IncomingRequestsPage() {
  const [requests, setRequests] = useState(initialRequests);
  const [activeTab, setActiveTab] = useState('all');
  const [toast, setToast] = useState(null);

  const filtered = activeTab === 'all'
    ? requests
    : requests.filter((r) => r.status === activeTab);

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    declined: requests.filter((r) => r.status === 'declined').length,
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAccept = (id) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'accepted', responseDate: new Date().toISOString().split('T')[0] } : r
      )
    );
    showToast('Request accepted successfully');
  };

  const handleDecline = (id) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'declined', responseDate: new Date().toISOString().split('T')[0] } : r
      )
    );
    showToast('Request declined');
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
        <StatCard label="Pending" value={counts.pending} color="yellow" />
        <StatCard label="Accepted" value={counts.accepted} color="green" />
        <StatCard label="Declined" value={counts.declined} color="red" />
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

      {filtered.length === 0 ? (
        <EmptyState
          icon={FiInbox}
          title="No requests found"
          description={`There are no ${activeTab === 'all' ? '' : activeTab} requests to show.`}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((request) => (
            <IncomingRequestCard
              key={request.id}
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
