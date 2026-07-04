import { FiStar, FiSend } from 'react-icons/fi';

export default function MentorCard({ mentor, onRequest, requested }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md ${!mentor.available ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4">
        <img
          src={mentor.avatar}
          alt={mentor.name}
          className="h-14 w-14 rounded-full bg-slate-100 ring-2 ring-white"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900">{mentor.name}</h3>
              <p className="text-sm text-slate-500">{mentor.title}</p>
              <p className="text-sm text-brand-600">{mentor.company}</p>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <FiStar className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-slate-700">{mentor.rating}</span>
              <span className="text-slate-400">({mentor.reviews})</span>
            </div>
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-slate-600">{mentor.bio}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {mentor.skills.map((skill) => (
              <span key={skill} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className={`text-xs font-medium ${mentor.available ? 'text-emerald-600' : 'text-slate-400'}`}>
          {mentor.available ? '● Available' : '● Unavailable'}
        </span>
        <button
          onClick={() => onRequest(mentor)}
          disabled={!mentor.available || requested}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <FiSend className="h-3.5 w-3.5" />
          {requested ? 'Requested' : 'Send Request'}
        </button>
      </div>
    </div>
  );
}
