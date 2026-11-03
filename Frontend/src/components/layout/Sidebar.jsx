import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Users,
  ShieldCheck,
  UploadCloud,
  LogOut,
  FolderOpen,
  Sparkles,
  CreditCard,
  Building2,
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout, role } = useAuth();

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Documents', path: '/admin/documents', icon: FolderOpen },
    { name: 'Pending Approvals', path: '/admin/approvals', icon: CheckSquare },
    { name: 'Upload & Process', path: '/admin/upload', icon: UploadCloud },
    { name: 'Team & Users', path: '/admin/users', icon: Users },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
  ];

  const reviewerNav = [
    { name: 'Reviewer Dashboard', path: '/reviewer/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Documents', path: '/reviewer/documents', icon: FileText },
  ];

  const employeeNav = [
    { name: 'Employee Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'Upload Documents', path: '/employee/upload', icon: UploadCloud },
    { name: 'Track Documents', path: '/employee/tracking', icon: FileText },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'reviewer' ? reviewerNav : employeeNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-navy-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-navy-900/95 border-r border-white/5 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and Brand Header (Sight Banking / Halo Lab inspired aesthetic) */}
        <Link to="/" className="h-20 flex items-center gap-3 px-6 border-b border-white/5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-glow-brand flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              DOCUFLOW<span className="text-brand-500 font-black">AI</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400">
              Intelligence SaaS
            </span>
          </div>
        </Link>

        {/* Company context pill */}
        <div className="px-5 py-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
            <div className="truncate">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Company #{user?.company_id || '1'}</span>
              <span className="font-semibold text-slate-200 truncate block">Workspace Active</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-glow-brand font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-white/5">
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center font-bold text-brand-400 text-xs flex-shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
                <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  {role || 'employee'}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
