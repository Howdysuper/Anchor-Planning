import React, { useState, useRef } from 'react';

interface SettingsSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
  disabled?: boolean;
}

export function SettingsSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue,
  disabled = false
}: SettingsSliderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const percent = ((value - min) / (max - min)) * 100;
  const sliderRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`relative flex items-center w-full lg:w-64 gap-3 ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
      {/* Slider Widget */}
      <div className="relative w-full py-2">
        {/* Track Track background */}
        <div className="absolute left-0 right-0 h-1 top-1/2 -translate-y-1/2 bg-[rgba(255,255,255,0.1)] rounded-full pointer-events-none" />
        
        {/* Dynamic primary colored fill */}
        <div 
          className="absolute left-0 h-1 top-1/2 -translate-y-1/2 bg-[var(--primary,#7C6FF7)] rounded-full pointer-events-none"
          style={{ width: `${percent}%` }}
        />

        {/* Dynamic Tooltip */}
        {isHovered && !disabled && (
          <div 
            className="absolute bottom-full mb-2 bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] px-2 py-1 rounded-[6px] text-[11px] font-bold text-[#F0F0F0] pointer-events-none shadow-xl transform -translate-x-1/2 whitespace-nowrap transition-all duration-100"
            style={{ left: `${percent}%` }}
          >
            {formatValue ? formatValue(value) : value}
          </div>
        )}

        <input
          ref={sliderRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full relative h-4 bg-transparent cursor-pointer appearance-none outline-none z-10 focus:outline-none slider-thumb-custom"
          style={{
            WebkitAppearance: 'none',
          }}
        />
      </div>

      {/* Numerical display on the side */}
      <span className="text-xs font-bold text-[#F0F0F0] min-w-[40px] text-right tabular-nums">
        {formatValue ? formatValue(value) : value}
      </span>

      <style>{`
        .slider-thumb-custom::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #FFFFFF;
          cursor: pointer;
          border: 1px solid rgba(0,0,0,0.1);
          box-shadow: 0 0 8px var(--primary,#7C6FF7), 0 2px 4px rgba(0,0,0,0.3);
          transition: transform 150ms ease, box-shadow 150ms ease;
        }
        .slider-thumb-custom::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 0 12px var(--primary,#7C6FF7), 0 3px 6px rgba(0,0,0,0.4);
        }
        .slider-thumb-custom::-webkit-slider-thumb:active {
          transform: scale(1.1);
          box-shadow: 0 0 16px var(--primary,#7C6FF7), 0 1px 3px rgba(0,0,0,0.5);
        }
        .slider-thumb-custom::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #FFFFFF;
          cursor: pointer;
          border: 1px solid rgba(0,0,0,0.1);
          box-shadow: 0 0 8px var(--primary,#7C6FF7), 0 2px 4px rgba(0,0,0,0.3);
          transition: transform 150ms ease, box-shadow 150ms ease;
        }
      `}</style>
    </div>
  );
}
