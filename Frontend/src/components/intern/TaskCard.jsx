import StatusBadge from '../ui/StatusBadge';
import { FiCalendar, FiUser } from 'react-icons/fi';

const priorityColors = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-amber-600 bg-amber-50',
  low: 'text-slate-600 bg-slate-100',
};

export default function TaskCard({ task, onStatusChange }) {
  const assigneeName = task.assigneeName || task.assignedBy || 'Mentor';
  const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'TBD';
  const priority = task.priority || 'medium';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">{task.title}</h3>
            <span className={`rounded px-1.5 py-0.5 text-xs font-medium capitalize ${priorityColors[priority]}`}>
              {priority}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{task.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <FiUser className="h-3.5 w-3.5" />
              {assigneeName}
            </span>
            <span className="inline-flex items-center gap-1">
              <FiCalendar className="h-3.5 w-3.5" />
              Due: {dueDate}
            </span>
          </div>
        </div>
        <StatusBadge status={task.status} />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm text-slate-500">Update status</span>
        <select
          value={task.status || 'pending'}
          onChange={(e) => onStatusChange?.(task._id, e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
    </div>
  );
}
