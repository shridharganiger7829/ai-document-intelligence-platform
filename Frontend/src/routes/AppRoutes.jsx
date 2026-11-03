import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

// Home Landing Page
import Home from '../pages/Home';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import DocumentRepository from '../pages/admin/DocumentRepository';
import PendingApprovals from '../pages/admin/PendingApprovals';
import UserManagement from '../pages/admin/UserManagement';
import AuditLogs from '../pages/admin/AuditLogs';

// Reviewer Pages
import ReviewerDashboard from '../pages/reviewer/ReviewerDashboard';
import AssignedDocuments from '../pages/reviewer/AssignedDocuments';
import ReviewWorkspace from '../pages/reviewer/ReviewWorkspace';

// Employee Pages
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import UploadDocumentPage from '../pages/employee/UploadDocumentPage';
import DocumentTracking from '../pages/employee/DocumentTracking';

export const AppRoutes = () => {
  const { isAuthenticated, role, getDashboardPath } = useAuth();

  return (
    <Routes>
      {/* Public Home Landing Page */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />

      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={getDashboardPath(role)} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={getDashboardPath(role)} replace /> : <Register />}
      />

      {/* Protected Admin Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/documents" element={<DocumentRepository />} />
        <Route path="/admin/approvals" element={<PendingApprovals />} />
        <Route path="/admin/upload" element={<UploadDocumentPage />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />
      </Route>

      {/* Protected Reviewer Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['reviewer']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/reviewer/dashboard" element={<ReviewerDashboard />} />
        <Route path="/reviewer/documents" element={<AssignedDocuments />} />
        <Route path="/reviewer/review/:documentId" element={<ReviewWorkspace />} />
      </Route>

      {/* Protected Employee Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/upload" element={<UploadDocumentPage />} />
        <Route path="/employee/tracking" element={<DocumentTracking />} />
      </Route>

      {/* Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
