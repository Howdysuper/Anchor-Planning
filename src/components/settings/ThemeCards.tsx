import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useSettings } from '../../contexts/SettingsContext';
import { switchThemeWithAnimation, getSystemTheme, watchSystemTheme } from './themeUtils';

export function ThemeCards() {
  const { settings, updateSetting } = useSettings();
  const activeColorMode = settings.appearance.colorMode;
  const [systemActiveTheme, setSystemActiveTheme] = useState<'dark' | 'light'>(getSystemTheme());

  useEffect(() => {
    setSystemActiveTheme(getSystemTheme());
    const cleanup = watchSystemTheme((nextTheme) => {
      setSystemActiveTheme(nextTheme);
    });
    return cleanup;
  }, []);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>, targetTheme: string) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.className = 'theme-ripple';
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      background: radial-gradient(circle, rgba(124,111,247,0.3) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: rippleExpand 500ms ease-out forwards;
      pointer-events: none;
      z-index: 10;
    `;
    card.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 500);
    
    switchThemeWithAnimation(targetTheme);
    updateSetting('appearance.colorMode', targetTheme);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* 1. DARK MODE CARD */}
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={(e) => handleCardClick(e, 'dark')}
        className={`relative flex flex-col justify-between min-h-[190px] rounded-[16px] overflow-hidden cursor-pointer transition-all duration-300 group select-none ${
          activeColorMode === 'dark'
            ? 'bg-[#1A1730] border-2 border-[#7C6FF7] shadow-[0_0_0_4px_rgba(124,111,247,0.12),0_8px_32px_rgba(124,111,247,0.15)]'
            : 'bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.18)] hover:bg-[#222222] hover:-translate-y-[2px]'
        }`}
      >
        {/* Top preview (110px) */}
        <div className="h-[110px] w-full bg-[#0A0A0A] p-3 flex gap-2 relative overflow-hidden select-none">
          {/* Mini sidebar (left, 28px wide) */}
          <div className="w-[28px] shrink-0 h-full bg-[#141414] rounded-[6px] p-1.5 flex flex-col gap-1">
            <div className="h-[5px] w-full bg-[#7C6FF7] rounded-[2px]" />
            <div className="h-[5px] w-[18px] bg-[rgba(255,255,255,0.15)] rounded-[2px]" />
            <div className="h-[5px] w-[18px] bg-[rgba(255,255,255,0.15)] rounded-[2px]" />
            <div className="h-[5px] w-[18px] bg-[rgba(255,255,255,0.15)] rounded-[2px]" />
            <div className="h-[5px] w-[18px] bg-[rgba(255,255,255,0.15)] rounded-[2px]" />
          </div>
          
          {/* Mini content area */}
          <div className="flex-1 flex flex-col gap-2 p-1">
            {/* Stat cards row */}
            <div className="grid grid-cols-3 gap-1.5 shrink-0">
              <div className="h-[18px] bg-[#1E1E1E] rounded-[4px] border border-[rgba(255,255,255,0.04)]" />
              <div className="h-[18px] bg-[#1E1E1E] rounded-[4px] border border-[rgba(255,255,255,0.04)]" />
              <div className="h-[18px] bg-[#1E1E1E] rounded-[4px] border border-[rgba(255,255,255,0.04)]" />
            </div>

            {/* Fake text block */}
            <div className="flex flex-col gap-1.5">
              <div className="h-[5px] w-[80%] bg-[#2A2A2A] rounded-[2px]" />
              <div className="h-[5px] w-[60%] bg-[#2A2A2A] rounded-[2px]" />
            </div>

            {/* Bottom visual block with colored accent bar */}
            <div className="h-[22px] bg-[#1E1E1E] rounded-[6px] relative overflow-hidden border border-[rgba(255,255,255,0.04)] mt-auto flex items-center pl-2">
              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#7C6FF7]" />
              <div className="h-[4px] w-[35px] bg-[#2A2A2A] rounded-[2px]" />
            </div>
          </div>
        </div>

        {/* Divider line */}
        <div className="h-px w-full bg-[rgba(255,255,255,0.06)]" />

        {/* Bottom Info Area */}
        <div className="p-4 flex items-center justify-between bg-transparent flex-1 text-left">
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-bold text-white tracking-tight">Dark Mode</span>
            <span className="text-[11px] text-[#888888] mt-0.5 font-medium">OLED Black (#0A0A0A)</span>
          </div>
          
          {/* Selection indicator */}
          <div className="shrink-0 relative">
            <div className={`w-[20px] h-[20px] rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
              activeColorMode === 'dark' 
                ? 'bg-[#7C6FF7] border-[#7C6FF7] shadow-[0_0_0_3px_rgba(124,111,247,0.25)] scale-110' 
                : 'border-[rgba(255,255,255,0.2)] bg-transparent'
            }`}>
              {activeColorMode === 'dark' && (
                <svg className="w-[10px] h-[10px] text-white animate-[scaleIn_200ms_cubic-bezier(0.34,1.56,0.64,1)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. LIGHT THEME CARD */}
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={(e) => handleCardClick(e, 'light')}
        className={`relative flex flex-col justify-between min-h-[190px] rounded-[16px] overflow-hidden cursor-pointer transition-all duration-300 group select-none ${
          activeColorMode === 'light'
            ? 'bg-white border-2 border-[#7C6FF7] shadow-[0_0_0_4px_rgba(124,111,247,0.12),0_8px_32px_rgba(124,111,247,0.15)]'
            : 'bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.18)] hover:bg-[#222222] hover:-translate-y-[2px]'
        }`}
      >
        {/* Top preview (110px) */}
        <div className="h-[110px] w-full bg-[#F5F5F7] p-3 flex gap-2 relative overflow-hidden select-none">
          {/* Mini sidebar (left, 28px wide) */}
          <div className="w-[28px] shrink-0 h-full bg-white rounded-[6px] p-1.5 flex flex-col gap-1 shadow-[1px_0_4px_rgba(0,0,0,0.06)] border border-[rgba(0,0,0,0.04)]">
            <div className="h-[5px] w-full bg-[#7C6FF7] rounded-[2px]" />
            <div className="h-[5px] w-[18px] bg-[rgba(0,0,0,0.12)] rounded-[2px]" />
            <div className="h-[5px] w-[18px] bg-[rgba(0,0,0,0.12)] rounded-[2px]" />
            <div className="h-[5px] w-[18px] bg-[rgba(0,0,0,0.12)] rounded-[2px]" />
            <div className="h-[5px] w-[18px] bg-[rgba(0,0,0,0.12)] rounded-[2px]" />
          </div>
          
          {/* Mini content area */}
          <div className="flex-1 flex flex-col gap-2 p-1">
            {/* Stat cards row */}
            <div className="grid grid-cols-3 gap-1.5 shrink-0">
              <div className="h-[18px] bg-white rounded-[4px] shadow-[0_1px_4px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.03)]" />
              <div className="h-[18px] bg-white rounded-[4px] shadow-[0_1px_4px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.03)]" />
              <div className="h-[18px] bg-white rounded-[4px] shadow-[0_1px_4px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.03)]" />
            </div>

            {/* Fake text block */}
            <div className="flex flex-col gap-1.5">
              <div className="h-[5px] w-[80%] bg-[#E0E0E0] rounded-[2px]" />
              <div className="h-[5px] w-[60%] bg-[#E0E0E0] rounded-[2px]" />
            </div>

            {/* Bottom visual block with colored accent bar */}
            <div className="h-[22px] bg-white rounded-[6px] relative overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.03)] mt-auto flex items-center pl-2">
              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#7C6FF7]" />
              <div className="h-[4px] w-[35px] bg-[#E0E0E0] rounded-[2px]" />
            </div>
          </div>
        </div>

        {/* Divider line */}
        <div className={`h-px w-full ${activeColorMode === 'light' ? 'bg-[rgba(0,0,0,0.08)]' : 'bg-[rgba(255,255,255,0.06)]'}`} />

        {/* Bottom Info Area */}
        <div className={`p-4 flex items-center justify-between flex-1 text-left transition-colors duration-300 ${
          activeColorMode === 'light' ? 'bg-[#FAFAFA]' : 'bg-transparent'
        }`}>
          <div className="flex flex-col min-w-0">
            <span className={`text-[14px] font-bold tracking-tight transition-colors duration-300 ${
              activeColorMode === 'light' ? 'text-[#1A1A1A]' : 'text-white'
            }`}>Light Theme</span>
            <span className={`text-[11px] mt-0.5 font-medium transition-colors duration-300 ${
              activeColorMode === 'light' ? 'text-[#666666]' : 'text-[#888888]'
            }`}>Snow paper mode</span>
          </div>
          
          {/* Selection indicator */}
          <div className="shrink-0 relative">
            <div className={`w-[20px] h-[20px] rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
              activeColorMode === 'light' 
                ? 'bg-[#7C6FF7] border-[#7C6FF7] shadow-[0_0_0_3px_rgba(124,111,247,0.25)] scale-110' 
                : 'border-[rgba(255,255,255,0.2)] bg-transparent'
            }`}>
              {activeColorMode === 'light' && (
                <svg className="w-[10px] h-[10px] text-white animate-[scaleIn_200ms_cubic-bezier(0.34,1.56,0.64,1)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. AUTO SYSTEM CARD */}
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={(e) => handleCardClick(e, 'auto')}
        className={`relative flex flex-col justify-between min-h-[190px] rounded-[16px] overflow-hidden cursor-pointer transition-all duration-300 group select-none ${
          activeColorMode === 'auto'
            ? 'bg-[#1A1730] border-2 border-[#7C6FF7] shadow-[0_0_0_4px_rgba(124,111,247,0.12),0_8px_32px_rgba(124,111,247,0.15)]'
            : 'bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.18)] hover:bg-[#222222] hover:-translate-y-[2px]'
        }`}
      >
        {/* Top preview (110px) - split diagonals */}
        <div className="h-[110px] w-full relative overflow-hidden select-none bg-[#FAFAFA]">
          {/* Left half (dark side layout) */}
          <div 
            className="absolute left-0 top-0 w-full h-[110px] bg-[#0A0A0A] p-2 flex gap-1 z-0"
            style={{ clipPath: 'polygon(0 0, 52% 0, 38% 100%, 0 100%)' }}
          >
            {/* Sidebar Dark strip */}
            <div className="w-[14px] shrink-0 h-full bg-[#141414] rounded-[3px] p-0.5 flex flex-col gap-1">
              <div className="h-[4px] w-full bg-[#7C6FF7] rounded-[1px]" />
              <div className="h-[4px] w-full bg-zinc-800 rounded-[1px]" />
            </div>
            
            {/* Content Dark block */}
            <div className="flex-1 flex flex-col gap-1.5 p-0.5">
              <div className="grid grid-cols-2 gap-1 shrink-0">
                <div className="h-[14px] bg-[#1E1E1E] rounded-[3px]" />
                <div className="h-[14px] bg-[#1E1E1E] rounded-[3px]" />
              </div>
              <div className="h-[4px] w-[35px] bg-[#2A2A2A] rounded-[1px]" />
            </div>
          </div>

          {/* Right half (light side layout) */}
          <div 
            className="absolute right-0 top-0 w-full h-[110px] bg-[#F5F5F7] p-2 flex justify-end gap-1 z-0"
            style={{ clipPath: 'polygon(52% 0, 100% 0, 100% 100%, 38% 100%)' }}
          >
            {/* Content Light block */}
            <div className="flex-1 flex flex-col gap-1.5 p-0.5 pl-10">
              <div className="grid grid-cols-2 gap-1 shrink-0">
                <div className="h-[14px] bg-white rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.06)]" />
                <div className="h-[14px] bg-white rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.06)]" />
              </div>
              <div className="h-[4px] w-[35px] bg-[#E0E0E0] rounded-[1px]" />
            </div>

            {/* Sidebar Light strip */}
            <div className="w-[14px] shrink-0 h-full bg-white rounded-[3px] p-0.5 flex flex-col gap-1 shadow-[1px_0_3px_rgba(0,0,0,0.04)]">
              <div className="h-[4px] w-full bg-[#7C6FF7] rounded-[1px]" />
              <div className="h-[4px] w-full bg-[rgba(0,0,0,0.1)] rounded-[1px]" />
            </div>
          </div>

          {/* Sun / Moon icons near the diagonal interface seam */}
          <div className="absolute top-2 left-[30%] text-[10px] z-[2] text-[#888888] font-semibold flex items-center gap-1 bg-[#0A0A0A]/40 px-1 py-0.5 rounded">
            <span>☽</span>
          </div>
          <div className="absolute bottom-2 right-[30%] text-[10px] z-[2] text-[#666666] font-semibold flex items-center gap-1 bg-[#ffffff]/40 px-1 py-0.5 rounded">
            <span>☀</span>
          </div>

          {/* Seam line gradient element */}
          <div 
            className="absolute top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-[#7C6FF7]/60 via-[#7C6FF7]/20 to-[#7C6FF7]/60 left-[52%] h-full origin-top rotate-[5.5deg] z-[1] shadow-[0_0_8px_rgba(124,111,247,0.4)]"
            style={{ transform: 'translateX(-50%)' }}
          />
        </div>

        {/* Divider line */}
        <div className="h-px w-full bg-[rgba(255,255,255,0.06)]" />

        {/* Bottom Info Area - split background color */}
        <div 
          className="relative p-4 flex items-center justify-between flex-1 text-left z-[1]"
          style={{ 
            background: activeColorMode === 'auto'
              ? 'linear-gradient(to right, #1A1730 45%, #FFFFFF 55%)'
              : 'linear-gradient(to right, #141414 45%, #FAFAFA 55%)'
          }}
        >
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-bold tracking-tight text-[#7C6FF7]">Auto System</span>
            <span className="text-[11px] text-[#888888] mt-0.5 font-medium">Match browser default</span>
            {/* Live system status indicator pill */}
            <div className="flex items-center gap-1.5 mt-1 animate-[fadeIn_400ms_ease]">
              <span className={`w-1.5 h-1.5 rounded-full inline-block animate-pulse shrink-0 ${
                systemActiveTheme === 'dark' ? 'bg-[#7C6FF7]' : 'bg-[#F7A06F]'
              }`} />
              <span className="text-[10px] text-[#888888] font-bold uppercase tracking-wider">
                Currently {systemActiveTheme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </div>
          </div>
          
          {/* Selection indicator */}
          <div className="shrink-0 relative z-[2]">
            <div className={`w-[20px] h-[20px] rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
              activeColorMode === 'auto' 
                ? 'bg-[#7C6FF7] border-[#7C6FF7] shadow-[0_0_0_3px_rgba(124,111,247,0.25)] scale-110' 
                : 'border-[rgba(0,0,0,0.25)] bg-transparent'
            }`}>
              {activeColorMode === 'auto' && (
                <svg className="w-[10px] h-[10px] text-white animate-[scaleIn_200ms_cubic-bezier(0.34,1.56,0.64,1)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ThemeCards;
