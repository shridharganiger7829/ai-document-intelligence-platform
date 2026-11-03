import React from 'react';
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import Modal from './Modal';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger', 'warning', 'info'
  isLoading = false,
}) => {
  const config = {
    danger: {
      btn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/30',
      icon: AlertCircle,
      iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    warning: {
      btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/30',
      icon: AlertTriangle,
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    info: {
      btn: 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-900/30',
      icon: HelpCircle,
      iconColor: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    },
  }[type] || {
    btn: 'bg-brand-500 hover:bg-brand-600 text-white',
    icon: HelpCircle,
    iconColor: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
  };

  const IconComponent = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl border ${config.iconColor} flex-shrink-0 mt-0.5`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-50 ${config.btn}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
