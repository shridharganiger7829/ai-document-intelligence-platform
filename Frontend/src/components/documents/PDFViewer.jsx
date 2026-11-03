import React, { useState, useEffect } from 'react';
import { documentService } from '../../services/documentService';
import { Download, ZoomIn, ZoomOut, RotateCcw, AlertCircle, FileText, Loader2 } from 'lucide-react';

export const PDFViewer = ({ documentId, filename = 'document.pdf', className = '' }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    let active = true;
    let objectUrl = null;

    const loadPdf = async () => {
      if (!documentId) return;
      try {
        setLoading(true);
        setError(null);
        const blob = await documentService.getPreviewBlob(documentId);
        if (active) {
          objectUrl = window.URL.createObjectURL(blob);
          setPdfUrl(objectUrl);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load document PDF.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      active = false;
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }
    };
  }, [documentId]);

  const handleDownload = async () => {
    try {
      await documentService.downloadDocument(documentId, filename);
    } catch {
      alert('Unable to download document.');
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 20, 60));
  const handleZoomReset = () => setZoom(100);

  return (
    <div className={`flex flex-col h-full rounded-2xl bg-surface-card border border-white/10 overflow-hidden shadow-2xl ${className}`}>
      {/* Viewer Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-navy-900 border-b border-white/5 text-xs text-slate-300">
        <div className="flex items-center gap-2 truncate max-w-xs sm:max-w-md">
          <FileText className="w-4 h-4 text-brand-400 flex-shrink-0" />
          <span className="font-semibold text-white truncate">{filename}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-white/5 rounded-lg border border-white/10 px-1">
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              disabled={loading || !!error}
              className="p-1 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-400">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              disabled={loading || !!error}
              className="p-1 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomReset}
              title="Reset Zoom"
              disabled={loading || !!error}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 border-l border-white/5 ml-0.5"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={handleDownload}
            disabled={loading || !!error}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* PDF Viewport */}
      <div className="flex-1 relative overflow-auto bg-navy-950 flex items-center justify-center p-2 min-h-[420px]">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <p className="text-xs font-medium">Loading document preview...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-2 p-6 text-center max-w-sm">
            <AlertCircle className="w-8 h-8 text-rose-400" />
            <p className="text-sm font-semibold text-rose-300">Preview Unavailable</p>
            <p className="text-xs text-slate-400">{error}</p>
          </div>
        )}

        {!loading && !error && pdfUrl && (
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-200"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            <object
              data={`${pdfUrl}#toolbar=0&navpanes=0`}
              type="application/pdf"
              className="w-full h-full min-h-[550px] rounded-lg border border-white/5"
            >
              <iframe
                src={`${pdfUrl}#toolbar=0`}
                title={filename}
                className="w-full h-full min-h-[550px] rounded-lg"
              />
            </object>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
