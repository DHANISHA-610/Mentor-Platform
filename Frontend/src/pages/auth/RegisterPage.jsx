import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
  if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
  return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
}

const perks = ['Free to join', 'Role-based dashboards', 'Mock data demo'];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const strength = getPasswordStrength(form.password);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    else if (form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email address';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Proceed to Role Selection page and pass the registration data
    navigate('/role-selection', { 
      state: { 
        name: form.name.trim(), 
        email: form.email, 
        password: form.password 
      } 
    });
  };

  const inputClass = (hasError) =>
    `w-full rounded-xl border bg-slate-50/50 py-3 text-sm transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
      hasError ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-brand-500'
    }`;

  return (
    <AuthLayout variant="register">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create your account</h2>
          <p className="mt-2 text-sm text-slate-500">
            Join MentorHub and pick your role after signing up.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {perks.map((perk) => (
              <span key={perk} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <FiCheck className="h-3 w-3" />
                {perk}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full name</label>
            <div className="relative mt-1.5">
              <FiUser className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`${inputClass(errors.name)} pl-10 pr-4`}
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700">Email address</label>
            <div className="relative mt-1.5">
              <FiMail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`${inputClass(errors.email)} pl-10 pr-4`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700">Password</label>
            <div className="relative mt-1.5">
              <FiLock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`${inputClass(errors.password)} pl-10 pr-11`}
                placeholder="Min. 6 characters"
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
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${level <= strength.score ? strength.color : 'bg-slate-200'}`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-slate-500">Strength: {strength.label}</p>
              </div>
            )}
            {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">Confirm password</label>
            <div className="relative mt-1.5">
              <FiLock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className={`${inputClass(errors.confirmPassword)} pl-10 pr-4`}
                placeholder="Re-enter password"
              />
            </div>
            {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-600/25 transition-all hover:bg-brand-700 hover:shadow-md disabled:opacity-60"
          >
            {loading ? <LoadingSpinner size="sm" /> : (
              <>
                Create Account
                <FiArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
