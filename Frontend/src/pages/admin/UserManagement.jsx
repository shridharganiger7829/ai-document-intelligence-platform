import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  UserPlus,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Lock,
  User,
  CheckCircle,
  XCircle,
  Building,
} from 'lucide-react';

export const UserManagement = () => {
  const { user: currentAdmin } = useAuth();
  const { notifySuccess, notifyError, notifyWarning } = useNotification();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState('reviewer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status toggle confirmation
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers();
      setUsers(res.users || []);
    } catch (err) {
      notifyError(err.response?.data?.message || 'Failed to fetch company users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createName.trim() || !createEmail.trim() || !createPassword) {
      notifyWarning('Please provide all user fields.');
      return;
    }
    if (createPassword.length < 8) {
      notifyWarning('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await userService.createUser({
        name: createName.trim(),
        email: createEmail.trim(),
        password: createPassword,
        role: createRole,
      });

      notifySuccess(`${createRole.toUpperCase()} account created successfully!`);
      setIsCreateOpen(false);
      setCreateName('');
      setCreateEmail('');
      setCreatePassword('');
      fetchUsers();
    } catch (err) {
      notifyError(err.response?.data?.message || 'Failed to create user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!confirmTarget) return;

    if (confirmTarget.id === currentAdmin?.id) {
      notifyError('You cannot deactivate your own administrative account.');
      setConfirmTarget(null);
      return;
    }

    setIsStatusUpdating(true);
    try {
      const nextStatus = !confirmTarget.is_active;
      await userService.updateUserStatus(confirmTarget.id, nextStatus);
      notifySuccess(
        `User ${confirmTarget.name} has been ${nextStatus ? 'activated' : 'deactivated'}.`
      );
      setConfirmTarget(null);
      fetchUsers();
    } catch (err) {
      notifyError(err.response?.data?.message || 'Unable to update user status.');
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns = [
    {
      key: 'name',
      title: 'User Details',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center font-bold text-brand-400 text-xs">
            {row.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-white block">{row.name}</span>
            <span className="text-xs text-slate-400">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Assigned Role',
      render: (role) => {
        const badgeStyles = {
          admin: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
          reviewer: 'bg-teal-950/60 text-teal-300 border-teal-800/60',
          employee: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
        }[role] || 'bg-slate-800 text-slate-300 border-slate-700';

        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeStyles}`}
          >
            {role}
          </span>
        );
      },
    },
    {
      key: 'is_active',
      title: 'Account Status',
      render: (active) => <StatusBadge status={active ? 'active' : 'inactive'} />,
    },
    {
      key: 'created_at',
      title: 'Member Since',
      render: (date) => (
        <span className="text-xs text-slate-400">
          {date ? new Date(date).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Action',
      align: 'right',
      render: (_, row) => {
        const isSelf = row.id === currentAdmin?.id;
        return (
          <button
            onClick={() => setConfirmTarget(row)}
            disabled={isSelf}
            title={isSelf ? 'Cannot deactivate yourself' : 'Toggle User Active Status'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              row.is_active
                ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50'
                : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {row.is_active ? (
              <>
                <UserX className="w-3.5 h-3.5" />
                <span>Deactivate</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>Activate</span>
              </>
            )}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-surface-card border border-white/5 backdrop-blur-md shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            User & Team Directory
          </h2>
          <p className="text-xs text-slate-400">
            Manage company employees, document reviewers, and user permissions.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-md hover:shadow-glow-brand transition-all duration-200"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchBar
          placeholder="Search by name or email..."
          value={search}
          onChange={setSearch}
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-navy-900 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Roles</option>
            <option value="reviewer">Reviewers</option>
            <option value="employee">Employees</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        emptyTitle="No team members found"
        emptyDescription="Create an employee or reviewer to begin delegating document workflows."
      />

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Team Member Account"
        subtitle="New user will be automatically assigned to your company tenant."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Full Name</label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 absolute left-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Marcus Vance"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Work Email</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 absolute left-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="marcus@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Password (minimum 8 chars)
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3.5 text-slate-400" />
              <input
                type="password"
                required
                minLength={8}
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Role</label>
            <select
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="reviewer">Reviewer (Verifies AI extractions)</option>
              <option value="employee">Employee (Uploads & tracks documents)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-md hover:shadow-glow-brand transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating User...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog for Status Change */}
      <ConfirmDialog
        isOpen={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmStatusChange}
        isLoading={isStatusUpdating}
        type={confirmTarget?.is_active ? 'danger' : 'info'}
        title={
          confirmTarget?.is_active
            ? `Deactivate ${confirmTarget?.name}?`
            : `Activate ${confirmTarget?.name}?`
        }
        message={
          confirmTarget?.is_active
            ? `Are you sure you want to deactivate ${confirmTarget?.name}? They will immediately lose access to company document workflows.`
            : `Re-activate ${confirmTarget?.name}? They will be granted access according to their ${confirmTarget?.role} role.`
        }
        confirmText={confirmTarget?.is_active ? 'Yes, Deactivate' : 'Yes, Activate'}
      />
    </div>
  );
};

export default UserManagement;
