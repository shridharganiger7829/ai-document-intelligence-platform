import React, { useState, useEffect } from 'react';
import { documentService } from '../../services/documentService';
import { useNotification } from '../../context/NotificationContext';
import StatusBadge from '../../components/common/StatusBadge';
import PDFViewer from '../../components/documents/PDFViewer';
import ExtractedDataViewer from '../../components/documents/ExtractedDataViewer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  MessageSquare,
  FileText,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const PendingApprovals = () => {
  const { notifySuccess, notifyError, notifyWarning } = useNotification();

  const [pendingDocs, setPendingDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Decision inputs
  const [adminComments, setAdminComments] = useState('');
  const [confirmDecision, setConfirmDecision] = useState(null); // 'approved' | 'rejected' | 'corrections_requested'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const res = await documentService.getPendingReviews();
      const docs = res.documents || [];
      setPendingDocs(docs);
      if (docs.length > 0 && !selectedDoc) {
        setSelectedDoc(docs[0]);
      } else if (docs.length === 0) {
        setSelectedDoc(null);
      }
    } catch (err) {
      notifyError(err.response?.data?.message || 'Failed to fetch pending reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const handleDecisionSubmit = async () => {
    if (!selectedDoc || !confirmDecision) return;

    setIsSubmitting(true);
    try {
      await documentService.submitAdminDecision(selectedDoc.document_id, {
        decision: confirmDecision,
        comments: adminComments,
      });

      notifySuccess(`Document ${confirmDecision} successfully!`);
      setConfirmDecision(null);
      setAdminComments('');

      // Refresh list
      const res = await documentService.getPendingReviews();
      const updatedDocs = res.documents || [];
      setPendingDocs(updatedDocs);
      setSelectedDoc(updatedDocs[0] || null);
    } catch (err) {
      notifyError(err.response?.data?.message || 'Failed to record administrative decision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving reviewer submissions..." />;
  }

  if (pendingDocs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-3xl bg-surface-card border border-white/5 backdrop-blur-md shadow-xl">
          <h2 className="text-2xl font-bold text-white tracking-tight">Pending Administrative Approvals</h2>
          <p className="text-xs text-slate-400">Review documents verified by your reviewer team.</p>
        </div>
        <EmptyState
          icon={CheckCircle}
          title="All caught up!"
          description="There are currently no documents waiting for administrative sign-off."
        />
      </div>
    );
  }

  const reviewerResult = selectedDoc?.reviewer_result || {};
  const reviewerFindings = reviewerResult.findings || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-surface-card border border-white/5 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold uppercase mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Final Sign-off Pipeline</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Admin Approval Workspace</h2>
          <p className="text-xs text-slate-400">
            Inspect original document, reviewer findings, and finalize business approval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Pending:</span>
          <span className="px-3 py-1 rounded-full bg-brand-500 text-white font-bold text-xs shadow-glow-brand">
            {pendingDocs.length} {pendingDocs.length === 1 ? 'document' : 'documents'}
          </span>
        </div>
      </div>

      {/* Document Selector Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
        {pendingDocs.map((doc) => (
          <button
            key={doc.document_id}
            onClick={() => {
              setSelectedDoc(doc);
              setAdminComments('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              selectedDoc?.document_id === doc.document_id
                ? 'bg-brand-500 text-white border-brand-500 shadow-glow-brand'
                : 'bg-surface-card/80 text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{doc.filename}</span>
            <span className="text-[10px] opacity-75">#{doc.document_id}</span>
          </button>
        ))}
      </div>

      {/* Split Workspace */}
      {selectedDoc && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* LEFT: PDF PREVIEW */}
          <div className="lg:col-span-6 h-[720px]">
            <PDFViewer
              documentId={selectedDoc.document_id}
              filename={selectedDoc.filename}
              className="h-full"
            />
          </div>

          {/* RIGHT: REVIEWER FINDINGS & DECISION FORM */}
          <div className="lg:col-span-6 space-y-5 h-[720px] overflow-y-auto pr-1">
            {/* Reviewer Submission Card */}
            <div className="p-5 rounded-3xl bg-surface-card border border-white/5 backdrop-blur-md shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Reviewer: {selectedDoc.reviewer || 'Assigned Reviewer'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Uploaded by: {selectedDoc.uploaded_by || 'Employee'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 mr-2">Reviewer Verdict:</span>
                  <StatusBadge status={reviewerResult.decision || 'review_submitted'} />
                </div>
              </div>

              {/* Reviewer Comments */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
                  Reviewer Notes:
                </span>
                <p className="p-3 rounded-xl bg-navy-950 border border-white/5 text-xs text-slate-200 italic">
                  "{reviewerResult.comments || 'No specific reviewer remarks provided.'}"
                </p>
              </div>

              {/* Reviewer Findings List */}
              {reviewerFindings.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400 block">
                    Flagged Findings ({reviewerFindings.length}):
                  </span>
                  <div className="space-y-1">
                    {reviewerFindings.map((finding, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-slate-300 flex items-center gap-2"
                      >
                        <AlertTriangle className="w-3 h-3 text-brand-400 flex-shrink-0" />
                        <span>{typeof finding === 'string' ? finding : JSON.stringify(finding)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Extracted Data Component */}
            <div className="min-h-[380px]">
              <ExtractedDataViewer
                extractionData={reviewerResult.corrected_data || selectedDoc.extracted_data}
                isEditable={false}
              />
            </div>

            {/* Admin Decision Card */}
            <div className="p-5 rounded-3xl bg-surface-card border border-brand-500/20 backdrop-blur-md shadow-xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Final Administrative Action
              </h4>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Admin Sign-off Comments:
                </label>
                <textarea
                  rows={2}
                  value={adminComments}
                  onChange={(e) => setAdminComments(e.target.value)}
                  placeholder="Add approval justification, compliance notes, or correction instructions..."
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDecision('approved')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmDecision('corrections_requested')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-md transition-all"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Request Fix</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmDecision('rejected')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmDecision)}
        onClose={() => setConfirmDecision(null)}
        onConfirm={handleDecisionSubmit}
        isLoading={isSubmitting}
        type={confirmDecision === 'approved' ? 'info' : confirmDecision === 'rejected' ? 'danger' : 'warning'}
        title={`Confirm Decision: ${confirmDecision?.toUpperCase()}`}
        message={`Are you sure you want to mark document "${selectedDoc?.filename}" as ${confirmDecision}? This will update the company workflow and notify the user.`}
        confirmText={`Confirm ${confirmDecision}`}
      />
    </div>
  );
};

export default PendingApprovals;
