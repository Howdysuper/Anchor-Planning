import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';

export function ThemeStatusPill() {
  const { settings } = useSettings();
  const rawMode = settings.appearance.colorMode;
  
  const displayLabel = 
    rawMode === 'dark' ? 'Dark' :
    rawMode === 'light' ? 'Light' : 'Auto';

  return (
    <span className="inline-flex items-center justify-center font-bold text-[12px] text-[#7C6FF7] bg-[rgba(124,111,247,0.15)] rounded-full px-3.5 py-1.5 shadow-[0_2px_8px_rgba(124,111,247,0.06)] border border-[rgba(124,111,247,0.1)] select-none">
      {displayLabel}
    </span>
  );
}
export default ThemeStatusPill;
