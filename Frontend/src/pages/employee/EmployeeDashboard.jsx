import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { useNotification } from '../../context/NotificationContext';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  FileText,
  UploadCloud,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCw,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const EmployeeDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notifyError } = useNotification();
  const navigate = useNavigate();

  const loadEmployeeStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getEmployeeDashboard();
      setData(res);
    } catch (err) {
      notifyError(err.response?.data?.message || 'Failed to fetch employee dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployeeStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Retrieving your document status..." />;
  }

  const stats = data?.statistics || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-surface-card to-navy-900 border border-white/5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Employee Workspace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Document Ingestion & Tracking
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
            Upload enterprise invoices, receipts, and forms. Track real-time AI extraction and reviewer sign-offs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/employee/upload')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-brand transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Uploaded"
          value={stats.total_uploaded}
          subtitle="Your submitted documents"
          icon={FileText}
          colorScheme="brand"
          onClick={() => navigate('/employee/tracking')}
        />
        <StatCard
          title="Uploaded Today"
          value={stats.uploaded_today}
          subtitle="Recent submissions"
          icon={TrendingUp}
          colorScheme="teal"
        />
        <StatCard
          title="Processing"
          value={stats.processing_documents}
          subtitle="AI extraction underway"
          icon={RotateCw}
          colorScheme="sky"
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pending_reviews}
          subtitle="Assigned to reviewer"
          icon={Clock}
          colorScheme="brand"
        />
        <StatCard
          title="Approved"
          value={stats.approved_documents}
          subtitle="Finalized sign-offs"
          icon={CheckCircle}
          colorScheme="emerald"
        />
        <StatCard
          title="Corrections Req."
          value={stats.corrections_requested}
          subtitle="Action required by you"
          icon={AlertTriangle}
          colorScheme="brand"
          trend={stats.corrections_requested > 0 ? 'Needs Fix' : null}
          onClick={() => navigate('/employee/tracking')}
        />
        <StatCard
          title="Rejected"
          value={stats.rejected_documents}
          subtitle="Declined by management"
          icon={XCircle}
          colorScheme="rose"
        />
      </div>

      {/* Quick Launch Tracking Card */}
      <div className="p-6 rounded-3xl bg-surface-card/80 border border-white/5 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Live Workflow Tracking</h3>
          <p className="text-xs text-slate-400 max-w-xl">
            View reviewer remarks, check AI-extracted totals, or resubmit corrections for flagged documents directly.
          </p>
        </div>

        <button
          onClick={() => navigate('/employee/tracking')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors whitespace-nowrap"
        >
          <span>Track My Submissions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
