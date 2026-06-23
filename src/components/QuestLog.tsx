import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, MoreHorizontal, Calendar, Zap, AlertTriangle, Edit2, Trash2, Flame, History } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import Modal from './ui/Modal';
import confetti from 'canvas-confetti';
import { fetchCalendarEvents, createCalendarEvent, getCalendarToken } from '../lib/googleCalendar';

export default function QuestLog() {
  const { state, setQuests, updateUser } = useApp();
  const { addToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [newQuest, setNewQuest] = useState({ title: '', description: '', due: getTodayStr(), difficulty: 1, importance: 1, category: 'School' });

  const [isCalculatingXp, setIsCalculatingXp] = useState(false);
  const [calculatedXp, setCalculatedXp] = useState(15);
  const [xpDots, setXpDots] = useState("");

  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editQuest, setEditQuest] = useState<{ id: number, title: string, description?: string, due: string, dueRaw?: string, xp: number, done: boolean, createdAt?: number } | null>(null);
  const [isEditingXpCalculating, setIsEditingXpCalculating] = useState(false);
  const [editingXpDots, setEditingXpDots] = useState("");
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  React.useEffect(() => {
    const loadEvents = async () => {
      const token = getCalendarToken();
      if (!token) return;
      const tMin = new Date();
      tMin.setDate(tMin.getDate() - 15);
      const tMax = new Date();
      tMax.setDate(tMax.getDate() + 15);
      const evts = await fetchCalendarEvents(tMin, tMax);
      setCalendarEvents(evts);
    };
    loadEvents();
  }, []);

  // Auto-detect due dates from title
  React.useEffect(() => {
    const t = newQuest.title.toLowerCase();
    const today = new Date();
    let daysToAdd = 0;

    if (t.includes('tomorrow')) {
      daysToAdd = 1;
    } else if (t.includes('next week')) {
      daysToAdd = 7;
    } else if (t.includes('today')) {
      daysToAdd = 0;
    }

    if (t.includes('tomorrow') || t.includes('next week') || t.includes('today')) {
      const d = new Date(today);
      d.setDate(today.getDate() + daysToAdd);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const newDue = `${yyyy}-${mm}-${dd}`;
      if (newQuest.due !== newDue) {
        setNewQuest(prev => ({ ...prev, due: newDue }));
      }
    }
  }, [newQuest.title]);

  // Dot animation for calculating
  React.useEffect(() => {
    let interval: any;
    if (isCalculatingXp) {
      let count = 0;
      interval = setInterval(() => {
        count = (count + 1) % 4;
        setXpDots(".".repeat(count));
      }, 400);
    } else {
      setXpDots("");
    }
    return () => clearInterval(interval);
  }, [isCalculatingXp]);

  // Dot animation for edit calculating
  React.useEffect(() => {
    let interval: any;
    if (isEditingXpCalculating) {
      let count = 0;
      interval = setInterval(() => {
        count = (count + 1) % 4;
        setEditingXpDots(".".repeat(count));
      }, 400);
    } else {
      setEditingXpDots("");
    }
    return () => clearInterval(interval);
  }, [isEditingXpCalculating]);

  // Debounce API call for XP
  React.useEffect(() => {
    const title = newQuest.title.trim();
    const description = newQuest.description?.trim() || "";
    if (!title) {
      setCalculatedXp(15);
      setIsCalculatingXp(false);
      return;
    }

    setIsCalculatingXp(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/xp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.xp !== undefined) {
            setCalculatedXp(data.xp);
          }
        }
      } catch (e) {
        console.error("XP calc failed", e);
      } finally {
        setIsCalculatingXp(false);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [newQuest.title, newQuest.description]);

  // Debounce API call for Edited XP
  React.useEffect(() => {
    if (!editQuest) return;
    const title = editQuest.title.trim();
    const description = editQuest.description?.trim() || "";
    if (!title) {
      return;
    }

    setIsEditingXpCalculating(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/xp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.xp !== undefined) {
            setEditQuest(prev => prev ? { ...prev, xp: data.xp } : null);
          }
        }
      } catch (e) {
        console.error("XP calc failed", e);
      } finally {
        setIsEditingXpCalculating(false);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [editQuest?.title, editQuest?.description]);

  const activeQuests = state.quests.filter(q => !q.done);
  const completedQuests = state.quests.filter(q => q.done);

  const completeQuest = (id: number, xpValue: number, createdAt?: number) => {
    // 2-hour anti-spam rule
    if (createdAt && (Date.now() - createdAt < 2 * 60 * 60 * 1000)) {
       const msLeft = (createdAt + 2 * 60 * 60 * 1000) - Date.now();
       const minsLeft = Math.ceil(msLeft / 60000);
       addToast(`Too soon! Wait ${minsLeft}m to prevent spam logging.`, 'error');
       return;
    }
    
    // Ensure XP is not negative (though our calculation prevents it)
    const finalXp = Math.max(0, xpValue);

    // Tactile haptic feedback pattern
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 30, 40]);
    }

    setQuests(state.quests.map(q => q.id === id ? { ...q, done: true, completedAtDate: new Date().toISOString().split('T')[0], streak: (q.streak || 0) + 1 } : q));
    updateUser({ xp: state.user.xp + finalXp });
    addToast(`Quest Completed! +${finalXp} XP`, 'success');

    // Confetti on final active task completion
    if (activeQuests.length === 1 && activeQuests[0].id === id) {
      const count = 200;
      const defaults = { origin: { y: 0.7 }, zIndex: 9999 };

      function fire(particleRatio: number, opts: any) {
        confetti(Object.assign({}, defaults, opts, {
          particleCount: Math.floor(count * particleRatio)
        }));
      }

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }
  };

  const handleDeleteQuest = (id: number) => {
    setQuests(state.quests.filter(q => q.id !== id));
    addToast('Quest deleted', 'success');
    setActiveDropdownId(null);
  };

  const handleOpenEdit = (quest: any) => {
    setEditQuest({
      id: quest.id,
      title: quest.title,
      due: quest.due,
      dueRaw: quest.dueRaw || getTodayStr(),
      xp: quest.xp,
      done: quest.done,
      createdAt: quest.createdAt
    });
    setIsEditModalOpen(true);
    setActiveDropdownId(null);
  };

  const handleSaveEdit = () => {
    if (!editQuest || !editQuest.title.trim()) return;

    let dueDateStr = "Today";
    const today = getTodayStr();
    const targetedDue = editQuest.dueRaw || getTodayStr();

    if (targetedDue === today) {
      dueDateStr = "Today";
    } else {
      const dateObj = new Date(targetedDue + 'T00:00:00');
      dueDateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    setQuests(state.quests.map(q => q.id === editQuest.id ? {
      ...q,
      title: editQuest.title.trim(),
      due: dueDateStr,
      dueRaw: targetedDue,
      xp: editQuest.xp
    } : q));

    addToast('Quest updated!', 'success');
    setIsEditModalOpen(false);
    setEditQuest(null);
  };

  const handleAdd = async () => {
    if (!newQuest.title.trim()) return;
    
    const xp = calculatedXp;
    
    // Parse due date for clean display
    let dueDateStr = "Today";
    const today = getTodayStr();
    let targetDateObj = new Date();
    if (newQuest.due === today) {
      dueDateStr = "Today";
    } else {
       targetDateObj = new Date(newQuest.due + 'T00:00:00'); 
       dueDateStr = targetDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    setQuests([...state.quests, { 
      id: Date.now(),
      title: newQuest.title.trim(),
      due: dueDateStr,
      dueRaw: newQuest.due,
      xp,
      category: 'General',
      done: false,
      createdAt: Date.now(), // Track creation time for anti-spam
      streak: 1
    }]);

    addToast(`Quest added! Worth ${xp} XP`, 'success');
    setIsModalOpen(false);
    setNewQuest({ title: '', due: getTodayStr(), difficulty: 1, importance: 1, category: 'General' });

    // Sync to Google Calendar if configured
    if (getCalendarToken()) {
      addToast('Syncing to Google Calendar...', 'info');
      const newEvt = await createCalendarEvent(newQuest.title.trim(), targetDateObj);
      if (newEvt && newEvt.id) {
        setCalendarEvents(prev => [...prev, newEvt]);
        addToast('Synced to Google Calendar ✓', 'success');
      }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-[#F0F0F0] tracking-tight leading-tight mb-2">Quest Log</h1>
          <p className="text-[16px] text-[#888888] font-medium">Turn tasks into XP.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-[44px] px-5 bg-[#6FBBF7] hover:bg-[#5aaae6] text-[#0A0A0A] rounded-[12px] font-bold text-sm transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add Quest
        </button>
      </header>

      {/* Active Quests */}
      <h3 className="text-[18px] font-bold mb-5 mt-8">Active Quests</h3>
      {activeQuests.length === 0 ? (
         <div className="bg-[#141414] rounded-[24px] p-8 border border-[rgba(255,255,255,0.06)] flex flex-col items-center justify-center min-h-[160px] border-dashed">
            <span className="text-[24px] mb-2">🎮</span>
            <p className="text-[#888888] font-medium">No quests? Add one!</p>
         </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {activeQuests.map((quest) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key={quest.id}
                className="bg-[#141414] hover:bg-[#1A1A1A] rounded-[20px] p-4 flex justify-between items-center border border-[rgba(255,255,255,0.06)] group transition-all duration-300 hover:scale-[1.01] hover:border-[rgba(124,111,247,0.3)] hover:shadow-[0_4px_24px_rgba(124,111,247,0.08)] backdrop-blur-md min-h-[64px] relative"
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => completeQuest(quest.id, quest.xp, quest.createdAt)}
                    className="w-[22px] h-[22px] rounded-[4px] border-2 border-[rgba(255,255,255,0.2)] hover:border-[#6FBBF7] flex items-center justify-center transition-colors shrink-0 bg-[#0A0A0A]"
                  >
                  </button>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="text-[16px] font-bold text-[#F0F0F0] leading-tight">{quest.title}</h4>
                      {quest.streak && quest.streak > 0 && (
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[rgba(247,160,111,0.1)] text-[#F7A06F] text-[11px] font-extrabold select-none">
                          <Flame size={12} className="text-[#F7A06F] animate-pulse" />
                          <span>{quest.streak}d streak</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[12px] font-medium text-[#888888]">{quest.due} • {quest.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 relative">
                  <span className="bg-[rgba(247,217,111,0.1)] text-[#F7D96F] text-[12px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                    +{Math.max(0, quest.xp)} XP
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdownId(activeDropdownId === quest.id ? null : quest.id);
                    }}
                    className="p-2 text-[#888888] hover:text-[#F0F0F0] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal size={18} />
                  </button>

                  <AnimatePresence>
                    {activeDropdownId === quest.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-40 bg-transparent" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(null);
                          }}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-11 bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.6)] rounded-[12px] p-1.5 z-50 min-w-[140px] flex flex-col gap-1"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(quest);
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 text-left text-[14px] text-[#F0F0F0] hover:bg-[rgba(255,255,255,0.05)] rounded-[8px] transition-colors"
                          >
                            <Edit2 size={14} className="text-[#888888]" />
                            Edit Quest
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuest(quest.id);
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 text-left text-[14px] text-[#F76F6F] hover:bg-[rgba(247,111,111,0.1)] rounded-[8px] transition-colors"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Completed Today */}
      {completedQuests.length > 0 && (
        <>
          <h3 className="text-[18px] font-bold mb-5 mt-10 text-[#888888]">Completed Today</h3>
          <div className="space-y-3 opacity-60">
            {completedQuests.map((quest) => (
              <div key={quest.id} className="bg-[#141414] rounded-[20px] p-4 flex justify-between items-center border border-[rgba(255,255,255,0.02)] min-h-[64px] relative group transition-all duration-300 hover:scale-[1.01] hover:border-[rgba(255,255,255,0.1)] hover:shadow-[0_4px_24px_rgba(255,255,255,0.02)] backdrop-blur-md">
                 <div className="flex items-center gap-4">
                    <div className="w-[22px] h-[22px] rounded-[4px] bg-[#6FBBF7] flex items-center justify-center shrink-0">
                      <Check size={14} color="#0A0A0A" strokeWidth={3} />
                    </div>
                    <div>
                      <h4 className="text-[16px] font-bold text-[#888888] line-through decoration-[#888888] leading-tight">{quest.title}</h4>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 relative">
                   <span className="bg-[rgba(247,217,111,0.05)] text-[#555555] text-[12px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                     +{Math.max(0, quest.xp)} XP
                   </span>
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       setActiveDropdownId(activeDropdownId === quest.id ? null : quest.id);
                     }}
                     className="p-2 text-[#888888] hover:text-[#F0F0F0] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                   >
                     <MoreHorizontal size={18} />
                   </button>

                   <AnimatePresence>
                     {activeDropdownId === quest.id && (
                       <>
                         <div 
                           className="fixed inset-0 z-40 bg-transparent" 
                           onClick={(e) => {
                             e.stopPropagation();
                             setActiveDropdownId(null);
                           }}
                         />
                         <motion.div
                           initial={{ opacity: 0, scale: 0.95, y: -10 }}
                           animate={{ opacity: 1, scale: 1, y: 0 }}
                           exit={{ opacity: 0, scale: 0.95, y: -10 }}
                           transition={{ duration: 0.15 }}
                           className="absolute right-0 top-11 bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.6)] rounded-[12px] p-1.5 z-50 min-w-[140px] flex flex-col gap-1"
                         >
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               handleDeleteQuest(quest.id);
                             }}
                             className="flex items-center gap-2.5 px-3 py-2 text-left text-[14px] text-[#F76F6F] hover:bg-[rgba(247,111,111,0.1)] rounded-[8px] transition-colors"
                           >
                             <Trash2 size={14} />
                             Delete
                           </button>
                         </motion.div>
                       </>
                     )}
                   </AnimatePresence>
                 </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Mini Calendar View */}
      <div className="mt-12 bg-[#141414] rounded-[24px] p-6 border border-[rgba(255,255,255,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-[18px] font-bold text-[#F0F0F0] flex items-center gap-2">
              <Calendar size={18} className="text-[#6FBBF7]" />
              Schedule & Calendar
            </h3>
            <p className="text-[13px] text-[#888888] mt-1">Syncs with Google Calendar. Quests appear here automatically.</p>
          </div>
          <button
            onClick={() => {
              setNewQuest({...newQuest, title: ''});
              setIsModalOpen(true);
            }}
            className="px-4 py-2 w-full sm:w-auto bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] rounded-[12px] text-sm font-bold text-[#F0F0F0] transition-colors border border-[rgba(255,255,255,0.04)]"
          >
            Add Event
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-2">{d}</div>
          ))}
          {Array.from({ length: 42 }).map((_, i) => {
            const currentMonth = new Date();
            const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
            const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
            const dateNum = (i - firstDay + 1) > 0 && (i - firstDay + 1) <= daysInMonth ? (i - firstDay + 1) : '';
            const todayDate = new Date().getDate();
            const isToday = dateNum === todayDate;
            
            let taskCount = 0;
            let fullDateObj = null;
            let dayName = "";
            let dayQuests: any[] = [];
            let dayEvents: any[] = [];

            if (dateNum !== '') {
               fullDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dateNum as number);
               const fullDateStr = fullDateObj.getFullYear() + '-' + String(fullDateObj.getMonth() + 1).padStart(2, '0') + '-' + String(fullDateObj.getDate()).padStart(2, '0');
               
               dayEvents = calendarEvents.filter(e => {
                 if (e.start && e.start.date) return e.start.date === fullDateStr;
                 if (e.start && e.start.dateTime) return (e.start.dateTime as string).startsWith(fullDateStr);
                 return false;
               });
               dayQuests = state.quests.filter(q => q.dueRaw === fullDateStr);
               taskCount = dayEvents.length + dayQuests.length;

               // Just to grab a title if there's exactly 1 event
               if (dayEvents.length > 0) dayName = dayEvents[0].summary || "Event";
               else if (dayQuests.length > 0) dayName = dayQuests[0].title;
            }

            if (!dateNum) {
              return <div key={i} className="aspect-[4/3] sm:aspect-square"></div>;
            }

            return (
              <div 
                key={i} 
                onClick={() => {
                   if (fullDateObj) {
                     setNewQuest({...newQuest, title: '', due: fullDateObj.getFullYear() + '-' + String(fullDateObj.getMonth() + 1).padStart(2, '0') + '-' + String(fullDateObj.getDate()).padStart(2, '0')});
                     setIsModalOpen(true);
                   }
                }}
                className={`aspect-[4/3] sm:aspect-square rounded-[8px] sm:rounded-[12px] border ${isToday ? 'border-[#6FBBF7] bg-[rgba(111,187,247,0.1)]' : 'border-[rgba(255,255,255,0.02)] bg-[rgba(255,255,255,0.01)]'} flex flex-col items-center justify-start p-1 sm:p-2 relative group hover:bg-[rgba(255,255,255,0.04)] hover:border-[#7C6FF7] transition-all cursor-pointer overflow-hidden`}
              >
                <span className={`text-[12px] sm:text-[14px] font-bold ${isToday ? 'text-[#6FBBF7]' : 'text-[#888888] group-hover:text-[#F0F0F0]'} mb-1`}>{dateNum}</span>
                {taskCount > 0 && (
                  <div className="w-full flex-1 flex flex-col gap-1 items-center overflow-y-auto no-scrollbar pb-1">
                    {dayQuests.map((q, qIndex) => (
                      <div 
                        key={'q'+qIndex}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditQuest(q as any);
                          setIsEditModalOpen(true);
                        }}
                        className="text-[9px] sm:text-[10px] w-full px-1 py-0.5 rounded bg-[rgba(111,187,247,0.15)] text-[#6FBBF7] font-medium truncate text-center leading-tight hover:bg-[#6FBBF7] hover:text-[#0A0A0A] transition-colors"
                      >
                        {q.title}
                      </div>
                    ))}
                    {dayEvents.map((evt, eIndex) => (
                      <div 
                        key={'e'+eIndex}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditQuest({
                            id: -1,
                            title: evt.summary || 'Calendar Event',
                            description: evt.description || '',
                            due: evt.start.date || (evt.start.dateTime ? evt.start.dateTime.split('T')[0] : getTodayStr()),
                            dueRaw: evt.start.date || (evt.start.dateTime ? evt.start.dateTime.split('T')[0] : getTodayStr()),
                            xp: 15,
                            done: false,
                          });
                          setIsEditModalOpen(true);
                        }}
                        className="text-[9px] sm:text-[10px] w-full px-1 py-0.5 rounded bg-[rgba(247,160,111,0.15)] text-[#F7A06F] font-medium truncate text-center leading-tight hover:bg-[#F7A06F] hover:text-[#0A0A0A] transition-colors"
                      >
                        {evt.summary || 'Event'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Quest Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Quest">
        <div className="flex flex-col gap-5">
           <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#888888] uppercase tracking-wide">Quest Name</label>
              <input 
                type="text" 
                autoFocus
                value={newQuest.title}
                onChange={e => setNewQuest({...newQuest, title: e.target.value})}
                placeholder="Finish math homework"
                className="h-[52px] w-full bg-[#1A1A1A] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 outline-none text-[#F0F0F0] focus:border-[#6FBBF7] text-[16px]"
              />
           </div>

           <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#888888] uppercase tracking-wide">Short Description (Optional)</label>
              <textarea 
                value={newQuest.description}
                onChange={e => setNewQuest({...newQuest, description: e.target.value})}
                placeholder="Add a short description..."
                className="h-[80px] w-full bg-[#1A1A1A] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 py-3 outline-none text-[#F0F0F0] focus:border-[#6FBBF7] text-[15px] resize-none"
              />
           </div>
           
           <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#888888] uppercase tracking-wide flex items-center gap-2"><Calendar size={14}/> Due Date</label>
              <input 
                type="date"
                value={newQuest.due}
                onChange={e => setNewQuest({...newQuest, due: e.target.value})}
                min={getTodayStr()}
                className="h-[52px] w-full bg-[#1A1A1A] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 outline-none text-[#F0F0F0] focus:border-[#6FBBF7] text-[16px] date-picker-custom"
                style={{ colorScheme: 'dark' }}
              />
           </div>

           <div className={`relative rounded-[12px] mt-2 overflow-hidden ${isCalculatingXp ? 'p-[1px]' : 'bg-[rgba(247,217,111,0.05)] border border-[rgba(247,217,111,0.15)]'}`}>
             {isCalculatingXp && (
               <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] z-0 pointer-events-none">
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                   className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0_280deg,#F7A06F_360deg)]"
                 />
               </div>
             )}
             <div className={`relative rounded-[11px] p-4 flex justify-between items-center z-10 w-full h-full ${isCalculatingXp ? 'bg-[#141414]' : 'bg-transparent'}`}>
               <span className="text-[14px] font-bold text-[#888888]">Estimated Value</span>
               {isCalculatingXp ? (
                 <span className="text-[16px] font-bold text-[#F7A06F] w-[120px] text-right inline-block italic">
                   Calculating<span className="inline-block text-left w-[16px]">{xpDots}</span>
                 </span>
               ) : (
                 <span className="text-[18px] font-bold text-[#F7D96F] px-1 transition-all">+{calculatedXp} XP</span>
               )}
             </div>
           </div>

           <button
             disabled={isCalculatingXp}
             onClick={handleAdd}
             className={`h-[52px] w-full rounded-[12px] font-bold text-[16px] transition-colors mt-2 ${isCalculatingXp ? 'bg-[#333] text-[#888888] cursor-not-allowed' : 'bg-[#6FBBF7] hover:bg-[#5aaae6] text-[#0A0A0A] shadow-[0_0_16px_rgba(111,187,247,0.2)]'}`}
           >
             Save Quest
           </button>
        </div>
      </Modal>

      {/* Edit Quest Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditQuest(null); }} title={editQuest?.id === -1 ? "Event Details" : "Edit Quest"}>
        {editQuest && (
          <div className="flex flex-col gap-5">
             <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-[#888888] uppercase tracking-wide">Quest Name</label>
                <input 
                  type="text" 
                  autoFocus
                  value={editQuest.title}
                  onChange={e => setEditQuest({...editQuest, title: e.target.value})}
                  placeholder="Finish math homework"
                  className="h-[52px] w-full bg-[#1A1A1A] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 outline-none text-[#F0F0F0] focus:border-[#6FBBF7] text-[16px]"
                  readOnly={editQuest.id === -1}
                />
             </div>

             <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-[#888888] uppercase tracking-wide">Short Description (Optional)</label>
                <textarea 
                  value={editQuest.description || ''}
                  onChange={e => setEditQuest({...editQuest, description: e.target.value})}
                  placeholder="Add a short description..."
                  className="h-[80px] w-full bg-[#1A1A1A] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 py-3 outline-none text-[#F0F0F0] focus:border-[#6FBBF7] text-[15px] resize-none"
                  readOnly={editQuest.id === -1}
                />
             </div>
             
             <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-[#888888] uppercase tracking-wide flex items-center gap-2"><Calendar size={14}/> Due Date</label>
                <input 
                  type="date"
                  value={editQuest.dueRaw || ""}
                  onChange={e => setEditQuest({...editQuest, dueRaw: e.target.value})}
                  min={getTodayStr()}
                  className="h-[52px] w-full bg-[#1A1A1A] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 outline-none text-[#F0F0F0] focus:border-[#6FBBF7] text-[16px] date-picker-custom"
                  style={{ colorScheme: 'dark' }}
                />
             </div>

             <div className={`relative rounded-[12px] mt-2 overflow-hidden ${isEditingXpCalculating ? 'p-[1px]' : 'bg-[rgba(247,217,111,0.05)] border border-[rgba(247,217,111,0.15)]'}`}>
               {isEditingXpCalculating && (
                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] z-0 pointer-events-none">
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                     className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0_280deg,#F7A06F_360deg)]"
                   />
                 </div>
               )}
               <div className={`relative rounded-[11px] p-4 flex justify-between items-center z-10 w-full h-full ${isEditingXpCalculating ? 'bg-[#141414]' : 'bg-transparent'}`}>
                 <span className="text-[14px] font-bold text-[#888888]">Estimated Value</span>
                 {isEditingXpCalculating ? (
                   <span className="text-[16px] font-bold text-[#F7A06F] w-[120px] text-right inline-block italic">
                     Calculating<span className="inline-block text-left w-[16px]">{editingXpDots}</span>
                   </span>
                 ) : (
                   <span className="text-[18px] font-bold text-[#F7D96F] px-1 transition-all">+{editQuest.xp} XP</span>
                 )}
               </div>
             </div>

             {editQuest.id !== -1 && (
               <button
                 disabled={isEditingXpCalculating}
                 onClick={handleSaveEdit}
                 className={`h-[52px] w-full rounded-[12px] font-bold text-[16px] transition-colors mt-2 ${isEditingXpCalculating ? 'bg-[#333] text-[#888888] cursor-not-allowed' : 'bg-[#6FBBF7] hover:bg-[#5aaae6] text-[#0A0A0A] shadow-[0_0_16px_rgba(111,187,247,0.2)]'}`}
               >
                 Save Changes
               </button>
             )}
          </div>
        )}
      </Modal>
    </div>
  );
}
