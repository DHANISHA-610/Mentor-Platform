import StatusBadge from '../ui/StatusBadge';

export default function RequestCard({ request }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <img
          src={request.mentorAvatar}
          alt={request.mentorName}
          className="h-12 w-12 rounded-full bg-slate-100"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">{request.mentorName}</h3>
              <p className="text-sm text-slate-500">{request.mentorTitle}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>
          <p className="mt-3 text-sm text-slate-600">{request.message}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
            <span>Sent: {request.sentDate}</span>
            {request.responseDate && <span>Responded: {request.responseDate}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
