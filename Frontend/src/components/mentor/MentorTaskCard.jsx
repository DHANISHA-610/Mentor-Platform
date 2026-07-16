import StatusBadge from '../ui/StatusBadge';
import { FiCalendar, FiUser, FiEdit2, FiTrash2 } from 'react-icons/fi';

const priorityColors = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-amber-600 bg-amber-50',
  low: 'text-emerald-600 bg-emerald-50',
};

const progressMap = {
  pending: 0,
  in_progress: 50,
  under_review: 75,
  completed: 100,
  overdue: 20,
};

const getDueLabel = (dueDate) => {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;
  if (diffDays <= 2) return `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  return null;
};

export default function MentorTaskCard({ task, onEdit, onDelete, onStatusChange, onOpen }) {
  const assigneeName = task.assigneeName || task.assignee || 'Unknown';
  const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'TBD';
  const priority = task.priority || 'medium';
  const progress = progressMap[task.status] ?? 0;
  const dueLabel = getDueLabel(task.dueDate);

  return (
    <div
      role="button"
      onClick={() => onOpen?.(task._id)}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-500/20"
    >
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
            {dueLabel && (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                {dueLabel}
              </span>
            )}
          </div>
        </div>
        <StatusBadge status={task.status} />
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-600" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Set status</span>
          <select
            value={task.status || 'pending'}
            onChange={(e) => {
              e.stopPropagation();
              onStatusChange?.(task._id, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="under_review">Under Review</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <FiEdit2 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
