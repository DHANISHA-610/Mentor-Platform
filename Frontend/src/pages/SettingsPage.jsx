import { useState, useEffect } from 'react';
import { FiUser, FiLock, FiBell, FiCheck, FiBriefcase, FiGlobe, FiLink, FiFileText } from 'react-icons/fi';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../hooks/useAuth';

const API_URL = 'http://localhost:5000/api/profile';

export default function SettingsPage() {
  const { user, token, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    profileImage: user?.profileImage || '',
    title: user?.title || '',
    company: user?.company || '',
    location: user?.location || '',
    bio: user?.bio || '',
    experience: user?.experience || '',
    skills: user?.skills || [],
    specialization: user?.specialization || '',
    availability: user?.availability || 'Available',
    linkedin: user?.linkedin || '',
    portfolio: user?.portfolio || '',
    resume: user?.resume || '',
    certifications: user?.certifications || [],
  });
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
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    setProfile({
      name: user?.name || '',
      profileImage: user?.profileImage || '',
      title: user?.title || '',
      company: user?.company || '',
      location: user?.location || '',
      bio: user?.bio || '',
      experience: user?.experience || '',
      skills: user?.skills || [],
      specialization: user?.specialization || '',
      availability: user?.availability || 'Available',
      linkedin: user?.linkedin || '',
      portfolio: user?.portfolio || '',
      resume: user?.resume || '',
      certifications: user?.certifications || [],
    });
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addSkill = () => {
    const rawValue = skillInput.trim();
    if (!rawValue) return;

    const newSkills = rawValue
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (!newSkills.length) return;

    const uniqueSkills = newSkills.filter(
      (skill) => !profile.skills.some((existingSkill) => existingSkill.toLowerCase() === skill.toLowerCase())
    );

    if (!uniqueSkills.length) {
      setSkillInput('');
      return;
    }

    setProfile({ ...profile, skills: [...profile.skills, ...uniqueSkills] });
    setSkillInput('');
  };

  const removeSkill = (skillToRemove) => {
    setProfile({ ...profile, skills: profile.skills.filter((skill) => skill !== skillToRemove) });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');

    if (!profile.name.trim()) {
      setProfileError('Name is required');
      return;
    }

    if (user?.role === 'mentor' && profile.skills.length < 6) {
      setProfileError('Please add at least 6 skills to complete your mentor profile');
      return;
    }

    setSavingProfile(true);
    try {
      const payload = {
        name: profile.name.trim(),
        profileImage: profile.profileImage,
        title: profile.title,
        company: profile.company,
        location: profile.location,
        bio: profile.bio,
        experience: profile.experience,
        skills: profile.skills,
        specialization: profile.specialization,
        availability: profile.availability,
        linkedin: profile.linkedin,
        portfolio: profile.portfolio,
        resume: profile.resume,
        certifications: profile.certifications,
        profileCompleted: user?.role === 'mentor' ? true : undefined,
      };

      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        updateUser({ name: data.user.name, ...data.user });
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
            {user?.role === 'mentor' && (
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <FiBriefcase className="h-4 w-4 text-brand-600" />
                  <h3 className="text-sm font-semibold text-slate-900">Mentor Profile Details</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Profile Photo URL</label>
                    <input type="text" value={profile.profileImage} onChange={(e) => setProfile({ ...profile, profileImage: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Job Title</label>
                    <input type="text" value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Company</label>
                    <input type="text" value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Location</label>
                    <input type="text" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Bio</label>
                    <textarea rows="3" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Experience</label>
                    <input type="text" value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="8+ years" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Specialization</label>
                    <input type="text" value={profile.specialization} onChange={(e) => setProfile({ ...profile, specialization: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Skills</label>
                    <div className="mt-1 rounded-lg border border-slate-300 bg-white p-3">
                      <div className="mb-2 flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <span key={skill} className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-sm text-brand-700">
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="text-brand-700 hover:text-brand-900">
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              addSkill();
                            }
                          }}
                          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          placeholder="Type a skill and press Enter"
                        />
                        <button type="button" onClick={addSkill} className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white">
                          Add Skill
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">Add at least 6 skills to complete your mentor profile.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Availability</label>
                    <select value={profile.availability} onChange={(e) => setProfile({ ...profile, availability: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                      <option value="Available">Available</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">LinkedIn URL</label>
                    <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm">
                      <FiLink className="h-4 w-4 text-slate-400" />
                      <input type="text" value={profile.linkedin} onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })} className="w-full border-0 p-0 focus:outline-none" placeholder="https://linkedin.com/in/" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Portfolio URL</label>
                    <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm">
                      <FiGlobe className="h-4 w-4 text-slate-400" />
                      <input type="text" value={profile.portfolio} onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })} className="w-full border-0 p-0 focus:outline-none" placeholder="https://..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Resume URL</label>
                    <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm">
                      <FiFileText className="h-4 w-4 text-slate-400" />
                      <input type="text" value={profile.resume} onChange={(e) => setProfile({ ...profile, resume: e.target.value })} className="w-full border-0 p-0 focus:outline-none" placeholder="https://..." />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-brand-700 disabled:opacity-60 disabled:hover:translate-y-0"
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
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-brand-700 disabled:opacity-60 disabled:hover:translate-y-0"
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
