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

  // Daily XP Pool logic resetting at 12:00 AM (handled in AppContext)
  const xpPool = state.user.xpPool;

  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setDate(now.getDate() + 1);
      nextMidnight.setHours(0, 0, 0, 0);
      
      const diff = nextMidnight.getTime() - now.getTime();
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
    if (!item) return;

    if (item.checked) return; // Prevent unchecking

    updateLoadout({
      items: items.map(item => item.id === id ? { ...item, checked: true } : item)
    });

    if (xpPool > 0) {
      const earned = Math.min(15, xpPool);
      addToast(`+${earned} XP for loadout prep!`, 'success');
      
      updateUser({ 
        xp: state.user.xp + earned,
        xpPool: xpPool - earned 
      });

      try {
        const settings = JSON.parse(localStorage.getItem('anchor_settings_v1') || '{}');
        if (settings.gamification?.habitCompletionHaptics && navigator.vibrate) {
          navigator.vibrate(50);
        }
      } catch (e) {}
    } else {
      addToast('Daily loadout XP pool exhausted.', 'info');
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
          <h1 className="text-[32px] font-bold text-text-primary tracking-tight leading-tight mb-2">Loadout</h1>
          <p className="text-[16px] text-text-muted font-medium">Checklists before you leave.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-none flex items-center justify-between gap-4 px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-[12px]">
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                 <Zap size={10} /> XP Pool
               </span>
               <span className="text-[13px] font-bold text-text-primary tabular-nums">
                 {xpPool} XP left
               </span>
             </div>
             <div className="w-px h-8 bg-primary/20 mx-1"></div>
             <div className="flex flex-col items-end">
               <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                 <Clock size={10} /> Resets in
               </span>
               <span className="text-[13px] font-bold text-text-muted tabular-nums">
                 {timeUntilReset}
               </span>
             </div>
          </div>
          <button 
            onClick={resetAll}
            className="h-[50px] md:h-[44px] px-4 bg-surface-2 hover:bg-surface-3 border border-border-base text-text-primary rounded-[12px] font-bold text-sm transition-colors flex items-center gap-2"
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
                ? 'bg-primary/10 text-primary border-primary'
                : 'bg-surface text-text-muted border-border-base hover:bg-surface-2'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-[24px] p-8 border border-border-base shadow-card">
        
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
             <span className="text-[13px] font-bold text-text-muted uppercase tracking-wide">Preparation limits</span>
             <span className="text-[14px] font-bold text-text-primary tabular-nums">{checkedCount} / {tabItems.length} Ready</span>
          </div>
          <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
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
                    ? 'bg-surface-2 border-border-base opacity-60' 
                    : 'bg-surface border-border-base hover:bg-surface-2'
                }`}
                onClick={() => toggleItem(item.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-[26px] h-[26px] rounded-[8px] border-[2px] flex items-center justify-center transition-colors ${
                    item.checked ? 'bg-[#6FF7A0] border-[#6FF7A0]' : 'border-border-strong group-hover:border-[#6FF7A0]'
                  }`}>
                    {item.checked && <Check size={16} className="text-[#0A0A0A]" strokeWidth={3} />}
                  </div>
                  <span className={`text-[16px] font-medium transition-all ${item.checked ? 'text-text-muted line-through decoration-text-muted' : 'text-text-primary'}`}>
                    {item.label}
                  </span>
                </div>
                
                <button
                  onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-text-muted hover:text-[#F76F6F] hover:bg-[#F76F6F]/10 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Item form inline */}
        <form onSubmit={handleAddItem} className="mt-4 flex items-center gap-3">
           <div className="h-[52px] flex-1 bg-surface-2 rounded-[16px] border border-border-base px-4 flex items-center focus-within:border-primary/40 transition-colors">
              <input 
                type="text"
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                placeholder="Add new item..."
                className="w-full h-full bg-transparent outline-none text-text-primary text-[16px] placeholder-text-muted"
              />
           </div>
           <button 
             type="submit"
             disabled={!newItem.trim()}
             className={`h-[52px] px-6 rounded-[16px] font-bold text-[15px] transition-all shadow-sm ${
               newItem.trim()
                 ? 'bg-[#6FF7A0] text-[#141414] hover:bg-[#5ae68a]'
                 : 'bg-primary text-white hover:bg-primary-hover disabled:opacity-50'
             }`}
           >
             Save
           </button>
        </form>

      </div>
    </div>
  );
}
