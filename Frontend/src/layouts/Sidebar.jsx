import { NavLink } from 'react-router-dom';
import {
  FiHome, FiSearch, FiSend, FiCheckSquare, FiMessageSquare, FiSettings,
  FiInbox, FiUsers, FiClipboard, FiBarChart2, FiUserCheck, FiShield, FiX,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const internLinks = [
  { to: '/intern-dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/search-mentors', label: 'Search Mentors', icon: FiSearch },
  { to: '/my-requests', label: 'My Requests', icon: FiSend },
  { to: '/my-tasks', label: 'My Tasks', icon: FiCheckSquare },
  { to: '/chat', label: 'Chat', icon: FiMessageSquare },
  { to: '/settings', label: 'Settings', icon: FiSettings },
];

const mentorLinks = [
  { to: '/mentor-dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/incoming-requests', label: 'Incoming Requests', icon: FiInbox },
  { to: '/assigned-interns', label: 'Assigned Interns', icon: FiUsers },
  { to: '/task-management', label: 'Task Management', icon: FiClipboard },
  { to: '/chat', label: 'Chat', icon: FiMessageSquare },
  { to: '/settings', label: 'Settings', icon: FiSettings },
];

const adminLinks = [
  { to: '/admin-dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/user-management', label: 'User Management', icon: FiUsers },
  { to: '/mentor-approvals', label: 'Mentor Approvals', icon: FiUserCheck },
  { to: '/settings', label: 'Settings', icon: FiSettings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  const linkMap = {
    intern: internLinks,
    mentor: mentorLinks,
    admin: adminLinks,
  };

  const links = linkMap[user?.role] || [];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <FiShield className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-slate-900">MentorHub</span>
        </div>
        <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden">
          <FiX className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {user?.role} Menu
        </p>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <link.icon className="h-5 w-5 shrink-0" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Signed in as</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">{user?.name}</p>
          <p className="truncate text-xs capitalize text-brand-600">{user?.role}</p>
        </div>
      </div>
    </aside>
  );
}
