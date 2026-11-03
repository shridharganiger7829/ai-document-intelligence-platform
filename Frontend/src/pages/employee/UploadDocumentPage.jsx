import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FileUploader from '../../components/documents/FileUploader';
import { UploadCloud, Sparkles, ArrowRight } from 'lucide-react';

export const UploadDocumentPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const handleUploadComplete = () => {
    // Optionally stay or navigate
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="p-6 rounded-3xl bg-surface-card border border-white/5 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Document Ingestion</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Upload Business Documents
          </h2>
          <p className="text-xs text-slate-400">
            Drag-and-drop single or bulk PDF files for automated PyMuPDF OCR and Groq AI structured extraction.
          </p>
        </div>

        <button
          onClick={() => navigate(role === 'admin' ? '/admin/documents' : '/employee/tracking')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
        >
          <span>View Submitted Documents</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <FileUploader onUploadComplete={handleUploadComplete} />
    </div>
  );
};

export default UploadDocumentPage;
