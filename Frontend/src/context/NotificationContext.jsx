import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showNotification = useCallback((message, type = 'info', duration = 4500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    const newNotification = { id, message, type };

    setNotifications((prev) => [...prev, newNotification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    return id;
  }, [removeNotification]);

  const notifySuccess = useCallback((msg, duration) => showNotification(msg, 'success', duration), [showNotification]);
  const notifyError = useCallback((msg, duration) => showNotification(msg, 'error', duration), [showNotification]);
  const notifyWarning = useCallback((msg, duration) => showNotification(msg, 'warning', duration), [showNotification]);
  const notifyInfo = useCallback((msg, duration) => showNotification(msg, 'info', duration), [showNotification]);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        notifySuccess,
        notifyError,
        notifyWarning,
        notifyInfo,
        removeNotification,
      }}
    >
      {children}

      {/* Floating Toasts Stack */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {notifications.map((item) => {
          const typeStyles = {
            success: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-900/30',
            error: 'bg-rose-950/90 border-rose-500/40 text-rose-200 shadow-rose-900/30',
            warning: 'bg-amber-950/90 border-amber-500/40 text-amber-200 shadow-amber-900/30',
            info: 'bg-navy-900/90 border-brand-500/40 text-slate-200 shadow-brand-900/30',
          }[item.type];

          const IconComponent = {
            success: CheckCircle2,
            error: AlertCircle,
            warning: AlertTriangle,
            info: Info,
          }[item.type];

          const iconColors = {
            success: 'text-emerald-400',
            error: 'text-rose-400',
            warning: 'text-amber-400',
            info: 'text-brand-400',
          }[item.type];

          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${typeStyles}`}
            >
              <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors}`} />
              <div className="flex-1 text-sm font-medium leading-snug">
                {item.message}
              </div>
              <button
                onClick={() => removeNotification(item.id)}
                className="text-slate-400 hover:text-white transition-colors p-0.5 rounded-md hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
