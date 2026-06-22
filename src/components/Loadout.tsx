import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, RotateCcw, Plus, Clock, Zap } from 'lucide-react';

export default function Loadout() {
  const { state, updateLoadout, updateUser } = useApp();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('School Day');
  const [newItem, setNewItem] = useState('');

  // Daily XP Pool logic resetting at 4 AM
  const getDayString = () => new Date(Date.now() - 4 * 3600 * 1000).toDateString();
  const [xpInfo, setXpInfo] = useState(() => {
    const maxXP = 50;
    try {
      const saved = localStorage.getItem('anchor_loadout_xp');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.day === getDayString()) {
          return { ...data, maxXP };
        }
      }
    } catch (e) {}
    return { dailyEarned: 0, day: getDayString(), maxXP: 50 };
  });

  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const next4AM = new Date(now);
      if (now.getHours() >= 4) {
        next4AM.setDate(now.getDate() + 1);
      }
      next4AM.setHours(4, 0, 0, 0);
      
      const diff = next4AM.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilReset(`${h}h ${m}m`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const items = state.loadout.items;
  // Fallback map for items without tab (legacy structure)
  const tabItems = items.filter(i => (i.tab || 'School Day') === activeTab);
  
  const checkedCount = tabItems.filter(i => i.checked).length;
  const progress = tabItems.length === 0 ? 0 : (checkedCount / tabItems.length) * 100;

  const toggleItem = (id: number) => {
    const item = items.find(i => i.id === id);
    const isChecked = item?.checked;

    updateLoadout({
      items: items.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    });

    if (!isChecked) {
      // Check if we have XP pool left for today
      // Re-evaluate day locally just in case they left app open
      const currentDayString = getDayString();
      let currentEarned = xpInfo.day === currentDayString ? xpInfo.dailyEarned : 0;
      
      if (currentEarned < xpInfo.maxXP) {
        const earned = Math.min(15, xpInfo.maxXP - currentEarned);
        addToast(`+${earned} XP for loadout prep!`, 'success');
        
        const newDaily = currentEarned + earned;
        const newXpInfo = { dailyEarned: newDaily, day: currentDayString, maxXP: xpInfo.maxXP };
        setXpInfo(newXpInfo);
        localStorage.setItem('anchor_loadout_xp', JSON.stringify(newXpInfo));
        
        updateUser({ xp: state.user.xp + earned });

        try {
          const settings = JSON.parse(localStorage.getItem('anchor_settings_v1') || '{}');
          if (settings.gamification?.habitCompletionHaptics && navigator.vibrate) {
            navigator.vibrate(50);
          }
        } catch (e) {}
      } else {
        addToast('Daily loadout XP pool exhausted.', 'info');
      }
    }
  };

  const deleteItem = (id: number) => {
    updateLoadout({ items: items.filter(i => i.id !== id) });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    updateLoadout({
      items: [...items, { id: Date.now(), label: newItem.trim(), checked: false, tab: activeTab }]
    });
    setNewItem('');
  };

  const resetAll = () => {
    updateLoadout({ 
      items: items.map(i => (i.tab || 'School Day') === activeTab ? { ...i, checked: false } : i) 
    });
    addToast(`${activeTab} reset`, 'info');
  };

  // Sort items: unchecked first
  const sortedItems = [...tabItems].sort((a, b) => {
    if (a.checked === b.checked) return 0;
    return a.checked ? 1 : -1;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 border-box">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-[32px] font-bold text-[#F0F0F0] tracking-tight leading-tight mb-2">Loadout</h1>
          <p className="text-[16px] text-[#888888] font-medium">Checklists before you leave.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-none flex items-center justify-between gap-4 px-4 py-2.5 bg-[rgba(124,111,247,0.1)] border border-[rgba(124,111,247,0.2)] rounded-[12px]">
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-[#7C6FF7] uppercase tracking-wider flex items-center gap-1">
                 <Zap size={10} /> XP Pool
               </span>
               <span className="text-[13px] font-bold text-[#F0F0F0] tabular-nums">
                 {xpInfo.maxXP - (xpInfo.day === getDayString() ? xpInfo.dailyEarned : 0)} XP left
               </span>
             </div>
             <div className="w-px h-8 bg-[rgba(124,111,247,0.2)] mx-1"></div>
             <div className="flex flex-col items-end">
               <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider flex items-center gap-1">
                 <Clock size={10} /> Resets in
               </span>
               <span className="text-[13px] font-bold text-[#888888] tabular-nums">
                 {timeUntilReset}
               </span>
             </div>
          </div>
          <button 
            onClick={resetAll}
            className="h-[50px] md:h-[44px] px-4 bg-[#1E1E1E] hover:bg-[#252525] border border-[rgba(255,255,255,0.06)] text-[#F0F0F0] rounded-[12px] font-bold text-sm transition-colors flex items-center gap-2"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Reset All</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar pb-2">
        {['School Day', 'Work Shift', 'Practice Night'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-full text-[14px] font-bold transition-all whitespace-nowrap border ${
              activeTab === tab
                ? 'bg-[rgba(124,111,247,0.1)] text-[#7C6FF7] border-[#7C6FF7]'
                : 'bg-[#141414] text-[#888888] border-[rgba(255,255,255,0.04)] hover:bg-[#1E1E1E]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-[#141414] rounded-[24px] p-8 border border-[rgba(255,255,255,0.06)] shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
        
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
             <span className="text-[13px] font-bold text-[#888888] uppercase tracking-wide">Preparation limits</span>
             <span className="text-[14px] font-bold text-[#F0F0F0] tabular-nums">{checkedCount} / {items.length} Ready</span>
          </div>
          <div className="h-2 w-full bg-[#1E1E1E] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-[#6FF7A0]"
            />
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {sortedItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={item.id}
                className={`group flex justify-between items-center p-4 rounded-[16px] border transition-all cursor-pointer ${
                  item.checked 
                    ? 'bg-[#1A1A1A] border-[rgba(255,255,255,0.02)] opacity-60' 
                    : 'bg-[#1E1E1E] border-[rgba(255,255,255,0.06)] hover:bg-[#252525]'
                }`}
                onClick={() => toggleItem(item.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-[26px] h-[26px] rounded-[8px] border-[2px] flex items-center justify-center transition-colors ${
                    item.checked ? 'bg-[#6FF7A0] border-[#6FF7A0]' : 'border-[rgba(255,255,255,0.2)] group-hover:border-[#6FF7A0]'
                  }`}>
                    {item.checked && <Check size={16} color="#0A0A0A" strokeWidth={3} />}
                  </div>
                  <span className={`text-[16px] font-medium transition-all ${item.checked ? 'text-[#888888] line-through decoration-[#888888]' : 'text-[#F0F0F0]'}`}>
                    {item.label}
                  </span>
                </div>
                
                <button
                  onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-[#888888] hover:text-[#F76F6F] hover:bg-[rgba(247,111,111,0.1)] rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Item form inline */}
        <form onSubmit={handleAddItem} className="mt-4 flex items-center gap-3">
           <div className="h-[52px] flex-1 bg-[#1A1A1A] rounded-[16px] border border-[rgba(255,255,255,0.04)] px-4 flex items-center focus-within:border-[rgba(255,255,255,0.15)] transition-colors">
              <Plus size={20} className="text-[#888888] mr-3" />
              <input 
                type="text"
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                placeholder="Add new item..."
                className="w-full h-full bg-transparent outline-none text-[#F0F0F0] text-[16px] placeholder-[#888888]"
              />
           </div>
           <button 
             type="submit"
             disabled={!newItem.trim()}
             className="h-[52px] px-6 bg-[#6FF7A0] text-[#0A0A0A] rounded-[16px] font-bold text-[15px] disabled:opacity-50 transition-opacity"
           >
             Save
           </button>
        </form>

      </div>
    </div>
  );
}
