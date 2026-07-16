import { useState } from 'react';
import {
  FiMessageSquare,
  FiClipboard,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiEdit3,
  FiExternalLink,
  FiPaperclip,
  FiClock,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import ReviewSubmissionModal from './ReviewSubmissionModal';

const formatDate = (value) => {
  if (!value) return 'No submissions yet';
  return new Date(value).toLocaleDateString();
};

export default function InternCard({ intern, onReview }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [reviewingTask, setReviewingTask] = useState(null);
  const [saving, setSaving] = useState(false);

  const allSubmissions = intern.submissions || [];
  const submissionCount = intern.submissionCount ?? intern.submissions?.length ?? 0;
  const pendingReviewCount = intern.pendingReviewCount ?? intern.pendingReviews?.length ?? 0;

  const handleApprove = async (taskId, taskTitle) => {
    try {
      setSaving(true);
      await onReview(taskId, {
        feedback: {
          comment: `Approved: ${taskTitle}`,
          status: 'approved',
        },
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRequestChanges = async (comment) => {
    if (!reviewingTask) return;
    try {
      setSaving(true);
      await onReview(reviewingTask.taskId, {
        feedback: {
          comment,
          status: 'changes_requested',
        },
      });
      setReviewingTask(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-start gap-4">
          <img
            src={intern.avatar}
            alt={intern.name}
            className="h-12 w-12 rounded-full bg-slate-100"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900">{intern.name}</h3>
                <p className="text-sm text-slate-500">{intern.field}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {pendingReviewCount > 0 && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    {pendingReviewCount} to review
                  </span>
                )}
                {submissionCount > 0 && (
                  <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                    {submissionCount} submission{submissionCount === 1 ? '' : 's'}
                  </span>
                )}
                <span className={`text-xs font-medium ${intern.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {intern.status === 'active' ? '● Active' : '● Inactive'}
                </span>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {intern.skills.map((skill) => (
                <span key={skill} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
              <FiClock className="h-3.5 w-3.5" />
              Latest submission: {formatDate(intern.latestSubmissionDate)}
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

            {allSubmissions.length > 0 && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  {expanded ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
                  {expanded ? 'Hide submissions' : `View ${allSubmissions.length} submission${allSubmissions.length !== 1 ? 's' : ''}`}
                </button>

                {expanded && (
                  <div className="mt-3 space-y-3">
                    {allSubmissions.map((item) => (
                      <div key={item.taskId} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-slate-900">{item.title}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              Submitted {formatDate(item.submission?.submittedAt)}
                            </p>
                          </div>
                          <StatusBadge status={item.status} />
                        </div>

                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                          {item.submission?.githubLink && (
                            <a
                              href={item.submission.githubLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                            >
                              <FiExternalLink className="h-3.5 w-3.5" />
                              GitHub repository
                            </a>
                          )}
                          {item.submission?.notes && (
                            <p>
                              <span className="font-medium text-slate-700">Note:</span> {item.submission.notes}
                            </p>
                          )}
                          {item.submission?.attachments?.length > 0 && (
                            <div>
                              <p className="font-medium text-slate-700">Attachments</p>
                              <ul className="mt-1 space-y-1">
                                {item.submission.attachments.map((file, index) => (
                                  <li key={`${file.url}-${index}`}>
                                    <a
                                      href={file.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                                    >
                                      <FiPaperclip className="h-3.5 w-3.5" />
                                      {file.name}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.status === 'under_review' && (
                            <>
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => handleApprove(item.taskId, item.title)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                              >
                                <FiCheck className="h-3.5 w-3.5" />
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => setReviewingTask(item)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                              >
                                <FiEdit3 className="h-3.5 w-3.5" />
                                Request changes
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => navigate(`/tasks/${item.taskId}`)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Open task
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/chat?userId=${String(intern.id)}`)}
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

      {reviewingTask && (
        <ReviewSubmissionModal
          taskTitle={reviewingTask.title}
          saving={saving}
          onClose={() => setReviewingTask(null)}
          onSubmit={handleRequestChanges}
        />
      )}
    </>
  );
}
