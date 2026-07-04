import { FiMessageSquare, FiClipboard } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function InternCard({ intern }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <img
          src={intern.avatar}
          alt={intern.name}
          className="h-12 w-12 rounded-full bg-slate-100"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">{intern.name}</h3>
              <p className="text-sm text-slate-500">{intern.field}</p>
            </div>
            <span className={`text-xs font-medium ${intern.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>
              {intern.status === 'active' ? '● Active' : '● Inactive'}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {intern.skills.map((skill) => (
              <span key={skill} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Progress</span>
              <span>{intern.progress}% · {intern.tasksCompleted}/{intern.totalTasks} tasks</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-600 transition-all"
                style={{ width: `${intern.progress}%` }}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => navigate('/chat')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <FiMessageSquare className="h-3.5 w-3.5" />
              Message
            </button>
            <button
              onClick={() => navigate('/task-management')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <FiClipboard className="h-3.5 w-3.5" />
              View Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
