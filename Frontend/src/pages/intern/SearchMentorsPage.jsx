import { useEffect, useState, useMemo } from 'react';
import { FiSearch, FiFilter, FiCheck } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import MentorCard from '../../components/intern/MentorCard';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import { useAuth } from '../../hooks/useAuth';

const API_URL = 'http://localhost:5000/api/mentors';
const REQUESTS_API_URL = 'http://localhost:5000/api/requests';

export default function SearchMentorsPage() {
  const { token } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [requestedIds, setRequestedIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        setError('');

        const [mentorsRes, skillsRes] = await Promise.all([
          fetch(API_URL),
          fetch(`${API_URL}/skills`),
        ]);

        const mentorsData = await mentorsRes.json();
        const skillsData = await skillsRes.json();

        if (!mentorsRes.ok || !mentorsData.success) {
          throw new Error(mentorsData.message || 'Failed to load mentors');
        }

        if (!skillsRes.ok || !skillsData.success) {
          throw new Error(skillsData.message || 'Failed to load skills');
        }

        setMentors(mentorsData.mentors || []);
        setAllSkills(skillsData.skills || []);
      } catch (err) {
        setError(err.message || 'Unable to load mentors right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const filtered = useMemo(() => {
    return mentors.filter((mentor) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        mentor.name.toLowerCase().includes(q) ||
        mentor.title.toLowerCase().includes(q) ||
        mentor.company.toLowerCase().includes(q) ||
        mentor.skills.some((s) => s.toLowerCase().includes(q));

      const matchesSkills = selectedSkills.length === 0 ||
        selectedSkills.every((skill) => mentor.skills.includes(skill));

      return matchesSearch && matchesSkills;
    });
  }, [search, selectedSkills, mentors]);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);

  const openRequestModal = (mentor) => {
    setSelectedMentor(mentor);
    setRequestMessage(`I want to learn about ${mentor.title || 'fullstack development'} and build a strong project portfolio.`);
    setRequestModalOpen(true);
  };

  const closeRequestModal = () => {
    setRequestModalOpen(false);
    setSelectedMentor(null);
    setRequestMessage('');
  };

  const handleRequest = async () => {
    if (!selectedMentor || !requestMessage.trim()) {
      setToast('Please enter a request message before sending.');
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      const res = await fetch(REQUESTS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mentorId: selectedMentor._id,
          message: requestMessage.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to send request');
      setRequestedIds((prev) => new Set([...prev, selectedMentor._id]));
      setToast(`Request sent to ${selectedMentor.name}!`);
      setTimeout(() => setToast(null), 3000);
      closeRequestModal();
    } catch (err) {
      setToast(err.message || 'Unable to send request');
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Search Mentors" subtitle="Find the perfect mentor for your career goals" />

      {toast && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <FiCheck className="h-4 w-4" />
          {toast}
        </div>
      )}

      <div className="mb-6 space-y-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, title, company, or skill..."
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <FiFilter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Filter by skills</span>
            {selectedSkills.length > 0 && (
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                {selectedSkills.length} active
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedSkills.includes(skill)
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to load mentors"
          message={error}
          onRetry={() => window.location.reload()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FiSearch}
          title="No mentors found"
          description="Try adjusting your search or filters to find available mentors."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((mentor) => (
            <MentorCard
              key={mentor._id}
              mentor={{ ...mentor, id: mentor._id }}
              onRequest={() => openRequestModal(mentor)}
              requested={requestedIds.has(mentor._id)}
            />
          ))}
        </div>
      )}

      {requestModalOpen && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Send request to {selectedMentor.name}</h2>
                <p className="mt-1 text-sm text-slate-500">Type your message and explain what you want to learn.</p>
              </div>
              <button
                type="button"
                onClick={closeRequestModal}
                className="rounded-full bg-slate-100 px-3 py-2 text-slate-600 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              rows={6}
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              placeholder="Type your mentorship request message here..."
            />

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeRequestModal}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequest}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
