import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'info' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }].slice(-3)); // Keep max 3

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  React.useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        addToast(`${customEvent.detail.title} • ${customEvent.detail.body}`, customEvent.detail.type || 'info');
      }
    };
    window.addEventListener('anchor-in-app-notification', handleNotification);
    return () => window.removeEventListener('anchor-in-app-notification', handleNotification);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-[9999] pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              layout
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto min-w-[280px]"
            >
              {toast.type === 'success' && <CheckCircle2 size={18} className="text-[#6FF7A0] shrink-0" />}
              {toast.type === 'info' && <Info size={18} className="text-[#7C6FF7] shrink-0" />}
              {toast.type === 'error' && <AlertCircle size={18} className="text-[#F76F6F] shrink-0" />}
              <span className="text-sm font-medium text-[#F0F0F0] leading-snug">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
