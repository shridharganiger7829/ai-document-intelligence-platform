import React, { useState, useEffect } from 'react';
import { documentService } from '../../services/documentService';
import { processingService } from '../../services/processingService';
import { userService } from '../../services/userService';
import { useNotification } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel from '../../components/common/FilterPanel';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import PDFViewer from '../../components/documents/PDFViewer';
import {
  FileText,
  Sparkles,
  Download,
  Eye,
  UserCheck,
  Calendar,
  Layers,
  Loader2,
  FolderOpen,
} from 'lucide-react';

export const DocumentRepository = () => {
  const { notifySuccess, notifyError, notifyInfo } = useNotification();

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

  // Action modals
  const [previewDoc, setPreviewDoc] = useState(null);
  const [assignTargetDoc, setAssignTargetDoc] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchDocuments = async (page = 1) => {
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
      notifyError(err.response?.data?.message || 'Failed to fetch documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(1);
  }, [search, filters]);

  // Load active reviewers for assignment dropdown
  const loadReviewers = async () => {
    try {
      const res = await userService.getUsers();
      const activeReviewers = (res.users || []).filter(
        (u) => u.role === 'reviewer' && u.is_active
      );
      setReviewers(activeReviewers);
    } catch {
      // Non-fatal
    }
  };

  const handleOpenAssignModal = (doc) => {
    setAssignTargetDoc(doc);
    setSelectedReviewerId(doc.assigned_reviewer || '');
    loadReviewers();
  };

  const handleAssignReviewer = async (e) => {
    e.preventDefault();
    if (!assignTargetDoc || !selectedReviewerId) return;

    setIsAssigning(true);
    try {
      await documentService.assignReviewer(assignTargetDoc.id, selectedReviewerId);
      notifySuccess('Reviewer assigned successfully!');
      setAssignTargetDoc(null);
      fetchDocuments(pagination.page);
    } catch (err) {
      notifyError(err.response?.data?.message || 'Failed to assign reviewer.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleTriggerExtraction = async (docId) => {
    setProcessingId(docId);
    notifyInfo('Initiating OCR & Groq AI extraction...');
    try {
      const res = await processingService.extractDocument(docId);
      notifySuccess('AI extraction completed successfully!');
      fetchDocuments(pagination.page);
    } catch (err) {
      notifyError(err.response?.data?.message || 'AI extraction failed.');
    } finally {
      setProcessingId(null);
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
      title: 'Document Name',
      render: (name, row) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white block hover:text-brand-400 transition-colors cursor-pointer" onClick={() => setPreviewDoc(row)}>
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
      title: 'Type',
      render: (type) => (
        <span className="capitalize text-xs font-medium text-slate-300">
          {type ? type.replace('_', ' ') : 'General PDF'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'assigned_reviewer',
      title: 'Reviewer',
      render: (reviewerId) =>
        reviewerId ? (
          <span className="text-xs text-slate-300 font-medium">Reviewer #{reviewerId}</span>
        ) : (
          <span className="text-xs text-slate-500 italic">Unassigned</span>
        ),
    },
    {
      key: 'created_at',
      title: 'Uploaded At',
      render: (date) => (
        <span className="text-xs text-slate-400">
          {date ? new Date(date).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, row) => {
        const isCurrentlyProcessing = processingId === row.id;

        return (
          <div className="flex items-center justify-end gap-1.5">
            {/* Run Extraction */}
            {(row.status === 'uploaded' || row.status === 'extraction_failed') && (
              <button
                onClick={() => handleTriggerExtraction(row.id)}
                disabled={isCurrentlyProcessing}
                title="Run PyMuPDF OCR & Groq AI Extraction"
                className="p-1.5 rounded-lg bg-brand-500/15 hover:bg-brand-500 text-brand-400 hover:text-white transition-colors"
              >
                {isCurrentlyProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Assign Reviewer */}
            <button
              onClick={() => handleOpenAssignModal(row)}
              title="Assign Reviewer"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <UserCheck className="w-4 h-4" />
            </button>

            {/* Preview PDF */}
            <button
              onClick={() => setPreviewDoc(row)}
              title="Preview PDF"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Download PDF */}
            <button
              onClick={() => documentService.downloadDocument(row.id, row.original_filename)}
              title="Download Original PDF"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-surface-card border border-white/5 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Document Repository
          </h2>
          <p className="text-xs text-slate-400">
            Search, filter, preview, assign reviewers, and process company documents.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
          Total: <span className="text-brand-400">{pagination.total_records}</span> Documents
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
          emptyTitle="No documents found"
          emptyDescription="Upload your first invoice or business document to begin extraction."
        />

        <Pagination
          page={pagination.page}
          totalPages={pagination.total_pages}
          totalRecords={pagination.total_records}
          perPage={pagination.per_page}
          hasNext={pagination.has_next}
          hasPrev={pagination.has_previous}
          onPageChange={(nextPage) => fetchDocuments(nextPage)}
        />
      </div>

      {/* PDF Preview Modal */}
      <Modal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.original_filename || 'PDF Preview'}
        subtitle={`Status: ${previewDoc?.status} • Uploaded ${new Date(previewDoc?.created_at || Date.now()).toLocaleDateString()}`}
        maxWidth="max-w-4xl"
      >
        {previewDoc && (
          <div className="h-[650px]">
            <PDFViewer documentId={previewDoc.id} filename={previewDoc.original_filename} />
          </div>
        )}
      </Modal>

      {/* Assign Reviewer Modal */}
      <Modal
        isOpen={Boolean(assignTargetDoc)}
        onClose={() => setAssignTargetDoc(null)}
        title="Assign Reviewer"
        subtitle={`Document: ${assignTargetDoc?.original_filename}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAssignReviewer} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Select Company Reviewer
            </label>
            <select
              value={selectedReviewerId}
              onChange={(e) => setSelectedReviewerId(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">-- Choose Reviewer --</option>
              {reviewers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setAssignTargetDoc(null)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAssigning || !selectedReviewerId}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-md hover:shadow-glow-brand transition-all disabled:opacity-50"
            >
              {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DocumentRepository;
