import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiCheckCircle, FiMessageSquare, FiUser } from 'react-icons/fi';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import { useAuth } from '../hooks/useAuth';

const API_URL = 'http://localhost:5000/api/tasks';

const progressMap = {
  pending: 0,
  in_progress: 50,
  under_review: 75,
  completed: 100,
  overdue: 20,
};

const statusLabels = {
  approved: 'Approved',
  changes_requested: 'Changes Requested',
  completed: 'Completed',
  in_progress: 'In Progress',
  under_review: 'Under Review',
  pending: 'Pending',
  overdue: 'Overdue',
};

export default function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({ githubLink: '', notes: '', attachments: [] });
  const [attachmentDraft, setAttachmentDraft] = useState({ name: '', url: '' });
  const [feedbackForm, setFeedbackForm] = useState({ comment: '', status: 'changes_requested' });

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load task');
        setTask(data.task);
      } catch (err) {
        setError(err.message || 'Unable to load task');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTask();
    }
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionForm.githubLink.trim()) {
      setError('GitHub link is required to submit your work.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          submission: {
            githubLink: submissionForm.githubLink,
            notes: submissionForm.notes,
            attachments: submissionForm.attachments,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to submit task');
      setTask(data.task);
      setSubmissionForm({ githubLink: '', notes: '', attachments: [] });
      setAttachmentDraft({ name: '', url: '' });
    } catch (err) {
      setError(err.message || 'Unable to submit task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.comment.trim()) {
      setError('Feedback comment is required.');
      return;
    }

    try {
      setFeedbackSaving(true);
      setError('');
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          feedback: {
            comment: feedbackForm.comment,
            status: feedbackForm.status,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save feedback');
      setTask(data.task);
      setFeedbackForm({ comment: '', status: 'changes_requested' });
    } catch (err) {
      setError(err.message || 'Unable to save feedback');
    } finally {
      setFeedbackSaving(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (error) {
      return <ErrorState title="Unable to load task" message={error} onRetry={() => window.location.reload()} />;
    }

    if (!task) {
      return <ErrorState title="Task not found" message="This task does not exist or you do not have permission to view it." />;
    }

    const progress = progressMap[task.status] ?? 0;
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'TBD';
    const createdAt = task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Unknown';
    const mentorName = task.mentor?.name || task.mentorName || task.mentor_name || 'Unknown';
    const assigneeName = task.assignee?.name || task.assigneeName || 'Unknown';
    const canSubmit = user.role === 'intern' && task.assignee?._id === user._id && task.status !== 'completed';
    const latestFeedback = task.feedback?.[task.feedback.length - 1];
    const changesRequested = latestFeedback?.status === 'changes_requested' && task.status === 'in_progress';
    const canLeaveFeedback = user.role === 'mentor' && task.mentor?._id === user._id;

    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold text-slate-900">{task.title}</h1>
              <p className="mt-2 text-sm text-slate-500">{task.description}</p>
            </div>
            <StatusBadge status={task.status} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Mentor</p>
              <p className="mt-2 font-medium text-slate-900">{mentorName}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Assigned to</p>
              <p className="mt-2 font-medium text-slate-900">{assigneeName}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Created</p>
              <p className="mt-2 font-medium text-slate-900">{createdAt}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Due date</p>
              <p className="mt-2 font-medium text-slate-900">{dueDate}</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between gap-4 text-sm text-slate-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-600" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Task details</h2>
              <div className="mt-5 space-y-4 text-sm text-slate-600">
                <div>
                  <p className="font-medium text-slate-800">Expected deliverables</p>
                  <p className="mt-2 text-slate-500">{task.expectedDeliverables || 'No deliverables defined.'}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-800">Priority</p>
                  <p className="mt-2 text-slate-500 capitalize">{task.priority || 'medium'}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-800">Submission</p>
                  {task.submission?.submittedAt ? (
                    <div className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                      <p className="font-medium text-slate-900">Submitted on {new Date(task.submission.submittedAt).toLocaleDateString()}</p>
                      <p className="mt-2">GitHub: <a href={task.submission.githubLink} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">{task.submission.githubLink}</a></p>
                      {task.submission.notes && <p className="mt-2">Notes: {task.submission.notes}</p>}
                      {task.submission.attachments?.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {task.submission.attachments.map((file, index) => (
                            <li key={`${file.url}-${index}`}>
                              <a href={file.url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                                {file.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-slate-500">No submission yet.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Feedback</h2>
                  <p className="mt-1 text-sm text-slate-500">Mentor comments and review history.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <FiMessageSquare className="h-3.5 w-3.5" /> {task.feedback?.length || 0} entries
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {task.feedback?.length ? (
                  task.feedback.map((entry, index) => (
                    <div key={index} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-wide text-slate-500">
                        <span>{entry.reviewerName || 'Mentor'}</span>
                        <span>{statusLabels[entry.status] || entry.status}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-700">{entry.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No feedback yet.</p>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
              <div className="mt-5 space-y-4 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium text-slate-800">Assignee</p>
                  <p className="mt-2 text-slate-500">{assigneeName}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium text-slate-800">Task status</p>
                  <p className="mt-2 text-slate-500 capitalize">{statusLabels[task.status] || task.status}</p>
                  {task.statusUpdatedBy && (
                    <div className="mt-3 border-t border-slate-200 pt-3">
                      <p className="text-xs text-slate-500">
                        Last updated by: <span className="font-medium text-slate-700">{task.statusUpdatedBy.name}</span> ({task.statusUpdatedRole})
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Updated at: <span className="font-medium text-slate-700">{new Date(task.statusUpdatedAt).toLocaleString()}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {canSubmit && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                  {changesRequested || task.submission?.submittedAt ? 'Resubmit work' : 'Submit work'}
                </h2>
                {changesRequested && (
                  <p className="mt-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Your mentor requested changes. Update your submission and send it again for review.
                  </p>
                )}
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">GitHub link</label>
                    <input
                      value={submissionForm.githubLink}
                      onChange={(e) => setSubmissionForm((prev) => ({ ...prev, githubLink: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Submission note</label>
                    <textarea
                      value={submissionForm.notes}
                      onChange={(e) => setSubmissionForm((prev) => ({ ...prev, notes: e.target.value }))}
                      rows={4}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      placeholder="Add extra details about your submission..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">File attachments</label>
                    <p className="mt-1 text-xs text-slate-500">Add a file name and link (Google Drive, Dropbox, etc.).</p>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <input
                        value={attachmentDraft.name}
                        onChange={(e) => setAttachmentDraft((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        placeholder="File name"
                      />
                      <input
                        value={attachmentDraft.url}
                        onChange={(e) => setAttachmentDraft((prev) => ({ ...prev, url: e.target.value }))}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!attachmentDraft.name.trim() || !attachmentDraft.url.trim()) return;
                          setSubmissionForm((prev) => ({
                            ...prev,
                            attachments: [
                              ...prev.attachments,
                              {
                                name: attachmentDraft.name.trim(),
                                url: attachmentDraft.url.trim(),
                                fileType: '',
                              },
                            ],
                          }));
                          setAttachmentDraft({ name: '', url: '' });
                        }}
                        className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Add file
                      </button>
                    </div>
                    {submissionForm.attachments.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {submissionForm.attachments.map((file, index) => (
                          <li key={`${file.url}-${index}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                            <span className="truncate text-slate-700">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => setSubmissionForm((prev) => ({
                                ...prev,
                                attachments: prev.attachments.filter((_, itemIndex) => itemIndex !== index),
                              }))}
                              className="text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full justify-center rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:translate-y-0"
                  >
                    {submitting ? 'Submitting…' : changesRequested ? 'Resubmit for review' : 'Submit for review'}
                  </button>
                </form>
              </section>
            )}

            {canLeaveFeedback && task.status === 'under_review' && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Review submission</h2>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={feedbackSaving}
                    onClick={async () => {
                      setFeedbackForm({ comment: 'Great work. Approved.', status: 'approved' });
                      try {
                        setFeedbackSaving(true);
                        setError('');
                        const res = await fetch(`${API_URL}/${id}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            feedback: { comment: 'Great work. Approved.', status: 'approved' },
                          }),
                        });
                        const data = await res.json();
                        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to approve');
                        setTask(data.task);
                      } catch (err) {
                        setError(err.message || 'Unable to approve submission');
                      } finally {
                        setFeedbackSaving(false);
                      }
                    }}
                    className="inline-flex flex-1 justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-emerald-700 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackForm({ comment: '', status: 'changes_requested' })}
                    className="inline-flex flex-1 justify-center rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-amber-100 cursor-pointer"
                  >
                    Request changes
                  </button>
                </div>
                <form onSubmit={handleFeedbackSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Review status</label>
                    <select
                      value={feedbackForm.status}
                      onChange={(e) => setFeedbackForm((prev) => ({ ...prev, status: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      <option value="changes_requested">Changes requested</option>
                      <option value="approved">Approve and complete</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Feedback</label>
                    <textarea
                      value={feedbackForm.comment}
                      onChange={(e) => setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))}
                      rows={4}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      placeholder="Share improvements, praise, or next steps..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={feedbackSaving}
                    className="inline-flex w-full justify-center rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:translate-y-0"
                  >
                    {feedbackSaving ? 'Saving…' : 'Save feedback'}
                  </button>
                </form>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-slate-50"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to tasks
        </button>

        <PageHeader title="Task details" subtitle="Review the full task, submit work, or leave mentor feedback." />
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}
