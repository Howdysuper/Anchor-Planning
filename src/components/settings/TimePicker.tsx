import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value: string; // e.g., "07:30" or "10:45 PM" or "22:00"
  onChange: (time: string) => void;
  format?: '12hr' | '24hr';
}

export function TimePicker({ value, onChange, format = '12hr' }: TimePickerProps) {
  // Parse initial values
  const [hour, setHour] = useState('07');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState('AM');

  useEffect(() => {
    if (!value) return;
    
    // Check if 12hr format with AM/PM (e.g. "07:30 AM" or "5:00 PM" )
    const match12 = value.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (match12) {
      let h = parseInt(match12[1], 10);
      const m = match12[2];
      const ap = match12[3].toUpperCase();
      
      setHour(h < 10 ? `0${h}` : `${h}`);
      setMinute(m);
      setAmpm(ap);
    } else {
      // 24hr format (e.g. "07:30" or "22:00")
      const parts = value.split(':');
      if (parts.length >= 2) {
        let h24 = parseInt(parts[0], 10);
        const m = parts[1].substring(0, 2);
        
        if (format === '12hr') {
          const ap = h24 >= 12 ? 'PM' : 'AM';
          let h12 = h24 % 12;
          if (h12 === 0) h12 = 12;
          setHour(h12 < 10 ? `0${h12}` : `${h12}`);
          setMinute(m);
          setAmpm(ap);
        } else {
          setHour(h24 < 10 ? `0${h24}` : `${h24}`);
          setMinute(m);
        }
      }
    }
  }, [value, format]);

  const handleTimeChange = (newH: string, newM: string, newAP: string) => {
    if (format === '12hr') {
      onChange(`${parseInt(newH, 10)}:${newM} ${newAP}`);
    } else {
      let hVal = parseInt(newH, 10);
      if (newAP === 'PM' && hVal < 12) hVal += 12;
      if (newAP === 'AM' && hVal === 12) hVal = 0;
      const formattedH = hVal < 10 ? `0${hVal}` : `${hVal}`;
      onChange(`${formattedH}:${newM}`);
    }
  };

  const hoursOptions = Array.from({ length: format === '12hr' ? 12 : 24 }, (_, i) => {
    const val = format === '12hr' ? i + 1 : i;
    return val < 10 ? `0${val}` : `${val}`;
  });

  const minutesOptions = Array.from({ length: 60 }, (_, i) => {
    return i < 10 ? `0${i}` : `${i}`;
  });

  return (
    <div className="flex items-center gap-2 bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] p-1 px-2 rounded-[10px] shadow-inner shrink-0 leading-none">
      <Clock size={14} className="text-[#888888] mr-0.5" />
      
      {/* Hour Selector */}
      <select
        value={hour}
        onChange={(e) => {
          setHour(e.target.value);
          handleTimeChange(e.target.value, minute, ampm);
        }}
        className="bg-transparent text-[#F0F0F0] font-mono text-[14px] font-bold outline-none border-none cursor-pointer focus:ring-0 leading-none py-1"
      >
        {hoursOptions.map(h => <option key={h} value={h} className="bg-[#141414] text-[#F0F0F0]">{h}</option>)}
      </select>

      <span className="text-[#888888] font-mono font-bold leading-none">:</span>

      {/* Minute Selector */}
      <select
        value={minute}
        onChange={(e) => {
          setMinute(e.target.value);
          handleTimeChange(hour, e.target.value, ampm);
        }}
        className="bg-transparent text-[#F0F0F0] font-mono text-[14px] font-bold outline-none border-none cursor-pointer focus:ring-0 leading-none py-1"
      >
        {minutesOptions.map(m => <option key={m} value={m} className="bg-[#141414] text-[#F0F0F0]">{m}</option>)}
      </select>

      {format === '12hr' && (
        <>
          <div className="w-px h-3.5 bg-[rgba(255,255,255,0.1)] mx-1" />
          {/* AM / PM Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextAP = ampm === 'AM' ? 'PM' : 'AM';
              setAmpm(nextAP);
              handleTimeChange(hour, minute, nextAP);
            }}
            className="text-[11px] font-bold text-[#F7A06F] hover:text-[#7C6FF7] select-none cursor-pointer px-1 py-0.5 rounded transition-all bg-[rgba(247,160,111,0.08)] hover:bg-[rgba(124,111,247,0.08)] leading-none"
          >
            {ampm}
          </button>
        </>
      )}
    </div>
  );
}
