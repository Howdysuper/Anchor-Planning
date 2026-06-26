import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, MoreHorizontal, Calendar, Zap, AlertTriangle, Edit2, Trash2, Flame, History, Bot, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import RepeatModal from './RepeatModal';
import Modal from './ui/Modal';
import confetti from 'canvas-confetti';
import { fetchCalendarEvents, createCalendarEvent, getCalendarToken } from '../lib/googleCalendar';
import { formatDueDisplay } from '../lib/taskUtils';

export default function TaskLog() {
  const { state, setTasks, updateUser } = useApp();
  const { settings } = useSettings();
  const { addToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [newTask, setNewTask] = useState({ title: '', description: '', due: getTodayStr(), dueTime: '', difficulty: 1, importance: 1, repeat: [] as string[] });
  const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false);

  const [isCalculatingXp, setIsCalculatingXp] = useState(false);
  const [calculatedXp, setCalculatedXp] = useState(15);
  const [xpDots, setXpDots] = useState("");

  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<{ id: number, title: string, description?: string, due: string, dueRaw?: string, dueTime?: string, xp: number, done: boolean, createdAt?: number, repeat?: string[] } | null>(null);
  const [isEditingXpCalculating, setIsEditingXpCalculating] = useState(false);
  const [editingXpDots, setEditingXpDots] = useState("");
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  // AI Assistant State
  const [availableTime, setAvailableTime] = useState<number | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any[] | null>(null);
  const [aiSummary, setAiSummary] = useState<string>("");
  
  const [showCustomTimeInput, setShowCustomTimeInput] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState("");

  const handleCustomTimeSubmit = async () => {
    if (!customTimeInput.trim()) return;
    setAiLoading(true);
    setAvailableTime(null);
    setShowCustomTimeInput(false);
    
    try {
      const res = await fetch("/api/parse-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeString: customTimeInput })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.minutes > 0) {
           calculateAiSuggestions(data.minutes);
           return;
        }
      }
      addToast("Could not understand that time, please try again", "error");
      setAiLoading(false);
    } catch (e) {
      addToast("Failed to parse time", "error");
      setAiLoading(false);
    }
  };

  const calculateAiSuggestions = async (mins: number) => {
    setAvailableTime(mins);
    setAiLoading(true);
    setAiSuggestion(null);
    setAiSummary("");
    
    try {
      const today = new Date();
      const payload = {
        availableMinutes: mins,
        quests: state.quests.filter(q => !q.done),
        currentTime: {
          year: today.getFullYear(),
          month: today.getMonth() + 1,
          day: today.getDate(),
          weekday: today.toLocaleDateString('en-US', { weekday: 'long' }),
          time: today.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
        }
      };

      const res = await fetch("/api/ai-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setAiSuggestion(data.suggestions || []);
        setAiSummary(data.summary || "");
      } else {
        addToast("Failed to calculate suggestions with AI", "error");
      }
    } catch (e) {
      console.error("AI schedule fetch error", e);
      addToast("Failed to connect to AI schedule assistant", "error");
    } finally {
      setAiLoading(false);
    }
  };

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
    const t = newTask.title.toLowerCase();
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
      if (newTask.due !== newDue) {
        setNewTask(prev => ({ ...prev, due: newDue }));
      }
    }
  }, [newTask.title]);

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
    const title = newTask.title.trim();
    const description = newTask.description?.trim() || "";
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
          body: JSON.stringify({ 
            title, 
            description,
            due: newTask.due,
            dueTime: newTask.dueTime,
            currentDate: new Date().toISOString()
          }),
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
  }, [newTask.title, newTask.description, newTask.due, newTask.dueTime]);

  // Debounce API call for Edited XP
  React.useEffect(() => {
    if (!editTask) return;
    const title = editTask.title.trim();
    const description = editTask.description?.trim() || "";
    if (!title) {
      return;
    }

    setIsEditingXpCalculating(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/xp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            title, 
            description,
            due: editTask.dueRaw,
            dueTime: editTask.dueTime,
            currentDate: new Date().toISOString()
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.xp !== undefined) {
            setEditTask(prev => prev ? { ...prev, xp: data.xp } : null);
          }
        }
      } catch (e) {
        console.error("XP calc failed", e);
      } finally {
        setIsEditingXpCalculating(false);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [editTask?.title, editTask?.description, editTask?.dueRaw, editTask?.dueTime]);

  const activeTasks = state.tasks.filter(q => !q.done);
  const completedTasks = state.tasks.filter(q => q.done);

  const getNextRepeatDate = (currentDateStr: string, repeatDays: string[]) => {
    const daysMap: Record<string, number> = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
    let date = new Date(currentDateStr);
    if (isNaN(date.getTime())) date = new Date();
    
    // Check next 7 days
    for (let i = 1; i <= 7; i++) {
      date.setDate(date.getDate() + 1);
      const dayName = Object.keys(daysMap).find(key => daysMap[key] === date.getDay());
      if (dayName && repeatDays.includes(dayName)) {
        return date.toISOString().split('T')[0];
      }
    }
    return null;
  };

  const getQuestStatusInfo = (dueRaw?: string, dueTime?: string) => {
    if (!dueRaw) return null;
    const now = new Date();
    const dueDate = new Date(dueRaw);
    if (dueTime) {
      const [h, m] = dueTime.split(':').map(Number);
      dueDate.setHours(h, m, 0, 0);
    } else {
      dueDate.setHours(23, 59, 59, 999);
    }
    
    const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) {
      return { label: 'Passed Deadline', color: 'bg-[rgba(247,111,111,0.1)] text-[#F76F6F] border border-[rgba(247,111,111,0.2)]' };
    } else if (diffHours <= 16) {
      return { label: 'Due Soon', color: 'bg-[rgba(247,160,111,0.1)] text-[#F7A06F] border border-[rgba(247,160,111,0.2)]' };
    }
    return null;
  };

  const completeQuest = (id: number, xpValue: number, createdAt?: number) => {
    // 2-hour anti-spam rule
    if (!settings.devMode && createdAt && (Date.now() - createdAt < 2 * 60 * 60 * 1000)) {
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

    setTasks(prevTasks => {
      const currentQuest = prevQuests.find(q => q.id === id);
      const updatedQuests = prevQuests.map(q => q.id === id ? { ...q, done: true, completedAtDate: new Date().toISOString().split('T')[0], streak: (q.streak || 0) + 1 } : q);
      
      // Handle repeat
      if (currentQuest && currentQuest.repeat && currentQuest.repeat.length > 0) {
        const nextDateRaw = getNextRepeatDate(currentQuest.dueRaw || getTodayStr(), currentQuest.repeat);
        if (nextDateRaw) {
          const nextDateObj = new Date(nextDateRaw);
          const formattedNextDate = nextDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          
          updatedQuests.push({
            ...currentQuest,
            id: Date.now(),
            due: formattedNextDate,
            dueRaw: nextDateRaw,
            done: false,
            createdAt: Date.now(),
            streak: (currentQuest.streak || 0) + 1
          });
        }
      }
      return updatedQuests;
    });

    updateUser({ xp: state.user.xp + finalXp });
    const multiplier = 1.0 + (state.user.level - 1) * 0.05;
    const multipliedXp = Math.ceil(finalXp * multiplier);
    addToast(`Quest Completed! Got ${multipliedXp} XP (${multiplier.toFixed(2)}XP multiplier)`, 'success');

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
    setTasks(state.tasks.filter(q => q.id !== id));
    addToast('Quest deleted', 'success');
    setActiveDropdownId(null);
  };

  const handleOpenEdit = (quest: any) => {
    setEditQuest({
      id: quest.id,
      title: quest.title,
      description: quest.description || '',
      due: quest.due,
      dueRaw: quest.dueRaw || getTodayStr(),
      dueTime: quest.dueTime || '',
      xp: quest.xp,
      done: quest.done,
      createdAt: quest.createdAt,
      repeat: quest.repeat || []
    });
    setIsEditModalOpen(true);
    setActiveDropdownId(null);
  };

  const handleSaveEdit = () => {
    if (!editTask || !editTask.title.trim()) return;

    const targetedDue = editTask.dueRaw || getTodayStr();
    const dueDateStr = formatDueDisplay(targetedDue, editTask.dueTime);

    setTasks(state.tasks.map(q => q.id === editTask.id ? {
      ...q,
      title: editTask.title.trim(),
      description: editTask.description || '',
      due: dueDateStr,
      dueRaw: targetedDue,
      dueTime: editTask.dueTime || '',
      xp: editTask.xp,
      repeat: editTask.repeat
    } : q));

    addToast('Task updated!', 'success');
    setIsEditModalOpen(false);
    setEditTask(null);
  };

  const handleAdd = async () => {
    if (!newTask.title.trim()) return;
    
    const xp = calculatedXp;
    const targetedDue = newTask.due || getTodayStr();
    const dueDateStr = formatDueDisplay(targetedDue, newTask.dueTime);
    
    let targetDateObj = new Date(targetedDue + 'T00:00:00');

    setTasks([...state.tasks, { 
      id: Date.now(),
      title: newTask.title.trim(),
      description: newTask.description || '',
      due: dueDateStr,
      dueRaw: targetedDue,
      dueTime: newTask.dueTime || '',
      xp,
      category: 'General',
      done: false,
      createdAt: Date.now(), // Track creation time for anti-spam
      streak: 1,
      repeat: newTask.repeat
    }]);

    addToast(`Task added! Worth ${xp} XP`, 'success');
    setIsModalOpen(false);
    setNewTask({ title: '', description: '', due: getTodayStr(), dueTime: '', difficulty: 1, importance: 1, repeat: [] });

    // Sync to Google Calendar if configured
    if (getCalendarToken()) {
      addToast('Syncing to Google Calendar...', 'info');
      const newEvt = await createCalendarEvent(newTask.title.trim(), targetDateObj);
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
          <h1 className="text-[32px] font-bold text-[#F0F0F0] tracking-tight leading-tight mb-2">Tasks</h1>
          <p className="text-[16px] text-[#888888] font-medium">Capture ideas and manage your tasks.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-[44px] px-5 bg-[#6FBBF7] hover:bg-[#5aaae6] text-[#0A0A0A] rounded-[12px] font-bold text-sm transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add Task
        </button>
      </header>

      {/* Active Tasks */}
      <h3 className="text-[18px] font-bold mb-5 mt-8">Active Tasks</h3>
      {activeTasks.length === 0 ? (
         <div className="bg-[#141414] rounded-[24px] p-8 border border-[rgba(255,255,255,0.06)] flex flex-col items-center justify-center min-h-[160px] border-dashed">
            <span className="text-[24px] mb-2">🎮</span>
            <p className="text-[#888888] font-medium">No tasks? Add one!</p>
         </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {activeTasks.map((task) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key={task.id}
                className="bg-[#141414] hover:bg-[#1A1A1A] rounded-[20px] p-4 flex justify-between items-center border border-[rgba(255,255,255,0.06)] group transition-all duration-300 hover:scale-[1.01] hover:border-[rgba(124,111,247,0.3)] hover:shadow-[0_4px_24px_rgba(124,111,247,0.08)] backdrop-blur-md min-h-[64px] relative"
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => completeQuest(task.id, task.xp, task.createdAt)}
                    className="w-[22px] h-[22px] rounded-[4px] border-2 border-[rgba(255,255,255,0.2)] hover:border-[#6FBBF7] flex items-center justify-center transition-colors shrink-0 bg-[#0A0A0A]"
                  >
                  </button>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="text-[16px] font-bold text-[#F0F0F0] leading-tight">{task.title}</h4>
                      {(() => {
                        const status = getQuestStatusInfo(task.dueRaw, task.dueTime);
                        if (status) {
                          return (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                              {status.label}
                            </span>
                          );
                        }
                        return null;
                      })()}
                      {task.streak && task.streak > 1 && (
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[rgba(247,160,111,0.1)] text-[#F7A06F] text-[11px] font-extrabold select-none">
                          <Flame size={12} className="text-[#F7A06F] animate-pulse" />
                          <span>{task.streak}d streak</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[12px] font-medium text-[#888888]">{task.due}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 relative">
                  <span className="bg-[rgba(247,217,111,0.1)] text-[#F7D96F] text-[12px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                    +{Math.max(0, task.xp)} XP
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdownId(activeDropdownId === task.id ? null : task.id);
                    }}
                    className="p-2 text-[#888888] hover:text-[#F0F0F0] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal size={18} />
                  </button>

                  <AnimatePresence>
                    {activeDropdownId === task.id && (
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
                              handleOpenEdit(task);
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 text-left text-[14px] text-[#F0F0F0] hover:bg-[rgba(255,255,255,0.05)] rounded-[8px] transition-colors"
                          >
                            <Edit2 size={14} className="text-[#888888]" />
                            Edit Task
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuest(task.id);
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

      {/* AI Assistant View */}
      <div className="mt-12 bg-[#141414] rounded-[24px] p-6 border border-[rgba(255,255,255,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-[18px] font-bold text-[#F0F0F0] flex items-center gap-2">
              <Bot size={18} className="text-[#6FF7A0]" />
              AI Assistant
            </h3>
            <p className="text-[13px] text-[#888888] mt-1">
              {activeTasks.length > 0
                ? `How much time do you have to focus today to work on your ${activeTasks.length === 1 ? 'task' : 'tasks'}?`
                : "Looks like there are no tasks, add one to continue!"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { label: '30 min', val: 30 },
            { label: '1 hour', val: 60 },
            { label: '1.5 hours', val: 90 },
            { label: '2 hours', val: 120 },
            { label: '2.5 hours', val: 150 },
            { label: '3 hours', val: 180 },
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => { setShowCustomTimeInput(false); calculateAiSuggestions(opt.val); }}
              className={`px-4 py-2 rounded-full text-[13px] font-bold transition-all border ${
                availableTime === opt.val && !showCustomTimeInput
                  ? 'bg-[#6FF7A0] text-[#0A0A0A] border-[#6FF7A0]'
                  : 'bg-[rgba(255,255,255,0.02)] text-[#888888] border-[rgba(255,255,255,0.08)] hover:text-[#F0F0F0] hover:border-[rgba(255,255,255,0.2)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <button
            onClick={() => setShowCustomTimeInput(true)}
            className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all border ${
              showCustomTimeInput
                ? 'bg-[#6FF7A0] text-[#0A0A0A] border-[#6FF7A0]'
                : 'bg-[rgba(255,255,255,0.02)] text-[#888888] border-[rgba(255,255,255,0.08)] hover:text-[#F0F0F0] hover:border-[rgba(255,255,255,0.2)]'
            }`}
          >
            Custom time
          </button>
        </div>

        {showCustomTimeInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 flex items-center gap-3 bg-[rgba(255,255,255,0.02)] p-3 rounded-[16px] border border-[rgba(255,255,255,0.06)]"
          >
            <input
              type="text"
              autoFocus
              value={customTimeInput}
              onChange={e => setCustomTimeInput(e.target.value)}
              placeholder="e.g. 2 hours and 15 mins"
              onKeyDown={e => {
                if (e.key === 'Enter') handleCustomTimeSubmit();
              }}
              className="flex-1 bg-transparent border-none outline-none text-[#F0F0F0] text-[14px] placeholder-[#555555]"
            />
            <button
              onClick={handleCustomTimeSubmit}
              className="px-4 py-1.5 bg-[#6FF7A0] text-[#0A0A0A] font-bold text-[13px] rounded-full hover:bg-[#5EE690] transition-colors"
            >
              Apply
            </button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {aiLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-4 bg-[#1A1A1A] rounded-[16px] border border-[rgba(255,255,255,0.04)]"
            >
              <div className="w-5 h-5 rounded-full border-2 border-[#6FF7A0] border-t-transparent animate-spin"></div>
              <p className="text-[#888888] text-[14px] font-medium">Analyzing tasks and estimating times...</p>
            </motion.div>
          )}

          {!aiLoading && aiSuggestion && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[rgba(111,247,160,0.05)] border border-[rgba(111,247,160,0.15)] rounded-[16px] p-5"
            >
              <h4 className="text-[15px] font-bold text-[#6FF7A0] mb-1 flex items-center gap-2">
                <Check size={16} />
                Focus Plan for Today ({availableTime} minutes available)
              </h4>
              {aiSummary && (
                <p className="text-[13px] text-[#A0A0A0] mb-4 italic font-medium leading-relaxed">{aiSummary}</p>
              )}

              {aiSuggestion.length > 0 ? (
                <div className="space-y-3">
                  {aiSuggestion.map((task, i) => (
                    <div key={i} className="bg-[#1A1A1A] p-4 rounded-[12px] border border-[rgba(255,255,255,0.04)] hover:border-[rgba(111,247,160,0.15)] transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                        <p className="text-[14px] font-bold text-[#F0F0F0]">{task.title}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold bg-[rgba(111,247,160,0.12)] text-[#6FF7A0] px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <Clock size={10} />
                            {task.timeEstimate}m
                          </span>
                          <span className="text-[12px] font-bold text-[#F7D96F] flex items-center gap-1 bg-[rgba(247,217,111,0.05)] px-2.5 py-1 rounded-full border border-[rgba(247,217,111,0.1)]">
                            ✨ Total XP Gain: {aiSuggestion.reduce((acc, curr) => acc + (curr.xp || 15), 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#888888] text-[13px]">
                  You don't have any uncompleted tasks right now! Why not take a break or add something new?
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Completed Today */}
      {completedTasks.length > 0 && (
        <>
          <h3 className="text-[18px] font-bold mb-5 mt-10 text-[#888888]">Completed Today</h3>
          <div className="space-y-3 opacity-60">
            {completedTasks.map((task) => (
              <div key={task.id} className="bg-[#141414] rounded-[20px] p-4 flex justify-between items-center border border-[rgba(255,255,255,0.02)] min-h-[64px] relative group transition-all duration-300 hover:scale-[1.01] hover:border-[rgba(255,255,255,0.1)] hover:shadow-[0_4px_24px_rgba(255,255,255,0.02)] backdrop-blur-md">
                 <div className="flex items-center gap-4">
                    <div className="w-[22px] h-[22px] rounded-[4px] bg-[#6FBBF7] flex items-center justify-center shrink-0">
                      <Check size={14} color="#0A0A0A" strokeWidth={3} />
                    </div>
                    <div>
                      <h4 className="text-[16px] font-bold text-[#888888] line-through decoration-[#888888] leading-tight">{task.title}</h4>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 relative">
                   <span className="bg-[rgba(247,217,111,0.05)] text-[#555555] text-[12px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                     +{Math.max(0, task.xp)} XP
                   </span>
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       setActiveDropdownId(activeDropdownId === task.id ? null : task.id);
                     }}
                     className="p-2 text-[#888888] hover:text-[#F0F0F0] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                   >
                     <MoreHorizontal size={18} />
                   </button>

                   <AnimatePresence>
                     {activeDropdownId === task.id && (
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
                               handleDeleteQuest(task.id);
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



      {/* Add Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Task">
        <div className="flex flex-col gap-5">
           <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#888888] uppercase tracking-wide">Task Name</label>
              <input 
                type="text" 
                autoFocus
                value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
                placeholder="Finish math homework"
                className="h-[52px] w-full bg-[#1A1A1A] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 outline-none text-[#F0F0F0] focus:border-[#6FBBF7] text-[16px]"
              />
           </div>

           <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#888888] uppercase tracking-wide">Repeat</label>
              <button 
                onClick={() => setIsRepeatModalOpen(true)}
                className="h-[52px] w-full bg-[#1A1A1A] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 outline-none text-[#F0F0F0] text-[16px] text-left flex items-center justify-between"
              >
                <span>{newTask.repeat.length === 7 ? 'Everyday' : (newTask.repeat.length > 0 ? newTask.repeat.join(', ') : 'Never')}</span>
                <Calendar size={16} className="text-[#888888]" />
              </button>
           </div>
           
           <RepeatModal 
              isOpen={isRepeatModalOpen} 
              onClose={() => setIsRepeatModalOpen(false)} 
              selectedDays={newTask.repeat}
              onChange={(days) => setNewTask(prev => ({ ...prev, repeat: days }))}
           />

           <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#888888] uppercase tracking-wide">Details & Notes (Add context, sub-tasks, or links) (Optional)</label>
              <textarea 
                value={newTask.description}
                onChange={e => setNewTask({...newTask, description: e.target.value})}
                placeholder="Add details, links, or sub-tasks here..."
                className="h-[80px] w-full bg-[#1A1A1A] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 py-3 outline-none text-[#F0F0F0] focus:border-[#6FBBF7] text-[15px] resize-none"
              />
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-[#888888] uppercase tracking-wide flex items-center gap-2"><Calendar size={14}/> Due Date</label>
                <input 
                  type="date"
                  value={newTask.due}
                  onChange={e => setNewTask({...newTask, due: e.target.value})}
                  min={getTodayStr()}
                  className="h-[52px] w-full bg-[#1A1A1A] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 outline-none text-[#F0F0F0] focus:border-[#6FBBF7] text-[16px] date-picker-custom"
                  style={{ colorScheme: 'dark' }}
                />
             </div>
             <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-[#888888] uppercase tracking-wide flex items-center gap-2"><Clock size={14}/> Due Time (Optional)</label>
                <input 
                  type="time"
                  value={newTask.dueTime}
                  onChange={e => setNewTask({...newTask, dueTime: e.target.value})}
                  className="h-[52px] w-full bg-[#1A1A1A] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 outline-none text-[#F0F0F0] focus:border-[#6FBBF7] text-[16px] [color-scheme:dark]"
                  style={{ colorScheme: 'dark' }}
                />
             </div>
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
               <span className="text-[14px] font-bold text-[#888888] flex items-center gap-1.5">
                 ✨ Value Estimation
               </span>
               {isCalculatingXp ? (
                 <span className="text-[16px] font-bold text-[#F7A06F] w-[120px] text-right inline-block italic">
                   Estimating<span className="inline-block text-left w-[16px]">{xpDots}</span>
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
             Save Task
           </button>
        </div>
      </Modal>

      {/* Edit Quest Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditTask(null); }} title={editTask?.id === -1 ? "Event Details" : "Edit Task"}>
        {editTask && (
          <div className="flex flex-col gap-5">
             <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-[#888888] uppercase tracking-wide">Task Name</label>
                <input 
                  type="text" 
                  autoFocus
                  value={editTask.title}
                  onChange={e => setEditTask({...editTask, title: e.target.value})}
                  placeholder="Finish math homework"
                  className="h-[52px] w-full bg-[#1A1A1A] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 outline-none text-[#F0F0F0] focus:border-[#6FBBF7] text-[16px]"
                  readOnly={editTask.id === -1}
                />
             </div>

             <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-[#888888] uppercase tracking-wide">Details & Notes (Add context, sub-tasks, or links) (Optional)</label>
                <textarea 
                  value={editTask.description || ''}
                  onChange={e => setEditTask({...editTask, description: e.target.value})}
                  placeholder="Add details, links, or sub-tasks here..."
                  className="h-[80px] w-full bg-[#1A1A1A] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 py-3 outline-none text-[#F0F0F0] focus:border-[#6FBBF7] text-[15px] resize-none"
                  readOnly={editTask.id === -1}
                />
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-[#888888] uppercase tracking-wide flex items-center gap-2"><Calendar size={14}/> Due Date</label>
                  <input 
                    type="date"
                    value={editTask.dueRaw || ""}
                    onChange={e => setEditTask({...editTask, dueRaw: e.target.value})}
                    min={getTodayStr()}
                    className="h-[52px] w-full bg-[#1A1A1A] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 outline-none text-[#F0F0F0] focus:border-[#6FBBF7] text-[16px] date-picker-custom"
                    style={{ colorScheme: 'dark' }}
                  />
               </div>
               <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-[#888888] uppercase tracking-wide flex items-center gap-2"><Clock size={14}/> Due Time (Optional)</label>
                  <input 
                    type="time"
                    value={editTask.dueTime || ""}
                    onChange={e => setEditTask({...editTask, dueTime: e.target.value})}
                    className="h-[52px] w-full bg-[#1A1A1A] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 outline-none text-[#F0F0F0] focus:border-[#6FBBF7] text-[16px] [color-scheme:dark]"
                    style={{ colorScheme: 'dark' }}
                  />
               </div>
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
                 <span className="text-[14px] font-bold text-[#888888] flex items-center gap-1.5">
                   ✨ Value Estimation
                 </span>
                 {isEditingXpCalculating ? (
                   <span className="text-[16px] font-bold text-[#F7A06F] w-[120px] text-right inline-block italic">
                     Estimating<span className="inline-block text-left w-[16px]">{editingXpDots}</span>
                   </span>
                 ) : (
                   <span className="text-[18px] font-bold text-[#F7D96F] px-1 transition-all">+{editTask.xp} XP</span>
                 )}
               </div>
             </div>

             {editTask.id !== -1 && (
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
