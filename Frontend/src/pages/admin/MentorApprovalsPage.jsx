import { useState, useEffect } from 'react';
import { FiUserCheck, FiX, FiCheck, FiExternalLink, FiEye } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import { mentorApplications as initialApplications } from '../../utils/mockData';

export default function MentorApprovalsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState(null);

  const loadApplications = () => {
    setLoading(true);
    setError(false);
    setTimeout(() => {
      setApplications(initialApplications);
      setLoading(false);
    }, 800);
  };

  useEffect(() => { loadApplications(); }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = (id) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    showToast('Mentor application approved');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      showToast('Please provide a rejection reason', 'error');
      return;
    }
    setApplications((prev) => prev.filter((a) => a.id !== rejectModal.id));
    setRejectModal(null);
    setRejectReason('');
    showToast('Mentor application rejected');
  };

  if (error) {
    return (
      <DashboardLayout>
        <PageHeader title="Mentor Approvals" subtitle="Review mentor applications" />
        <ErrorState message="Failed to load applications." onRetry={loadApplications} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Mentor Approvals"
        subtitle={`${applications.length} pending application${applications.length !== 1 ? 's' : ''}`}
      />

      {toast && (
        <div className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
          toast.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
        }`}>
          <FiCheck className="h-4 w-4" />
          {toast.message}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FiUserCheck}
          title="No pending applications"
          description="All mentor applications have been reviewed."
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <img src={app.avatar} alt={app.name} className="h-14 w-14 rounded-full bg-slate-100" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{app.name}</h3>
                      <p className="text-sm text-slate-500">{app.title} at {app.company}</p>
                      <p className="text-xs text-slate-400">{app.experience} experience · Applied {app.appliedDate}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{app.bio}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {app.skills.map((skill) => (
                      <span key={skill} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <button
                  onClick={() => setDetailModal(app)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <FiEye className="h-3.5 w-3.5" />
                  View Credentials
                </button>
                <button
                  onClick={() => handleApprove(app.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  <FiCheck className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => setRejectModal(app)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <FiX className="h-4 w-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetailModal(null)} />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Application Details</h2>
              <button onClick={() => setDetailModal(null)} className="text-slate-400 hover:text-slate-600">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <img src={detailModal.avatar} alt={detailModal.name} className="h-16 w-16 rounded-full bg-slate-100" />
              <div>
                <h3 className="font-semibold text-slate-900">{detailModal.name}</h3>
                <p className="text-sm text-slate-500">{detailModal.email}</p>
                <p className="text-sm text-slate-500">{detailModal.title} at {detailModal.company}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">{detailModal.bio}</p>
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-slate-900">Credentials</h4>
              {[
                { label: 'LinkedIn', url: detailModal.linkedin },
                { label: 'Portfolio', url: detailModal.portfolio },
                { label: 'Resume', url: detailModal.resume },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-brand-600 hover:bg-brand-50"
                >
                  <FiExternalLink className="h-4 w-4" />
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => { handleApprove(detailModal.id); setDetailModal(null); }}
                className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Approve
              </button>
              <button
                onClick={() => { setRejectModal(detailModal); setDetailModal(null); }}
                className="flex-1 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRejectModal(null)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Reject Application</h2>
            <p className="mt-1 text-sm text-slate-500">
              Provide a reason for rejecting {rejectModal.name}&apos;s application.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Rejection reason..."
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setRejectModal(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleReject} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
