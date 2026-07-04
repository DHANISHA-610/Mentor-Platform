import { useState, useMemo } from 'react';
import { FiSearch, FiFilter, FiCheck } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import MentorCard from '../../components/intern/MentorCard';
import EmptyState from '../../components/ui/EmptyState';
import { mentors, allSkills } from '../../utils/mockData';

export default function SearchMentorsPage() {
  const [search, setSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [requestedIds, setRequestedIds] = useState(new Set());
  const [toast, setToast] = useState(null);

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
  }, [search, selectedSkills]);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleRequest = (mentor) => {
    setRequestedIds((prev) => new Set([...prev, mentor.id]));
    setToast(`Request sent to ${mentor.name}!`);
    setTimeout(() => setToast(null), 3000);
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

      {filtered.length === 0 ? (
        <EmptyState
          icon={FiSearch}
          title="No mentors found"
          description="Try adjusting your search or filters to find available mentors."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              onRequest={handleRequest}
              requested={requestedIds.has(mentor.id)}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
