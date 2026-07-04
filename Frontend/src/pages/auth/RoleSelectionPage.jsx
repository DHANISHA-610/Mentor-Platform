import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiAward, FiShield, FiCheck, FiArrowRight } from 'react-icons/fi';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const roles = [
  {
    id: 'intern',
    title: 'Intern',
    icon: FiUsers,
    gradient: 'from-blue-500 to-indigo-600',
    ring: 'ring-blue-500/30',
    description: 'Find mentors, send requests, track tasks, and grow your career.',
    benefits: ['Search mentors by skill', 'Track requests & tasks', 'Chat with mentors'],
  },
  {
    id: 'mentor',
    title: 'Mentor',
    icon: FiAward,
    gradient: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-500/30',
    description: 'Guide interns, review requests, assign tasks, and share expertise.',
    benefits: ['Review incoming requests', 'Manage assigned interns', 'Create & assign tasks'],
  },
  {
    id: 'admin',
    title: 'Admin',
    icon: FiShield,
    gradient: 'from-purple-500 to-violet-600',
    ring: 'ring-purple-500/30',
    description: 'Oversee the platform, manage users, and approve mentor applications.',
    benefits: ['Platform analytics', 'User management', 'Mentor approvals'],
  },
];

export default function RoleSelectionPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    updateUser({ role: selected });

    const routes = {
      intern: '/intern-dashboard',
      mentor: '/mentor-dashboard',
      admin: '/admin-dashboard',
    };

    setLoading(false);
    navigate(routes[selected]);
  };

  return (
    <AuthLayout variant="register">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-8 text-center lg:text-left">
          <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            Step 2 of 2
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Choose your role</h2>
          <p className="mt-2 text-sm text-slate-500">
            Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! How will you use MentorHub?
          </p>
        </div>

        <div className="space-y-3">
          {roles.map((role) => {
            const isSelected = selected === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelected(role.id)}
                className={`relative w-full rounded-2xl border-2 p-5 text-left transition-all ${
                  isSelected
                    ? `border-brand-500 bg-brand-50/50 shadow-md ring-2 ${role.ring}`
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${role.gradient} shadow-sm`}>
                    <role.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-slate-900">{role.title}</h3>
                      {isSelected && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600">
                          <FiCheck className="h-3.5 w-3.5 text-white" />
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{role.description}</p>
                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                      {role.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-center gap-1.5 text-xs text-slate-600">
                          <FiCheck className="h-3 w-3 shrink-0 text-emerald-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected || loading}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/25 transition-all hover:bg-brand-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <LoadingSpinner size="sm" /> : (
            <>
              Continue to Dashboard
              <FiArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </AuthLayout>
  );
}
