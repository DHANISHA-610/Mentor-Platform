import { Link } from 'react-router-dom';
import {
  FiUsers, FiTrendingUp, FiMessageSquare, FiCheckCircle,
  FiAward, FiStar, FiShield,
} from 'react-icons/fi';

const stats = [
  { label: 'Active Users', value: '248+', icon: FiUsers },
  { label: 'Mentor Pairings', value: '67', icon: FiTrendingUp },
  { label: 'Tasks Completed', value: '892', icon: FiCheckCircle },
];

const features = [
  {
    icon: FiUsers,
    title: 'Smart Matching',
    description: 'Find mentors by skills, industry, and career goals.',
  },
  {
    icon: FiMessageSquare,
    title: 'Real-time Chat',
    description: 'Stay connected with mentors through instant messaging.',
  },
  {
    icon: FiAward,
    title: 'Task Tracking',
    description: 'Manage assignments, deadlines, and progress in one place.',
  },
];

export default function AuthLayout({ children, variant = 'login' }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left panel — rich marketing / brand side */}
      <div className="relative hidden w-[52%] overflow-hidden lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-brand-900 to-violet-950" />

        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-32 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        {/* Grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 flex flex-1 flex-col justify-between overflow-y-auto p-10 xl:p-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
              <FiShield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-white">MentorHub</p>
              <p className="text-xs text-indigo-200">Career growth platform</p>
            </div>
          </div>

          {/* Hero copy */}
          <div className="my-8 max-w-lg">
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
              {variant === 'register'
                ? 'Start your mentorship journey today'
                : 'Grow faster with the right mentor'}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-indigo-100/90 xl:text-lg">
              {variant === 'register'
                ? 'Join interns, mentors, and admins on a platform built for meaningful career connections and measurable progress.'
                : 'Access your dashboard, connect with mentors, track tasks, and accelerate your career — all in one place.'}
            </p>
          </div>

          {/* Stats row */}
          <div className="mb-8 grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-md"
              >
                <stat.icon className="mb-2 h-5 w-5 text-indigo-200" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="mt-0.5 text-xs text-indigo-200">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Feature cards */}
          <div className="space-y-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 rounded-2xl bg-white/8 p-4 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-white/12"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{feature.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-indigo-200/80">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form side */}
      <div className="flex w-full flex-col lg:w-[48%]">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
              <FiShield className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">MentorHub</span>
          </div>
          {variant === 'login' ? (
            <Link to="/register" className="text-sm font-medium text-brand-600">Sign up</Link>
          ) : (
            <Link to="/login" className="text-sm font-medium text-brand-600">Sign in</Link>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 xl:px-20">
          {children}
        </div>

        <div className="hidden border-t border-slate-100 px-6 py-4 text-center text-xs text-slate-400 lg:block">
          © 2026 MentorHub Platform · Built for interns, mentors &amp; admins
        </div>
      </div>
    </div>
  );
}
