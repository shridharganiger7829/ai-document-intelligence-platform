import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { processingService } from '../../services/processingService';
import { useNotification } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel from '../../components/common/FilterPanel';
import Pagination from '../../components/common/Pagination';
import {
  FileText,
  CheckSquare,
  Sparkles,
  Download,
  Calendar,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export const AssignedDocuments = () => {
  const navigate = useNavigate();
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
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    document_type: '',
    date_from: '',
    date_to: '',
  });
  const [processingId, setProcessingId] = useState(null);

  const fetchAssignedDocs = async (page = 1) => {
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
      notifyError(err.response?.data?.message || 'Failed to fetch assigned documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedDocs(1);
  }, [search, filters]);

  const handleRunExtraction = async (e, docId) => {
    e.stopPropagation();
    setProcessingId(docId);
    notifyInfo('Extracting text and structured entities with Groq...');
    try {
      await processingService.extractDocument(docId);
      notifySuccess('Extraction completed! Ready for review.');
      fetchAssignedDocs(pagination.page);
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
      title: 'Assigned Document',
      render: (name, row) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white block hover:text-brand-400 transition-colors">
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
      title: 'Assigned Date',
      render: (date) => (
        <span className="text-xs text-slate-400">
          {date ? new Date(date).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Review Action',
      align: 'right',
      render: (_, row) => {
        const canReview = row.status === 'extracted' || row.status === 'review_submitted';
        const isProcessing = processingId === row.id;

        return (
          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            {/* If uploaded, offer one-click extraction */}
            {(row.status === 'uploaded' || row.status === 'extraction_failed') && (
              <button
                onClick={(e) => handleRunExtraction(e, row.id)}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-500/15 hover:bg-brand-500 text-brand-400 hover:text-white border border-brand-500/30 transition-all"
              >
                {isProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Run AI Extract</span>
              </button>
            )}

            {/* Main Review Button */}
            <button
              onClick={() => navigate(`/reviewer/review/${row.id}`)}
              disabled={!canReview && row.status !== 'uploaded'}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                canReview
                  ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-glow-brand'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{row.status === 'review_submitted' ? 'Re-inspect' : 'Verify Document'}</span>
              <ArrowRight className="w-3 h-3" />
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
            Assigned Document Queue
          </h2>
          <p className="text-xs text-slate-400">
            Select a document to launch the split-screen comparison and verification workspace.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-300 bg-white/5 px-3.5 py-1.5 rounded-xl border border-white/10">
          Assigned to You: <span className="text-brand-400 font-bold">{pagination.total_records}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <SearchBar
          placeholder="Search assigned documents..."
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
          onRowClick={(row) => {
            if (row.status === 'extracted' || row.status === 'review_submitted') {
              navigate(`/reviewer/review/${row.id}`);
            }
          }}
          emptyTitle="No documents assigned"
          emptyDescription="You have no documents currently awaiting verification in your queue."
        />

        <Pagination
          page={pagination.page}
          totalPages={pagination.total_pages}
          totalRecords={pagination.total_records}
          perPage={pagination.per_page}
          hasNext={pagination.has_next}
          hasPrev={pagination.has_previous}
          onPageChange={(nextPage) => fetchAssignedDocs(nextPage)}
        />
      </div>
    </div>
  );
};

export default AssignedDocuments;
