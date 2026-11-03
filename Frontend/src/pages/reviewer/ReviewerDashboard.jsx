import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { useNotification } from '../../context/NotificationContext';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flag,
  ArrowRight,
  Sparkles,
  FileCheck,
} from 'lucide-react';

export const ReviewerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notifyError } = useNotification();
  const navigate = useNavigate();

  const loadReviewerStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getReviewerDashboard();
      setData(res);
    } catch (err) {
      notifyError(err.response?.data?.message || 'Failed to load reviewer dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviewerStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading reviewer metrics..." />;
  }

  const stats = data?.statistics || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-surface-card to-navy-900 border border-white/5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reviewer Workspace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Document Verification Queue
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
            Verify AI-extracted structured data against original PDFs and validate business compliance.
          </p>
        </div>

        <div>
          <button
            onClick={() => navigate('/reviewer/documents')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-brand transition-all duration-200"
          >
            <span>Open Assigned Queue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reviewer Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Assigned"
          value={stats.total_assigned}
          subtitle="Assigned to you"
          icon={FileText}
          colorScheme="teal"
          onClick={() => navigate('/reviewer/documents')}
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pending_reviews}
          subtitle="Waiting for inspection"
          icon={Clock}
          colorScheme="brand"
          trend="Action Needed"
          onClick={() => navigate('/reviewer/documents')}
        />
        <StatCard
          title="Verified"
          value={stats.verified_documents}
          subtitle="Validated correct"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <StatCard
          title="Corrections Req."
          value={stats.corrections_requested}
          subtitle="Sent back to employee"
          icon={AlertTriangle}
          colorScheme="brand"
        />
        <StatCard
          title="Flagged for Admin"
          value={stats.flagged_documents}
          subtitle="Special escalation"
          icon={Flag}
          colorScheme="rose"
        />
      </div>

      {/* Quick Launch Cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div
          onClick={() => navigate('/reviewer/documents')}
          className="p-6 rounded-3xl bg-surface-card/80 border border-white/5 hover:border-brand-500/30 transition-all duration-300 cursor-pointer shadow-xl group"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-4 group-hover:scale-110 transition-transform">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1 group-hover:text-brand-400 transition-colors">
            Start Verifying Documents
          </h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Examine high-resolution PDF canvases alongside AI extracted fields, correct line-item values, and submit structured feedback.
          </p>
          <span className="text-xs font-semibold text-brand-400 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Proceed to queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-surface-card/80 border border-white/5 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white">Reviewer Guidelines</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                <span>Double-check invoice numbers, total amounts, and tax breakdowns against the original PDF.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                <span>Mark as <strong>Verified</strong> when all extracted data matches the PDF accurately.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                <span>Request corrections if document is unreadable or key line items are missing.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewerDashboard;
