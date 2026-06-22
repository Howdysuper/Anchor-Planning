import React from 'react';
import { motion } from 'motion/react';

interface SettingsToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function SettingsToggle({ checked, onChange, disabled = false }: SettingsToggleProps) {
  const toggleActiveColor = 'var(--primary)'; // dynamically maps to the active primary color

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`focus:outline-none relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 shrink-0 ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      }`}
      style={{
        backgroundColor: checked ? 'var(--primary, #7C6FF7)' : '#2A2A2A',
      }}
    >
      <motion.span
        layout
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30
        }}
        className="absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-md pointer-events-none"
        animate={{
          x: checked ? 20 : 0,
        }}
        style={{
          boxShadow: checked ? '0 0 8px rgba(255,255,255,0.8)' : 'none',
        }}
      />
    </button>
  );
}
