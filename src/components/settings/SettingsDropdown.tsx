import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  label: string;
  value: string | number;
}

interface SettingsDropdownProps {
  options: DropdownOption[];
  value: string | number;
  onChange: (val: any) => void;
  disabled?: boolean;
}

export function SettingsDropdown({ options, value, onChange, disabled = false }: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: any) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full lg:w-56 shrink-0 text-left">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 px-3 bg-[#1E1E1E] hover:bg-[#252525] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-[14px] text-[#F0F0F0] font-semibold flex items-center justify-between gap-2 shadow-sm transition-all focus:outline-none ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'
        }`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : 'Select option'}</span>
        <ChevronDown size={16} className={`text-[#888888] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-full bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-[10px] shadow-[0_12px_36px_rgba(0,0,0,0.6)] z-50 overflow-hidden max-h-[240px] overflow-y-auto divide-y divide-[rgba(255,255,255,0.04)] scrollbar-thin">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full h-10 px-4 text-[13.5px] text-left font-semibold flex items-center justify-between transition-colors ${
                  isSelected 
                    ? 'bg-[rgba(124,111,247,0.1)] text-[#7C6FF7]' 
                    : 'text-[#E0E0E0] hover:bg-[rgba(124,111,247,0.06)] hover:text-[#F0F0F0]'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check size={14} className="text-[#7C6FF7]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
