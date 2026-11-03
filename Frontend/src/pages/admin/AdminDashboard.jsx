import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { useNotification } from '../../context/NotificationContext';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  FileText,
  Users,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCw,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Upload,
  UserPlus,
  BarChart3,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notifyError } = useNotification();
  const navigate = useNavigate();

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getAdminDashboard();
      setData(res);
    } catch (err) {
      notifyError(err.response?.data?.message || 'Failed to fetch admin dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Aggregating enterprise statistics..." />;
  }

  const stats = data?.statistics || {};
  const workload = data?.reviewer_workload || [];

  // Chart data for status distribution
  const statusChartData = [
    { name: 'Approved', value: stats.approved_documents || 0, color: '#10b981' },
    { name: 'Pending Review', value: stats.pending_reviews || 0, color: '#3b82f6' },
    { name: 'Corrections', value: stats.corrections_requested || 0, color: '#f26a36' },
    { name: 'Rejected', value: stats.rejected_documents || 0, color: '#ef4444' },
    { name: 'Processing', value: stats.processing_documents || 0, color: '#f59e0b' },
  ].filter((item) => item.value > 0);

  // Bar chart data for review workload
  const workloadChartData = workload.map((w) => ({
    name: w.reviewer_name || `Reviewer #${w.reviewer_id}`,
    assigned: w.assigned_documents || 0,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-navy-900 via-surface-card to-navy-900 border border-white/5 shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold uppercase">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Company Overview</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Enterprise Command Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time document intelligence, workflow verification pipeline, and team workload.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/approvals')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
          >
            <span>Pending Approvals</span>
            <span className="px-1.5 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-bold">
              {stats.pending_reviews || 0}
            </span>
          </button>
          <button
            onClick={() => navigate('/admin/upload')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-md hover:shadow-glow-brand transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New</span>
          </button>
        </div>
      </div>

      {/* Primary Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Documents"
          value={stats.total_documents}
          subtitle="All-time processed"
          icon={FileText}
          colorScheme="brand"
          onClick={() => navigate('/admin/documents')}
        />
        <StatCard
          title="Uploaded Today"
          value={stats.uploaded_today}
          subtitle="Fresh uploads"
          icon={TrendingUp}
          colorScheme="teal"
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pending_reviews}
          subtitle="Waiting for reviewer"
          icon={Clock}
          colorScheme="sky"
          trend="Action Required"
          onClick={() => navigate('/admin/approvals')}
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
          subtitle="Revision in progress"
          icon={AlertTriangle}
          colorScheme="brand"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected_documents}
          subtitle="Non-compliant"
          icon={XCircle}
          colorScheme="rose"
        />
        <StatCard
          title="Active Users"
          value={stats.active_users}
          subtitle={`${stats.total_employees || 0} Emp, ${stats.total_reviewers || 0} Rev`}
          icon={Users}
          colorScheme="teal"
          onClick={() => navigate('/admin/users')}
        />
        <StatCard
          title="Failed / Issues"
          value={stats.failed_documents}
          subtitle="Extraction failures"
          icon={ShieldAlert}
          colorScheme={stats.failed_documents > 0 ? 'rose' : 'teal'}
        />
      </div>

      {/* Charts & Visual Analytics Section */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Status Distribution Donut Chart */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-surface-card/80 border border-white/5 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Document Lifecycle Breakdown
              </h3>
            </div>
            <span className="text-xs text-slate-400">{stats.total_documents || 0} Total</span>
          </div>

          {statusChartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.4)" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c1f24',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span className="text-xs text-slate-300 ml-1">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No documents to chart"
              description="Upload business documents to visualize statuses."
            />
          )}
        </div>

        {/* Reviewer Workload Bar Chart */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-surface-card/80 border border-white/5 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Reviewer Workload Distribution
              </h3>
            </div>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              <span>Manage Team</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {workloadChartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c1f24',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="assigned" name="Assigned Documents" fill="#f26a36" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No reviewers created"
              description="Create reviewers in User Management to delegate verification tasks."
              actionLabel="Create Reviewer"
              onAction={() => navigate('/admin/users')}
            />
          )}
        </div>
      </div>

      {/* Reviewer Workload Table Summary */}
      {workload.length > 0 && (
        <div className="p-6 rounded-3xl bg-surface-card/60 border border-white/5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Assigned Reviewer Capacity
            </h3>
            <span className="text-xs text-slate-400">{workload.length} Active Reviewers</span>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {workload.map((r) => (
              <div
                key={r.reviewer_id}
                className="p-3.5 rounded-2xl bg-navy-900 border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center font-bold text-teal-400 text-xs">
                    {r.reviewer_name?.slice(0, 2).toUpperCase() || 'R'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{r.reviewer_name}</p>
                    <p className="text-[10px] text-slate-400">Reviewer ID #{r.reviewer_id}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-brand-400 font-mono">
                    {r.assigned_documents}
                  </span>
                  <span className="text-[10px] text-slate-400 block">docs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
