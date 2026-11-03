import React, { useState, useEffect } from 'react';
import { documentService } from '../../services/documentService';
import { useNotification } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel from '../../components/common/FilterPanel';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import PDFViewer from '../../components/documents/PDFViewer';
import ExtractedDataViewer from '../../components/documents/ExtractedDataViewer';
import {
  FileText,
  Eye,
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const DocumentTracking = () => {
  const { notifySuccess, notifyError, notifyWarning } = useNotification();

  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total_records: 0,
    total_pages: 1,
    has_next: false,
    has_previous: false,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    document_type: '',
    date_from: '',
    date_to: '',
  });

  // Tracking details modal
  const [trackingTarget, setTrackingTarget] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);

  // Correction resubmission state
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [resubmitComments, setResubmitComments] = useState('');
  const [correctedDataState, setCorrectedDataState] = useState(null);

  // PDF Preview modal
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchMyDocuments = async (page = 1) => {
    try {
      setLoading(true);
      const res = await documentService.getDocuments({
        page,
        per_page: pagination.per_page,
        search,
        ...filters,
      });

      setDocuments(res.documents || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      notifyError(err.response?.data?.message || 'Failed to fetch submitted documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDocuments(1);
  }, [search, filters]);

  const handleOpenTracking = async (doc) => {
    setTrackingTarget(doc);
    try {
      setLoadingTracking(true);
      const res = await documentService.trackDocument(doc.id);
      setTrackingData(res);
      setCorrectedDataState(
        res.reviewer_feedback?.corrected_data || res.document?.extracted_data || {}
      );
      setResubmitComments('');
    } catch (err) {
      notifyError(err.response?.data?.message || 'Failed to load tracking data.');
      setTrackingTarget(null);
    } finally {
      setLoadingTracking(false);
    }
  };

  const handleResubmitCorrections = async (e) => {
    e.preventDefault();
    if (!trackingTarget) return;

    if (!resubmitComments.trim()) {
      notifyWarning('Please provide an explanation of the corrections made.');
      return;
    }

    setIsResubmitting(true);
    try {
      await documentService.resubmitCorrections(trackingTarget.id, {
        corrected_data: correctedDataState || {},
        comments: resubmitComments.trim(),
      });

      notifySuccess('Corrections resubmitted successfully! Document sent for verification.');
      setTrackingTarget(null);
      fetchMyDocuments(pagination.page);
    } catch (err) {
      notifyError(err.response?.data?.message || 'Failed to resubmit corrections.');
    } finally {
      setIsResubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const columns = [
    {
      key: 'original_filename',
      title: 'Submitted File',
      render: (name, row) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span
              className="font-semibold text-white block hover:text-brand-400 transition-colors cursor-pointer"
              onClick={() => handleOpenTracking(row)}
            >
              {name}
            </span>
            <span className="text-[11px] text-slate-400">
              ID #{row.id} • {formatFileSize(row.file_size)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'document_type',
      title: 'Category',
      render: (type) => (
        <span className="capitalize text-xs font-medium text-slate-300">
          {type ? type.replace('_', ' ') : 'General Document'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Current Status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'created_at',
      title: 'Uploaded Date',
      render: (date) => (
        <span className="text-xs text-slate-400">
          {date ? new Date(date).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Tracking & Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenTracking(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-500/15 hover:bg-brand-500 text-brand-400 hover:text-white border border-brand-500/30 transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Track Progress</span>
          </button>

          <button
            onClick={() => setPreviewDoc(row)}
            title="Preview PDF"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => documentService.downloadDocument(row.id, row.original_filename)}
            title="Download PDF"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-surface-card border border-white/5 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Document Tracking & Correction Hub
          </h2>
          <p className="text-xs text-slate-400">
            Monitor verification steps, review employee correction requests, and submit revisions.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-300 bg-white/5 px-3.5 py-1.5 rounded-xl border border-white/10">
          My Documents: <span className="text-brand-400 font-bold">{pagination.total_records}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <SearchBar
          placeholder="Search by filename..."
          value={search}
          onChange={setSearch}
          className="w-full sm:w-96"
        />

        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onReset={() =>
            setFilters({
              status: '',
              document_type: '',
              date_from: '',
              date_to: '',
            })
          }
        />
      </div>

      {/* Documents Table */}
      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={documents}
          loading={loading}
          onRowClick={(row) => handleOpenTracking(row)}
          emptyTitle="No documents submitted yet"
          emptyDescription="Upload your first invoice or business document to begin extraction and tracking."
        />

        <Pagination
          page={pagination.page}
          totalPages={pagination.total_pages}
          totalRecords={pagination.total_records}
          perPage={pagination.per_page}
          hasNext={pagination.has_next}
          hasPrev={pagination.has_previous}
          onPageChange={(nextPage) => fetchMyDocuments(nextPage)}
        />
      </div>

      {/* Tracking Details & Correction Resubmission Modal */}
      <Modal
        isOpen={Boolean(trackingTarget)}
        onClose={() => setTrackingTarget(null)}
        title={`Status Tracking: ${trackingTarget?.original_filename}`}
        subtitle={`Document ID: #${trackingTarget?.id}`}
        maxWidth="max-w-4xl"
      >
        {loadingTracking ? (
          <div className="py-12">
            <LoadingSpinner text="Fetching document tracking history..." />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Progress Bar */}
            <div className="p-4 rounded-2xl bg-navy-950 border border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Current Lifecycle State:</span>
                <StatusBadge status={trackingData?.document?.status} />
              </div>

              <div className="text-xs text-slate-400 text-right">
                <span>Last Updated: </span>
                <span className="text-white font-medium">
                  {trackingData?.document?.updated_at
                    ? new Date(trackingData.document.updated_at).toLocaleString()
                    : 'Just now'}
                </span>
              </div>
            </div>

            {/* Reviewer Feedback Section */}
            {trackingData?.reviewer_feedback && (
              <div className="p-5 rounded-2xl bg-surface-card border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Reviewer Assessment
                  </span>
                  <StatusBadge status={trackingData.reviewer_feedback.decision} />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400">Reviewer Comments:</span>
                  <p className="p-3 rounded-xl bg-navy-950 border border-white/5 text-xs text-slate-200 italic">
                    "{trackingData.reviewer_feedback.comments || 'No remarks added.'}"
                  </p>
                </div>

                {trackingData.reviewer_feedback.findings &&
                  trackingData.reviewer_feedback.findings.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-400">Flagged Findings:</span>
                      <div className="space-y-1">
                        {trackingData.reviewer_feedback.findings.map((f, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-lg bg-navy-950 border border-white/5 text-xs text-slate-300 flex items-center gap-2"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                            <span>{typeof f === 'string' ? f : JSON.stringify(f)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Admin Decision Section */}
            {trackingData?.admin_decision && (
              <div className="p-5 rounded-2xl bg-surface-card border border-brand-500/20 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                    Administrative Decision
                  </span>
                  <StatusBadge status={trackingData.admin_decision.decision} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400">Admin Remarks:</span>
                  <p className="p-3 rounded-xl bg-navy-950 border border-white/5 text-xs text-slate-200">
                    "{trackingData.admin_decision.comments || 'Approved without comment.'}"
                  </p>
                </div>
              </div>
            )}

            {/* If Corrections Requested: Show Resubmission Form */}
            {trackingData?.document?.status === 'corrections_requested' && (
              <form
                onSubmit={handleResubmitCorrections}
                className="p-5 rounded-2xl bg-brand-500/10 border border-brand-500/30 space-y-4"
              >
                <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider">
                  <RotateCcw className="w-4 h-4" />
                  <span>Resubmit Document Corrections</span>
                </div>
                <p className="text-xs text-slate-300">
                  Update the extracted data fields below and provide comments on what changes were made.
                </p>

                {/* Editable Extracted Viewer */}
                <div className="max-h-96 overflow-y-auto">
                  <ExtractedDataViewer
                    extractionData={{ structured_data: correctedDataState }}
                    isEditable={true}
                    onChange={(updated) => setCorrectedDataState(updated)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Correction Explanation & Notes:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={resubmitComments}
                    onChange={(e) => setResubmitComments(e.target.value)}
                    placeholder="Describe how discrepancies were resolved (e.g. corrected invoice subtotal, updated missing PO number)..."
                    className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isResubmitting || !resubmitComments.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-md hover:shadow-glow-brand transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isResubmitting ? 'Submitting...' : 'Submit Corrections'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>

      {/* PDF Preview Modal */}
      <Modal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.original_filename || 'PDF Preview'}
        maxWidth="max-w-4xl"
      >
        {previewDoc && (
          <div className="h-[650px]">
            <PDFViewer documentId={previewDoc.id} filename={previewDoc.original_filename} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentTracking;
