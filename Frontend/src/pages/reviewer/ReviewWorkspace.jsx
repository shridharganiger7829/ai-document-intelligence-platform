import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { useNotification } from '../../context/NotificationContext';
import PDFViewer from '../../components/documents/PDFViewer';
import ExtractedDataViewer from '../../components/documents/ExtractedDataViewer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import {
  CheckCircle2,
  AlertTriangle,
  Flag,
  ArrowLeft,
  MessageSquare,
  Plus,
  Trash2,
  Save,
  Sparkles,
} from 'lucide-react';

export const ReviewWorkspace = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { notifySuccess, notifyError, notifyWarning } = useNotification();

  const [documentMeta, setDocumentMeta] = useState(null);
  const [extraction, setExtraction] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editable review state
  const [correctedData, setCorrectedData] = useState(null);
  const [comments, setComments] = useState('');
  const [findings, setFindings] = useState([]);
  const [newFindingText, setNewFindingText] = useState('');

  // Submit confirmation
  const [decisionPending, setDecisionPending] = useState(null); // 'verified' | 'corrections_requested' | 'flagged_for_admin'
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadReviewPayload = async () => {
      try {
        setLoading(true);
        const res = await documentService.getDocumentForReview(documentId);
        setDocumentMeta(res.document);
        setExtraction(res.extraction);
        setCorrectedData(res.previous_review?.corrected_data || res.extraction?.structured_data);
        if (res.previous_review?.comments) {
          setComments(res.previous_review.comments);
        }
        if (res.previous_review?.findings) {
          setFindings(res.previous_review.findings);
        }
      } catch (err) {
        notifyError(err.response?.data?.message || 'Failed to open document for review.');
        navigate('/reviewer/documents');
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      loadReviewPayload();
    }
  }, [documentId, navigate]);

  const handleAddFinding = (e) => {
    e.preventDefault();
    if (!newFindingText.trim()) return;
    setFindings((prev) => [...prev, newFindingText.trim()]);
    setNewFindingText('');
  };

  const handleRemoveFinding = (index) => {
    setFindings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    if (!decisionPending) return;

    if (decisionPending === 'corrections_requested' && !comments.trim() && findings.length === 0) {
      notifyWarning('Please provide comments or findings detailing why corrections are needed.');
      return;
    }

    setIsSubmitting(true);
    try {
      await documentService.submitReview(documentId, {
        decision: decisionPending,
        comments: comments.trim(),
        findings: findings,
        corrected_data: correctedData,
      });

      notifySuccess(`Review submitted successfully as "${decisionPending.replace('_', ' ')}"!`);
      setDecisionPending(null);
      navigate('/reviewer/documents');
    } catch (err) {
      notifyError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Initializing split-screen verification workspace..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Workspace Header Bar */}
      <div className="p-5 rounded-3xl bg-surface-card border border-white/5 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/reviewer/documents')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {documentMeta?.filename || 'Document Review'}
              </h2>
              <StatusBadge status={documentMeta?.status} />
            </div>
            <p className="text-xs text-slate-400">
              Document ID: #{documentMeta?.id} • Type: <span className="capitalize">{documentMeta?.document_type}</span>
            </p>
          </div>
        </div>

        {/* Primary Review Decisions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDecisionPending('verified')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verify & Approve</span>
          </button>

          <button
            type="button"
            onClick={() => setDecisionPending('corrections_requested')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-md transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Request Changes</span>
          </button>

          <button
            type="button"
            onClick={() => setDecisionPending('flagged_for_admin')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-fuchsia-700 hover:bg-fuchsia-600 text-white shadow-md transition-all"
          >
            <Flag className="w-4 h-4" />
            <span>Escalate to Admin</span>
          </button>
        </div>
      </div>

      {/* Split-Screen Workspace */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* LEFT SIDE: HIGH RES PDF CANVAS */}
        <div className="lg:col-span-6 h-[780px]">
          <PDFViewer
            documentId={documentId}
            filename={documentMeta?.filename}
            className="h-full"
          />
        </div>

        {/* RIGHT SIDE: DATA EXTRACTION + EDITING + FINDINGS */}
        <div className="lg:col-span-6 space-y-6 h-[780px] overflow-y-auto pr-1">
          {/* Extracted Structured Data (Editable) */}
          <div className="min-h-[460px]">
            <ExtractedDataViewer
              extractionData={{
                structured_data: correctedData,
                ocr: extraction?.ocr,
              }}
              isEditable={true}
              onChange={(updated) => setCorrectedData(updated)}
            />
          </div>

          {/* Verification Findings Section */}
          <div className="p-5 rounded-3xl bg-surface-card border border-white/5 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Verification Findings & Discrepancies
              </h4>
              <span className="text-[11px] text-slate-400">{findings.length} findings logged</span>
            </div>

            <form onSubmit={handleAddFinding} className="flex items-center gap-2">
              <input
                type="text"
                value={newFindingText}
                onChange={(e) => setNewFindingText(e.target.value)}
                placeholder="Log a discrepancy, missing field, or audit note..."
                className="flex-1 px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                disabled={!newFindingText.trim()}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-brand-400 border border-white/10 transition-colors disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {findings.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {findings.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-navy-950 border border-white/5 text-xs text-slate-200"
                  >
                    <span className="truncate mr-2">• {item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFinding(idx)}
                      className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* General Review Comments */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
                Review Comments & Recommendations:
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Explain review decisions, summary of verified items, or corrections required..."
                className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(decisionPending)}
        onClose={() => setDecisionPending(null)}
        onConfirm={handleSubmitReview}
        isLoading={isSubmitting}
        type={decisionPending === 'verified' ? 'info' : decisionPending === 'flagged_for_admin' ? 'danger' : 'warning'}
        title={`Confirm Review Decision: ${decisionPending?.replace('_', ' ').toUpperCase()}`}
        message={`You are submitting this review with verdict "${decisionPending}". This will forward your verification findings to company administrators.`}
        confirmText="Confirm & Submit Review"
      />
    </div>
  );
};

export default ReviewWorkspace;
