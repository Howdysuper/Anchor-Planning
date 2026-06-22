import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmWord: string; // "RESET", "DELETE", or email
  title: string;
  description: string;
  actionLabel: string;
  dangerBadgeText?: string;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  confirmWord,
  title,
  description,
  actionLabel,
  dangerBadgeText = "Destructive Action"
}: ConfirmationModalProps) {
  const [typedInput, setTypedInput] = useState('');

  // Clear typed text on modal open/close
  useEffect(() => {
    if (!isOpen) {
      setTypedInput('');
    }
  }, [isOpen]);

  const isValid = typedInput.trim() === confirmWord;

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onConfirm();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleConfirmSubmit} className="flex flex-col gap-5">
        <div className="flex gap-3 bg-[rgba(247,111,111,0.06)] border border-[rgba(247,111,111,0.2)] p-4 rounded-[16px]">
          <div className="shrink-0 text-[#F76F6F] mt-0.5">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#F76F6F] block">
              {dangerBadgeText}
            </span>
            <p className="text-[13.5px] text-[#E0E0E0] leading-relaxed mt-1">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-[#888888] uppercase tracking-wider">
            Verification Required
          </label>
          <p className="text-xs text-[#888888] mb-1 leading-relaxed">
            Please type <span className="font-mono font-bold text-[#F76F6F] bg-[rgba(247,111,111,0.1)] px-1.5 py-0.5 rounded text-[13px]">{confirmWord}</span> below to confirm this operation.
          </p>
          <div className="h-[48px] bg-[#1E1E1E] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 flex items-center focus-within:border-[rgba(247,111,111,0.4)]">
            <input
              type="text"
              autoFocus
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={`Type ${confirmWord}...`}
              className="w-full h-full bg-transparent outline-none text-[#F0F0F0] font-mono text-[14px] tracking-wide"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[48px] bg-[#1E1E1E] hover:bg-[#252525] border border-[rgba(255,255,255,0.08)] text-[#888888] hover:text-[#F0F0F0] rounded-[12px] font-bold text-[14px] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className={`flex-1 h-[48px] rounded-[12px] font-bold text-[14px] transition-all flex items-center justify-center gap-1.5 ${
              isValid
                ? "bg-[#F76F6F] hover:bg-[#e05e5e] text-[#0A0A0A] cursor-pointer shadow-[0_4px_16px_rgba(247,111,111,0.25)]"
                : "bg-[#252525] text-[#555555] border border-[rgba(255,255,255,0.02)] cursor-not-allowed"
            }`}
          >
            {actionLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
