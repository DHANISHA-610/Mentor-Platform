const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rejected: 'bg-red-50 text-red-700 ring-red-600/20',
  declined: 'bg-red-50 text-red-700 ring-red-600/20',
  in_progress: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  under_review: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  overdue: 'bg-red-50 text-red-700 ring-red-600/20',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

const statusLabels = {
  pending: 'Pending',
  approved: 'Approved',
  accepted: 'Accepted',
  rejected: 'Rejected',
  declined: 'Declined',
  in_progress: 'In Progress',
  under_review: 'Under Review',
  completed: 'Completed',
  overdue: 'Overdue',
  active: 'Active',
  inactive: 'Inactive',
};

export default function StatusBadge({ status }) {
  const normalized = status?.toLowerCase().replace(/\s+/g, '_') || 'pending';
  const style = statusStyles[normalized] || statusStyles.pending;
  const label = statusLabels[normalized] || status;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}>
      {label}
    </span>
  );
}
