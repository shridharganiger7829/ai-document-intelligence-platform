import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  CreditCard,
  Layers,
  FileCheck,
} from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, getDashboardPath } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      notifyError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await login({ email, password });
      notifySuccess(`Welcome back, ${data.user.name}!`);
      const targetPath = getDashboardPath(data.user.role);
      navigate(targetPath, { replace: true });
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Invalid email or password.';
      notifyError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071317] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background radial gradient glow (Sight Banking theme) */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-teal-800/30 via-teal-900/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-brand-600/15 via-brand-800/5 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Side: Brand Value Proposition & Floating Visual Cards */}
        <div className="lg:col-span-7 space-y-8 pr-0 lg:pr-8">
          {/* Top Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI DOCUMENT INTELLIGENCE 2.0</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
              Document Workflows You <span className="text-brand-500">Want</span> To Use.
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-lg leading-relaxed">
              Automate multi-tenant document extraction, PyMuPDF OCR, Groq LLM parsing, reviewer verifications, and administrative sign-offs in seconds.
            </p>
          </div>

          {/* Floating UI Decorative Pill Cards (inspired by Sight Banking card graphics) */}
          <div className="relative pt-4 sm:pt-6">
            <div className="grid grid-cols-2 gap-4 max-w-md">
              {/* Card 1: Warm Terracotta Gradient Accent */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow-brand transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Extraction AI</span>
                  <FileCheck className="w-4 h-4 text-white/80" />
                </div>
                <p className="text-2xl font-black tracking-tight">99.8%</p>
                <p className="text-[11px] opacity-80">Extraction Accuracy</p>
              </div>

              {/* Card 2: Dark Teal Metallic Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 border border-white/10 text-white shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Security</span>
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                </div>
                <p className="text-2xl font-black tracking-tight text-white">Multi-Tenant</p>
                <p className="text-[11px] text-slate-400">Isolated Organization Data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Glassmorphic Login Form */}
        <div className="lg:col-span-5 w-full">
          <div className="p-8 sm:p-10 rounded-3xl bg-surface-card/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">Sign In</h2>
              <p className="text-xs text-slate-400">
                Access your company workspace and document pipelines.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Work Email</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-brand hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                <span>{submitting ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Registration Link */}
            <div className="pt-4 border-t border-white/5 text-center text-xs text-slate-400">
              New organization?{' '}
              <Link
                to="/register"
                className="font-bold text-brand-400 hover:text-brand-300 transition-colors"
              >
                Register Company & Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
