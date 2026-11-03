import React, { useState, useRef } from 'react';
import { documentService } from '../../services/documentService';
import { useNotification } from '../../context/NotificationContext';
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';

const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16 MB backend limit
const MAX_BULK_FILES = 10; // 10 files backend limit

export const FileUploader = ({ onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [documentType, setDocumentType] = useState('invoice');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);

  const fileInputRef = useRef(null);
  const { notifySuccess, notifyError, notifyWarning } = useNotification();

  const handleFilesAdded = (filesList) => {
    const validPdfs = [];
    let rejectedCount = 0;

    Array.from(filesList).forEach((file) => {
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        notifyError(`"${file.name}" is not a PDF file.`);
        rejectedCount++;
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        notifyError(`"${file.name}" exceeds the 16 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
        rejectedCount++;
        return;
      }
      validPdfs.push(file);
    });

    if (selectedFiles.length + validPdfs.length > MAX_BULK_FILES) {
      notifyWarning(`Maximum ${MAX_BULK_FILES} files allowed per upload.`);
      const remainingSlots = MAX_BULK_FILES - selectedFiles.length;
      if (remainingSlots > 0) {
        setSelectedFiles((prev) => [...prev, ...validPdfs.slice(0, remainingSlots)]);
      }
    } else {
      setSelectedFiles((prev) => [...prev, ...validPdfs]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(e.target.files);
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      notifyWarning('Please select at least one PDF to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      let result;
      if (selectedFiles.length === 1) {
        // Single upload
        result = await documentService.uploadSingle(selectedFiles[0], documentType);
        setUploadProgress(100);
        notifySuccess('Document uploaded successfully!');
      } else {
        // Bulk upload
        result = await documentService.uploadBulk(selectedFiles, documentType);
        setUploadProgress(100);
        notifySuccess(`Bulk upload completed! ${result.uploaded_count} uploaded, ${result.failed_count || 0} failed.`);
      }

      setUploadResult(result);
      if (onUploadComplete) {
        onUploadComplete(result);
      }
      setSelectedFiles([]);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Upload failed.';
      notifyError(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Upload Settings Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface-card/60 border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-300">Document Type Preset:</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-xl bg-navy-900 border border-white/10 text-xs text-white font-medium focus:outline-none focus:border-brand-500/50"
          >
            <option value="invoice">Invoice</option>
            <option value="receipt">Receipt</option>
            <option value="purchase_order">Purchase Order</option>
            <option value="tax_form">Tax Form</option>
            <option value="bank_statement">Bank Statement</option>
            <option value="contract">Contract</option>
            <option value="other">Other Document</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Max <span className="text-white font-semibold">{MAX_BULK_FILES} files</span> per upload • Up to <span className="text-white font-semibold">16 MB</span> each
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
          isDragging
            ? 'border-brand-500 bg-brand-500/10 shadow-glow-brand scale-[1.01]'
            : 'border-white/10 hover:border-brand-500/40 bg-surface-card/40 hover:bg-surface-card/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-4 shadow-glow-brand">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white mb-1 text-center">
          Drag and drop PDF business documents here
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mb-4 text-center max-w-md">
          Supports invoices, receipts, POs, and financial forms for OCR and Groq AI structured extraction.
        </p>

        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors shadow-sm">
          <FileText className="w-3.5 h-3.5 text-brand-400" />
          Browse Files
        </span>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3 p-5 rounded-2xl bg-surface-card/70 border border-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Selected Files ({selectedFiles.length})
              </span>
              <span className="text-xs text-slate-400">
                Total size:{' '}
                {formatFileSize(selectedFiles.reduce((acc, curr) => acc + curr.size, 0))}
              </span>
            </div>

            <button
              onClick={handleClearAll}
              disabled={isUploading}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-navy-900/80 border border-white/5 text-xs text-slate-300"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-white/5 text-brand-400 flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-white truncate">{file.name}</p>
                    <p className="text-[11px] text-slate-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveFile(index)}
                  disabled={isUploading}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Action button */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/5">
            <button
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-md hover:shadow-glow-brand transition-all duration-200 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading Documents...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'Document' : 'Documents'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Upload Summary Result Banner */}
      {uploadResult && (
        <div className="p-5 rounded-2xl bg-surface-card border border-brand-500/30 backdrop-blur-md space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{uploadResult.message || 'Upload Complete'}</span>
            </div>
            <button
              onClick={() => setUploadResult(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>

          {uploadResult.documents && (
            <div className="space-y-1.5 text-xs text-slate-300">
              <span className="font-semibold text-white block">Uploaded Documents:</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {uploadResult.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2.5 rounded-xl bg-navy-900 border border-white/5 flex items-center justify-between"
                  >
                    <span className="truncate font-medium text-slate-200">{doc.original_filename}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-bold uppercase">
                      ID #{doc.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div className="space-y-1.5 text-xs text-rose-300">
              <span className="font-semibold block">Failed files:</span>
              {uploadResult.errors.map((err, i) => (
                <div key={i} className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/40">
                  <span className="font-semibold">{err.filename}:</span> {err.error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
