import React, { useState, useEffect } from 'react';
import { auditService } from '../../services/auditService';
import { useNotification } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import {
  ShieldCheck,
  Filter,
  RotateCcw,
  Clock,
  User,
  Database,
  Globe,
  FileCode,
  Sparkles,
} from 'lucide-react';

export const AuditLogs = () => {
  const { notifyError } = useNotification();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total_records: 0,
    total_pages: 1,
    has_next: false,
    has_previous: false,
  });

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');

  // Selected Log Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchAuditLogs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await auditService.getAuditLogs({
        page,
        per_page: pagination.per_page,
        action: actionFilter,
        entity_type: entityFilter,
        user_id: userIdFilter,
      });

      setLogs(res.audit_logs || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      notifyError(err.response?.data?.message || 'Failed to fetch audit log trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs(1);
  }, [actionFilter, entityFilter, userIdFilter]);

  const handleResetFilters = () => {
    setActionFilter('');
    setEntityFilter('');
    setUserIdFilter('');
  };

  const formatActionBadge = (action) => {
    const actionColorMap = {
      DOCUMENT_UPLOADED: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
      REVIEWER_ASSIGNED: 'bg-purple-950/60 text-purple-300 border-purple-800/60',
      DOCUMENT_VERIFIED: 'bg-teal-950/60 text-teal-300 border-teal-800/60',
      CORRECTIONS_REQUESTED: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
      DOCUMENT_FLAGGED: 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-800/60',
      DOCUMENT_APPROVED: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
      DOCUMENT_REJECTED: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
      USER_CREATED: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60',
      USER_ACTIVATED: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
      USER_DEACTIVATED: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
      CORRECTIONS_RESUBMITTED: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60',
    };

    const style = actionColorMap[action] || 'bg-slate-800 text-slate-300 border-slate-700';

    return (
      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${style}`}>
        {action.replace(/_/g, ' ')}
      </span>
    );
  };

  const columns = [
    {
      key: 'action',
      title: 'Action Event',
      render: (action) => formatActionBadge(action || 'UNKNOWN'),
    },
    {
      key: 'user_id',
      title: 'User ID',
      render: (uid) => (
        <span className="text-xs font-semibold text-slate-300">
          {uid ? `User #${uid}` : 'System'}
        </span>
      ),
    },
    {
      key: 'entity_type',
      title: 'Target Entity',
      render: (type, row) => (
        <div className="text-xs">
          <span className="font-semibold text-white block">{type}</span>
          <span className="text-[11px] text-slate-400">ID #{row.entity_id || '-'}</span>
        </div>
      ),
    },
    {
      key: 'ip_address',
      title: 'IP Address',
      render: (ip) => <span className="text-xs font-mono text-slate-400">{ip || '127.0.0.1'}</span>,
    },
    {
      key: 'created_at',
      title: 'Timestamp (UTC)',
      render: (date) => (
        <span className="text-xs text-slate-400 font-mono">
          {date ? new Date(date).toLocaleString() : '-'}
        </span>
      ),
    },
    {
      key: 'details',
      title: 'Event Details',
      align: 'right',
      render: (details, row) => (
        <button
          onClick={() => setSelectedLog(row)}
          className="text-xs font-semibold text-brand-400 hover:text-brand-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
        >
          View Payload
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-surface-card border border-white/5 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold uppercase mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Immutable Compliance Audit</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Audit Trail & Security Logs</h2>
          <p className="text-xs text-slate-400">
            Chronological enterprise records of uploads, reviewer decisions, status mutations, and user events.
          </p>
        </div>

        <div className="text-xs text-slate-300 bg-white/5 px-3.5 py-1.5 rounded-xl border border-white/10">
          Total Logs: <span className="font-bold text-brand-400">{pagination.total_records}</span>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-surface-card/60 border border-white/5 backdrop-blur-sm text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold mr-1">
          <Filter className="w-3.5 h-3.5 text-brand-400" />
          <span>Filters:</span>
        </div>

        {/* Action Filter */}
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-navy-900 border border-white/10 text-slate-200 focus:outline-none focus:border-brand-500"
        >
          <option value="">All Actions</option>
          <option value="DOCUMENT_UPLOADED">Document Uploaded</option>
          <option value="REVIEWER_ASSIGNED">Reviewer Assigned</option>
          <option value="DOCUMENT_VERIFIED">Document Verified</option>
          <option value="CORRECTIONS_REQUESTED">Corrections Requested</option>
          <option value="DOCUMENT_FLAGGED">Document Flagged</option>
          <option value="DOCUMENT_APPROVED">Document Approved</option>
          <option value="DOCUMENT_REJECTED">Document Rejected</option>
          <option value="USER_CREATED">User Created</option>
          <option value="USER_ACTIVATED">User Activated</option>
          <option value="USER_DEACTIVATED">User Deactivated</option>
        </select>

        {/* Entity Type Filter */}
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-navy-900 border border-white/10 text-slate-200 focus:outline-none focus:border-brand-500"
        >
          <option value="">All Entities</option>
          <option value="Document">Document</option>
          <option value="User">User</option>
          <option value="Company">Company</option>
        </select>

        {/* User ID Filter */}
        <input
          type="number"
          placeholder="Filter by User ID"
          value={userIdFilter}
          onChange={(e) => setUserIdFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-navy-900 border border-white/10 text-slate-200 focus:outline-none focus:border-brand-500 w-36"
        />

        {(actionFilter || entityFilter || userIdFilter) && (
          <button
            onClick={handleResetFilters}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Logs Table */}
      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          emptyTitle="No audit logs found"
          emptyDescription="There are no audit logs matching the selected filters."
        />

        <Pagination
          page={pagination.page}
          totalPages={pagination.total_pages}
          totalRecords={pagination.total_records}
          perPage={pagination.per_page}
          hasNext={pagination.has_next}
          hasPrev={pagination.has_previous}
          onPageChange={(nextPage) => fetchAuditLogs(nextPage)}
        />
      </div>

      {/* Payload Inspection Modal */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title={`Audit Event #${selectedLog?.id}: ${selectedLog?.action}`}
        subtitle={`Recorded on ${new Date(selectedLog?.created_at || Date.now()).toLocaleString()}`}
        maxWidth="max-w-xl"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-navy-950 border border-white/5">
                <span className="text-slate-400 block mb-1">Actor User ID:</span>
                <span className="font-semibold text-white">#{selectedLog.user_id || 'System'}</span>
              </div>
              <div className="p-3 rounded-xl bg-navy-950 border border-white/5">
                <span className="text-slate-400 block mb-1">IP Address:</span>
                <span className="font-semibold text-white font-mono">{selectedLog.ip_address || 'Unknown'}</span>
              </div>
              <div className="p-3 rounded-xl bg-navy-950 border border-white/5">
                <span className="text-slate-400 block mb-1">Entity Type:</span>
                <span className="font-semibold text-white">{selectedLog.entity_type}</span>
              </div>
              <div className="p-3 rounded-xl bg-navy-950 border border-white/5">
                <span className="text-slate-400 block mb-1">Entity ID:</span>
                <span className="font-semibold text-white">#{selectedLog.entity_id || 'N/A'}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-1.5">
                Event Payload JSON:
              </span>
              <pre className="p-4 rounded-xl bg-navy-950 font-mono text-xs text-emerald-400 overflow-x-auto border border-white/5 max-h-60">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogs;
