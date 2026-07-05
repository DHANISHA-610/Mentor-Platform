import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';
import LoadingSpinner from '../components/ui/LoadingSpinner';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import RoleSelectionPage from '../pages/auth/RoleSelectionPage';
import SettingsPage from '../pages/SettingsPage';
import ChatPage from '../pages/ChatPage';

import InternDashboard from '../pages/intern/InternDashboard';
import SearchMentorsPage from '../pages/intern/SearchMentorsPage';
import MyRequestsPage from '../pages/intern/MyRequestsPage';
import MyTasksPage from '../pages/intern/MyTasksPage';

import MentorDashboard from '../pages/mentor/MentorDashboard';
import IncomingRequestsPage from '../pages/mentor/IncomingRequestsPage';
import AssignedInternsPage from '../pages/mentor/AssignedInternsPage';
import TaskManagementPage from '../pages/mentor/TaskManagementPage';

import AdminDashboard from '../pages/admin/AdminDashboard';
import AnalyticsPage from '../pages/admin/AnalyticsPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import MentorApprovalsPage from '../pages/admin/MentorApprovalsPage';

function RoleRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user.role) {
    return <Navigate to="/role-selection" replace />;
  }

  const dashboardMap = {
    intern: '/intern-dashboard',
    mentor: '/mentor-dashboard',
    admin: '/admin-dashboard',
  };

  return <Navigate to={dashboardMap[user.role] || '/role-selection'} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/role-selection" element={<RoleSelectionPage />} />

      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['intern', 'mentor', 'admin']}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute allowedRoles={['intern', 'mentor']}>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/intern-dashboard"
        element={
          <ProtectedRoute allowedRoles={['intern']}>
            <InternDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search-mentors"
        element={
          <ProtectedRoute allowedRoles={['intern']}>
            <SearchMentorsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-requests"
        element={
          <ProtectedRoute allowedRoles={['intern']}>
            <MyRequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-tasks"
        element={
          <ProtectedRoute allowedRoles={['intern']}>
            <MyTasksPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mentor-dashboard"
        element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <MentorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incoming-requests"
        element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <IncomingRequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assigned-interns"
        element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <AssignedInternsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/task-management"
        element={
          <ProtectedRoute allowedRoles={['mentor']}>
            <TaskManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-management"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor-approvals"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MentorApprovalsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
