import { useState, useEffect } from 'react';
import { FiUser, FiLock, FiBell, FiCheck } from 'react-icons/fi';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../hooks/useAuth';

const API_URL = 'http://localhost:5000/api/profile';

export default function SettingsPage() {
  const { user, token, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '' });
  const [passwords, setPasswords] = useState({ current: '', newPassword: '', confirm: '' });
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    tasks: true,
    messages: true,
    requests: false,
  });
  const [toast, setToast] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setProfile({ name: user?.name || '' });
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');

    if (!profile.name.trim()) {
      setProfileError('Name is required');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: profile.name.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        updateUser({ name: data.user.name });
        showToast('Profile updated successfully');
      } else {
        setProfileError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setProfileError('Server connection error. Is the backend running?');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwords.newPassword !== passwords.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch(`${API_URL}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPasswords({ current: '', newPassword: '', confirm: '' });
        showToast('Password updated successfully');
      } else {
        setPasswordError(data.message || 'Unable to update password');
      }
    } catch (error) {
      setPasswordError('Server connection error. Is the backend running?');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Settings" subtitle="Manage your account preferences and security" />

      {toast && (
        <div className={`mb-6 flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          <FiCheck className="h-4 w-4" />
          {toast.message}
        </div>
      )}

      <div className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-brand-50 p-2">
              <FiUser className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
              <p className="text-sm text-slate-500">Update your personal information</p>
            </div>
          </div>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="mt-1 w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="mt-1 w-full max-w-md rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
              />
              <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
          {profileError && <p className="mt-2 text-xs text-red-500">{profileError}</p>}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <FiLock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Security</h2>
              <p className="text-sm text-slate-500">Change your password</p>
            </div>
          </div>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Current Password</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="mt-1 w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">New Password</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="mt-1 w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="mt-1 w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <FiBell className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
              <p className="text-sm text-slate-500">Choose what you want to be notified about</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email notifications', desc: 'Receive updates via email' },
              { key: 'push', label: 'Push notifications', desc: 'Browser push notifications' },
              { key: 'tasks', label: 'Task updates', desc: 'When tasks are assigned or updated' },
              { key: 'messages', label: 'New messages', desc: 'When you receive a new message' },
              { key: 'requests', label: 'Request updates', desc: 'Mentorship request status changes' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <button
                  onClick={() => {
                    setNotifications({ ...notifications, [item.key]: !notifications[item.key] });
                    showToast('Notification preferences saved');
                  }}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifications[item.key] ? 'bg-brand-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
