import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const demoRoles = [
  { id: 'intern', label: 'Intern', desc: 'Find mentors & tasks' },
  { id: 'mentor', label: 'Mentor', desc: 'Manage mentees' },
  { id: 'admin', label: 'Admin', desc: 'Platform control' },
];

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const routes = { intern: '/intern-dashboard', mentor: '/mentor-dashboard', admin: '/admin-dashboard' };
      navigate(routes[user.role] || '/role-selection', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email address';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    login({
      id: Date.now(),
      name: form.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email: form.email,
      role: null,
    });

    setLoading(false);
    navigate('/role-selection');
  };

  const fillDemo = (role) => {
    const demos = {
      intern: { email: 'intern@demo.com', password: 'demo123' },
      mentor: { email: 'mentor@demo.com', password: 'demo123' },
      admin: { email: 'admin@demo.com', password: 'demo123' },
    };
    setForm(demos[role]);
    setErrors({});
  };

  return (
    <AuthLayout variant="login">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to access your dashboard and continue your mentorship journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
            <div className="relative mt-1.5">
              <FiMail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full rounded-xl border bg-slate-50/50 py-3 pl-10 pr-4 text-sm transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                  errors.email ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-brand-500'
                }`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <button type="button" className="text-xs font-medium text-brand-600 hover:text-brand-700">
                Forgot password?
              </button>
            </div>
            <div className="relative mt-1.5">
              <FiLock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`w-full rounded-xl border bg-slate-50/50 py-3 pl-10 pr-11 text-sm transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                  errors.password ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-brand-500'
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-600/25 transition-all hover:bg-brand-700 hover:shadow-md disabled:opacity-60"
          >
            {loading ? <LoadingSpinner size="sm" /> : (
              <>
                Sign In
                <FiArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 font-medium uppercase tracking-wider text-slate-400">Quick demo access</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {demoRoles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => fillDemo(role.id)}
                className="rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-3 text-center transition-all hover:border-brand-300 hover:bg-brand-50 hover:shadow-sm"
              >
                <p className="text-xs font-semibold capitalize text-slate-800">{role.label}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">{role.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Create account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
