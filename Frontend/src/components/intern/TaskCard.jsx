import StatusBadge from '../ui/StatusBadge';
import { FiCalendar, FiUser } from 'react-icons/fi';

const priorityColors = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-amber-600 bg-amber-50',
  low: 'text-slate-600 bg-slate-100',
};

export default function TaskCard({ task }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">{task.title}</h3>
            <span className={`rounded px-1.5 py-0.5 text-xs font-medium capitalize ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{task.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <FiUser className="h-3.5 w-3.5" />
              {task.assignedBy}
            </span>
            <span className="inline-flex items-center gap-1">
              <FiCalendar className="h-3.5 w-3.5" />
              Due: {task.dueDate}
            </span>
          </div>
        </div>
        <StatusBadge status={task.status} />
      </div>
    </div>
  );
}
