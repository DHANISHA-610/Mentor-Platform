import StatusBadge from '../ui/StatusBadge';

export default function RequestCard({ request }) {
  const mentorName = request.mentorName || request.mentor?.name || 'Mentor';
  const mentorTitle = request.mentorTitle || request.mentor?.title || 'Mentor';
  const mentorAvatar = request.mentorAvatar || request.mentor?.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=mentor';
  const sentDate = request.sentDate ? new Date(request.sentDate).toLocaleDateString() : 'Recently sent';
  const responseDate = request.responseDate ? new Date(request.responseDate).toLocaleDateString() : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <img src={mentorAvatar} alt={mentorName} className="h-12 w-12 rounded-full bg-slate-100" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">{mentorName}</h3>
              <p className="text-sm text-slate-500">{mentorTitle}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>
          <p className="mt-3 text-sm text-slate-600">{request.message}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
            <span>Sent: {sentDate}</span>
            {responseDate && <span>Responded: {responseDate}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
