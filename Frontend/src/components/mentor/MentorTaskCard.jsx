import StatusBadge from '../ui/StatusBadge';
import { FiCalendar, FiUser, FiEdit2, FiTrash2 } from 'react-icons/fi';

const priorityColors = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-amber-600 bg-amber-50',
  low: 'text-slate-600 bg-slate-100',
};

export default function MentorTaskCard({ task, onEdit, onDelete }) {
  const assigneeName = task.assigneeName || task.assignee || 'Unknown';
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
      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
        <button
          onClick={() => onEdit(task)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <FiEdit2 className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <FiTrash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}
