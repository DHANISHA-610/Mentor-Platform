import StatusBadge from '../ui/StatusBadge';
import { FiCheck, FiX } from 'react-icons/fi';

export default function IncomingRequestCard({ request, onAccept, onDecline }) {
  const requesterName = request.requesterName || 'Intern';
  const requesterField = request.requesterField || 'Career Growth';
  const requesterSkills = request.requesterSkills || [];
  const requesterAvatar = request.requesterAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=intern';
  const sentDate = request.sentDate ? new Date(request.sentDate).toLocaleDateString() : 'Recently sent';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <img src={requesterAvatar} alt={requesterName} className="h-12 w-12 rounded-full bg-slate-100" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">{requesterName}</h3>
              <p className="text-sm text-slate-500">{requesterField}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {requesterSkills.map((skill) => (
              <span key={skill} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {skill}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-600">{request.message}</p>
          <p className="mt-2 text-xs text-slate-400">Sent: {sentDate}</p>
          {request.status === 'pending' && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => onAccept(request._id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                <FiCheck className="h-4 w-4" />
                Accept
              </button>
              <button
                onClick={() => onDecline(request._id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <FiX className="h-4 w-4" />
                Decline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
