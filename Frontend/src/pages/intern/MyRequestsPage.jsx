import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSend, FiPlus } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import RequestCard from '../../components/intern/RequestCard';
import EmptyState from '../../components/ui/EmptyState';
import { internRequests } from '../../utils/mockData';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function MyRequestsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const filtered = activeTab === 'all'
    ? internRequests
    : internRequests.filter((r) => r.status === activeTab);

  const counts = {
    all: internRequests.length,
    pending: internRequests.filter((r) => r.status === 'pending').length,
    approved: internRequests.filter((r) => r.status === 'approved').length,
    rejected: internRequests.filter((r) => r.status === 'rejected').length,
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

      {filtered.length === 0 ? (
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
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
