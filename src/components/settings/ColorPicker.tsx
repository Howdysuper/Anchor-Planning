import React, { useState } from 'react';
import { Palette, Check, Hash } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

const PRESET_COLORS = [
  { hex: '#7C6FF7', name: 'Purple' },
  { hex: '#6FBBF7', name: 'Blue' },
  { hex: '#6FF7A0', name: 'Green' },
  { hex: '#F7A06F', name: 'Orange' },
  { hex: '#F76FC8', name: 'Pink' },
  { hex: '#F76F6F', name: 'Red' },
  { hex: '#F7D96F', name: 'Gold' },
  { hex: '#E0E0E0', name: 'White' },
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [showCustom, setShowCustom] = useState(() => {
    // If current value is not in presets, keep custom editor open
    return !PRESET_COLORS.some(color => color.hex.toLowerCase() === value.toLowerCase());
  });
  const [customHex, setCustomHex] = useState(value);

  const handlePresetSelect = (hex: string) => {
    onChange(hex);
    setCustomHex(hex);
  };

  const handleCustomHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let text = e.target.value.trim();
    if (!text.startsWith('#')) {
      text = '#' + text;
    }
    setCustomHex(text);
    
    // Validate simple hex format e.g. #FFF or #FFFFFF
    if (/^#[0-9A-F]{6}$/i.test(text) || /^#[0-9A-F]{3}$/i.test(text)) {
      onChange(text);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-2 w-full">
      <div className="flex items-center gap-2.5 flex-wrap">
        {PRESET_COLORS.map((color) => {
          const isSelected = value.toLowerCase() === color.hex.toLowerCase();
          return (
            <button
              key={color.hex}
              type="button"
              onClick={() => handlePresetSelect(color.hex)}
              className="w-7 h-7 rounded-full cursor-pointer transition-all duration-200 relative group shrink-0 active:scale-90"
              style={{
                backgroundColor: color.hex,
                boxShadow: isSelected 
                  ? `0 0 0 2px #0A0A0A, 0 0 0 4px #FFFFFF, 0 0 12px ${color.hex}`
                  : 'none'
              }}
              title={color.name}
            >
              {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center text-[#0A0A0A]">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}

        {/* Custom trigger gradient circle */}
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className="w-7 h-7 rounded-full cursor-pointer relative shrink-0 transition-all active:scale-92 border border-[rgba(255,255,255,0.15)] overflow-hidden"
          style={{
            background: 'conic-gradient(from 180deg at 50% 50%, #F76F6F 0deg, #F7D96F 60deg, #6FF7A0 120deg, #6FBBF7 180deg, #7C6FF7 240deg, #F76FC8 300deg, #F76F6F 360deg)',
            boxShadow: showCustom ? '0 0 0 2px #0A0A0A, 0 0 0 4px [var(--primary,#7C6FF7)]' : 'none'
          }}
          title="Custom Accent Color"
        >
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center text-white">
            <Palette size={11} strokeWidth={2.5} />
          </div>
        </button>
      </div>

      {showCustom && (
        <div className="flex items-center gap-3 bg-[#1E1E1E]/60 border border-[rgba(255,255,255,0.06)] p-3 rounded-[12px] animate-in fade-in slide-in-from-top-1 duration-150 max-w-[280px]">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]">
              <Hash size={14} />
            </div>
            <input
              type="text"
              maxLength={7}
              placeholder="7C6FF7"
              value={customHex.replace('#', '')}
              onChange={handleCustomHexChange}
              className="w-full h-9 bg-[#1A1A1A] border border-[rgba(255,255,255,0.1)] focus:border-[#7C6FF7] rounded-[8px] pl-[26px] pr-3 text-xs text-[#F0F0F0] uppercase font-mono outline-none"
            />
          </div>
          {/* Live circular preview block */}
          <div 
            className="w-8 h-8 rounded-full border border-[rgba(255,255,255,0.2)] shadow-md shrink-0" 
            style={{ backgroundColor: customHex }}
          />
        </div>
      )}
    </div>
  );
}
