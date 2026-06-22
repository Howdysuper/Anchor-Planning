import React, { useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: string;
}

export default function Modal({ isOpen, onClose, title, children, width = "max-w-[480px]" }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#000000] bg-opacity-60 backdrop-blur-sm z-[100]"
          />
          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 z-[101] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`bg-[#141414] w-full ${width} rounded-[24px] border border-[rgba(255,255,255,0.08)] shadow-[0_16px_64px_rgba(0,0,0,0.8)] pointer-events-auto flex flex-col overflow-hidden max-h-full`}
            >
              {title && (
                <div className="flex items-center justify-between px-6 p-5 border-b border-[rgba(255,255,255,0.06)] shrink-0">
                  <h3 className="text-[18px] font-bold text-[#F0F0F0]">{title}</h3>
                  <button 
                    onClick={onClose}
                    className="p-2 -mr-2 text-[#888888] hover:text-[#F0F0F0] hover:bg-[#1E1E1E] rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
              <div className="p-6 overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
