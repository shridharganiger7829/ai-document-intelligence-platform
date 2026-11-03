import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  Building,
  CheckCircle2,
} from 'lucide-react';

export const Register = () => {
  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, login, getDashboardPath } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyName.trim() || !name.trim() || !email.trim() || !password) {
      notifyError('All fields are required.');
      return;
    }

    if (password.length < 8) {
      notifyError('Password must contain at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        company_name: companyName.trim(),
        name: name.trim(),
        email: email.trim(),
        password,
      });

      notifySuccess('Company registered successfully! Logging you in...');

      // Auto login after registration
      const loginData = await login({ email: email.trim(), password });
      navigate(getDashboardPath(loginData.user.role), { replace: true });
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Registration could not be completed.';
      notifyError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071317] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-teal-800/25 via-teal-900/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-brand-600/15 via-brand-800/5 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl z-10">
        <div className="p-8 sm:p-10 rounded-3xl bg-surface-card/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Register New Organization</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Create Your Enterprise Workspace
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Set up your company tenant and initial administrator account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Company / Organization Name</label>
              <div className="relative flex items-center">
                <Building className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Global Corporation"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Admin Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Administrator Full Name</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Admin Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Administrator Email</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@acme.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Password (minimum 8 characters)</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-brand transition-all duration-200 disabled:opacity-50"
            >
              <span>{submitting ? 'Creating Company Workspace...' : 'Register Company & Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-white/5 text-center text-xs text-slate-400">
            Already have an organization?{' '}
            <Link to="/login" className="font-bold text-brand-400 hover:text-brand-300">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
