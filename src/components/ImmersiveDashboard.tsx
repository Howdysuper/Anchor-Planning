import React, { useState, useEffect } from "react";
import {
  Shield,
  Flame,
  Coffee,
  MapPin,
  Moon,
  LayoutGrid,
  Calendar,
  User,
  Settings,
  CheckCircle2,
  ChevronRight,
  Plus,
  Check,
  X,
  Tag,
  StickyNote,
  ChevronDown,
  ChevronUp,
  Save,
  FileText,
  Sparkles,
  RefreshCcw,
  Pin,
  Lock,
  Backpack
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { useToast } from "../contexts/ToastContext";
import { useSettings } from "../contexts/SettingsContext";
import { motion, AnimatePresence } from "motion/react";
import Modal from "./ui/Modal";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const CATEGORIES = [
  { name: 'Health', color: '#6FF7A0', bg: 'rgba(111,247,160,0.1)', border: 'rgba(111,247,160,0.25)', text: '#6FF7A0' },
  { name: 'School', color: '#6FBBF7', bg: 'rgba(111,187,247,0.1)', border: 'rgba(111,187,247,0.25)', text: '#6FBBF7' },
  { name: 'Creativity', color: '#F7A06F', bg: 'rgba(247,160,111,0.1)', border: 'rgba(247,160,111,0.25)', text: '#F7A06F' },
  { name: 'Routine', color: '#7C6FF7', bg: 'rgba(124,111,247,0.1)', border: 'rgba(124,111,247,0.25)', text: '#7C6FF7' },
  { name: 'Leisure', color: '#F7D96F', bg: 'rgba(247,217,111,0.1)', border: 'rgba(247,217,111,0.25)', text: '#F7D96F' },
];

const WEEKLY_TREND_DATA = [
  { name: 'Mon', completed: 4 },
  { name: 'Tue', completed: 6 },
  { name: 'Wed', completed: 5 },
  { name: 'Thu', completed: 8 },
  { name: 'Fri', completed: 7 },
  { name: 'Sat', completed: 3 },
  { name: 'Sun', completed: 9 },
];

const MORNING_HABITS = [
  { id: "hydrate", label: "Hydrate", icon: "💧", desc: "Drink 500ml water to kickstart cellular hydration" },
  { id: "sunlight", label: "Circadian Light", icon: "☀️", desc: "Get 10 minutes of morning sunlight exposure" },
  { id: "stretch", label: "Mindful Movement", icon: "🧘", desc: "Stretch or do light physical activation" },
  { id: "offline", label: "Tech-Free Start", icon: "🔌", desc: "No phone/social alerts for the first 30 mins" },
  { id: "prep", label: "Mind Prepared", icon: "🧠", desc: "Review loadout, anchors & set today's goals" }
];

export default function ImmersiveDashboard() {
  const {
    state,
    updateState,
    updateUser,
    updateSleep,
    navigate,
    setQuests,
    setBrainDumps,
    setAnchors,
  } = useApp();
  const { addToast } = useToast();
  const { settings, updateSetting } = useSettings();
  const [isStreakDetailsOpen, setIsStreakDetailsOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(() => {
    return localStorage.getItem("anchor_show_guide") !== "false";
  });

  const getTodayDateString = () => {
    const d = new Date();
    // Shift backward by 11 hours so the check-in day resets/refreshes at exactly 11:00 AM every day
    d.setHours(d.getHours() - 11);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const todayStr = getTodayDateString();

  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [completedHabitIds, setCompletedHabitIds] = useState<string[]>(() => {
    const savedDate = localStorage.getItem("anchor_morning_checkin_date");
    if (savedDate === todayStr) {
      const savedHabits = localStorage.getItem("anchor_morning_checkin_habits");
      return savedHabits ? JSON.parse(savedHabits) : [];
    }
    return [];
  });

  const [tempSelectedHabits, setTempSelectedHabits] = useState<string[]>([]);

  useEffect(() => {
    if (isHabitModalOpen) {
      setTempSelectedHabits(completedHabitIds);
    }
  }, [isHabitModalOpen, completedHabitIds]);

  const isHabitCheckInComplete = localStorage.getItem("anchor_morning_checkin_date") === todayStr;

  const handleCompleteHabitCheckIn = (selectedIds: string[]) => {
    setCompletedHabitIds(selectedIds);
    localStorage.setItem("anchor_morning_checkin_date", todayStr);
    localStorage.setItem("anchor_morning_checkin_habits", JSON.stringify(selectedIds));
    
    const wasAlreadyComplete = localStorage.getItem("anchor_morning_checkin_complete_xp_granted") === todayStr;
    if (!wasAlreadyComplete) {
      updateUser({ xp: state.user.xp + 25 });
      addToast("Morning Routine Check-In Complete! +25 XP Claimed ⚡", "success");
      localStorage.setItem("anchor_morning_checkin_complete_xp_granted", todayStr);
    } else {
      addToast("Morning routine habits updated successfully!", "success");
    }
    
    setIsHabitModalOpen(false);
  };

  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [captureText, setCaptureText] = useState("");

  const [expandedNoteId, setExpandedNoteId] = useState<number | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [tempNoteText, setTempNoteText] = useState("");

  const handleUpdateNote = (id: number) => {
    const updated = state.anchors.map((a) => {
      if (a.id === id) {
        return { ...a, note: tempNoteText };
      }
      return a;
    });
    setAnchors(updated);
    setEditingNoteId(null);
    addToast("Note/Journal updated", "success");
  };

  const startEditingNote = (id: number, currentNote: string) => {
    setEditingNoteId(id);
    setTempNoteText(currentNote || "");
  };

  const getCategoryTheme = (categoryName: string) => {
    return CATEGORIES.find(c => c.name.toLowerCase() === (categoryName || '').toLowerCase()) || CATEGORIES[0];
  };

  const handleToggleNote = (id: number) => {
    if (expandedNoteId === id) {
      setExpandedNoteId(null);
      setEditingNoteId(null);
    } else {
      setExpandedNoteId(id);
      const anchor = state.anchors.find(a => a.id === id);
      setTempNoteText(anchor?.note || "");
    }
  };

  const handleCapture = () => {
    if (!captureText.trim()) return;
    setBrainDumps([
      {
        id: Date.now(),
        text: captureText,
        time: "Just now",
        category: "idea",
        color: "orange",
      },
      ...state.brainDumps,
    ]);
    addToast("Captured to Brain Dump", "success");
    setShowCaptureModal(false);
    setCaptureText("");
  };

  const [stretchGoals, setStretchGoals] = useState<string[]>(() => {
    const saved = localStorage.getItem('anchor_ai_stretch_goals');
    return saved ? JSON.parse(saved) : null;
  });
  const [isStretchLoading, setIsStretchLoading] = useState(false);
  const [pinnedWidgets, setPinnedWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem('anchor_pinned_widgets');
    return saved ? JSON.parse(saved) : ['sleep', 'streak'];
  });

  const fetchStretchGoals = async () => {
    setIsStretchLoading(true);
    try {
      const recentHabits = state.anchors.filter(a => a.status === 'done').map(a => a.title).slice(0, 10);
      const morningHabitLabels = completedHabitIds.map(hId => {
        const habit = MORNING_HABITS.find(h => h.id === hId);
        return habit ? habit.label : hId;
      });
      const res = await fetch("/api/stretch-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recentHabits, morningHabits: morningHabitLabels })
      });
      if (res.ok) {
        const data = await res.json();
        setStretchGoals(data.goals);
        localStorage.setItem('anchor_ai_stretch_goals', JSON.stringify(data.goals));
      }
    } catch(e) {
      console.error(e);
      addToast("Failed to fetch Stretch Goals", "error");
    } finally {
      setIsStretchLoading(false);
    }
  };

  const togglePin = (widgetId: string) => {
    const newPins = pinnedWidgets.includes(widgetId)
      ? pinnedWidgets.filter(w => w !== widgetId)
      : [...pinnedWidgets, widgetId];
    setPinnedWidgets(newPins);
    localStorage.setItem('anchor_pinned_widgets', JSON.stringify(newPins));
    addToast(pinnedWidgets.includes(widgetId) ? 'Widget unpinned' : 'Widget pinned to top', 'info');
  };

  const activeQuests = state.quests.filter((q) => !q.done);
  const primaryQuest = activeQuests.find((q) => q.active) || activeQuests[0];
  const regularQuests = activeQuests
    .filter((q) => q.id !== primaryQuest?.id)
    .slice(0, 3);
  const completedTodayCount = state.quests.filter((q) => q.done).length;

  const [justCompletedIds, setJustCompletedIds] = useState<number[]>([]);

  const completeQuest = (id: number, xpValue: number, createdAt?: number) => {
    if (createdAt && Date.now() - createdAt < 2 * 60 * 60 * 1000) {
      const msLeft = createdAt + 2 * 60 * 60 * 1000 - Date.now();
      const minsLeft = Math.ceil(msLeft / 60000);
      addToast(`Too soon! Wait ${minsLeft}m to prevent spam logging.`, "error");
      return;
    }

    if (justCompletedIds.includes(id)) return;
    setJustCompletedIds((prev) => [...prev, id]);

    const finalXp = Math.max(0, xpValue);

    setTimeout(() => {
      setQuests(
        state.quests.map((q) =>
          q.id === id ? { ...q, done: true, active: false } : q,
        ),
      );
      updateUser({ xp: state.user.xp + finalXp });
      addToast(`Quest Completed! +${finalXp} XP`, "success");
      setJustCompletedIds((prev) => prev.filter((x) => x !== id));
    }, 600);
  };

  const handleDelete = (id: number) => {
    setAnchors(state.anchors.filter((a) => a.id !== id));
    addToast("Anchor deleted", "info");
  };

  const toggleAnchorStatus = (id: number) => {
    const updated = state.anchors.map((anchor) => {
      if (anchor.id === id) {
        let nextStatus = "upcoming";
        let xpAward = 0;
        if (anchor.status === "upcoming") {
          nextStatus = "active";
        } else if (anchor.status === "active") {
          nextStatus = "done";
          xpAward = anchor.xp || 15;
        } else {
          nextStatus = "upcoming";
        }

        if (nextStatus === "done" && xpAward > 0) {
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([40, 30, 40]);
          }
          updateUser({ xp: state.user.xp + xpAward });
          addToast(`Anchor Completed! +${xpAward} XP`, "success");
        } else {
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(50);
          }
          addToast(
            `Anchor is now ${nextStatus === "active" ? "In Progress" : "Upcoming"}`,
            "info",
          );
        }
        return { ...anchor, status: nextStatus };
      }
      return anchor;
    });
    setAnchors(updated);
  };

  const getTypeStyle = (status: string, type: string) => {
    if (status === "done") return "bg-[rgba(111,247,160,0.1)] text-[#6FF7A0]";
    if (status === "active") return "bg-[rgba(111,187,247,0.1)] text-[#6FBBF7]";
    if (type === "fixed") return "bg-[#1E1E1E] text-[#888888]";
    if (type === "bedtime") return "bg-[rgba(124,111,247,0.1)] text-[#7C6FF7]";
    return "bg-[#1E1E1E] text-[#888888]";
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* PAGE HEADER */}
      <header className="flex justify-between items-end border-b border-[rgba(255,255,255,0.06)] pb-6 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-[#F0F0F0] tracking-tight leading-tight">
            Good morning, {state.user.name}
          </h1>
          <p className="text-[16px] text-[#888888] font-medium mt-1">
            You have{" "}
            {state.anchors.filter((a) => a.status === "upcoming").length}{" "}
            anchors lined up for today.
          </p>
        </div>
        <div 
          onClick={() => setIsStreakDetailsOpen(true)}
          className="flex items-center gap-2 bg-[rgba(250,204,21,0.12)] border border-[rgba(250,204,21,0.3)] hover:border-[rgba(250,204,21,0.5)] text-[#FACC15] px-4 py-2 rounded-full font-bold shadow-[0_0_15px_rgba(250,204,21,0.15)] hover:bg-[rgba(250,204,21,0.2)] transition-all duration-300 cursor-pointer shrink-0 select-none"
        >
          <Flame size={18} fill="#FACC15" className="animate-pulse text-[#FACC15]" />
          <span className="text-[16px] tracking-tight">{state.user.streakDays}</span>
        </div>
      </header>

      {/* ACTION BANNERS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Column (span 7): Sleep Tracker & Loadout */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div id="sleep-checkin-banner" className="bg-[#141414] rounded-[24px] p-6 border border-[rgba(255,255,255,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] flex flex-col sm:flex-row sm:items-center lg:flex-col xl:flex-row xl:items-center justify-between gap-6 flex-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[rgba(124,111,247,0.1)] flex items-center justify-center shrink-0">
                <Moon size={24} className="text-[#7C6FF7]" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-[#F0F0F0]">Sleep Tracker & Check-in</h2>
                <p className="text-[13px] text-[#888888] mt-0.5">Control bedtimes and track daily rhythms easily</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto lg:w-full xl:w-auto shrink-0">
              <button 
                id="wake-up-checkin-btn"
                disabled={!localStorage.getItem('anchor_sleep_start')}
                onClick={() => {
                    const sleepStart = localStorage.getItem('anchor_sleep_start');
                    if (sleepStart) {
                      const durationMs = Date.now() - parseInt(sleepStart);
                      const hours = durationMs / (1000 * 60 * 60);
                      const newScore = Math.min(100, Math.max(0, Math.round((hours / 8) * 100)));
                      const debt = (8 - hours);
                      updateSleep({
                         score: newScore,
                         debtHours: parseFloat((state.sleep.debtHours + debt).toFixed(1)),
                         history: [...state.sleep.history.slice(1), newScore]
                      });
                      localStorage.removeItem('anchor_sleep_start');
                      addToast(`Woke up! Sleep duration: ${hours.toFixed(1)}h`, "success");
                    } else {
                      addToast("You haven't checked in for sleep yet.", "error");
                    }
                }} 
                className={`flex-1 sm:flex-none sm:px-6 lg:flex-1 xl:flex-none xl:px-6 text-sm font-bold h-[44px] rounded-[12px] transition-colors border flex items-center justify-center gap-2 shadow-sm ${
                  !localStorage.getItem('anchor_sleep_start') 
                  ? 'bg-[#1A1A1A] text-[#555555] border-[rgba(255,255,255,0.02)] cursor-not-allowed'
                  : 'bg-[#252525] hover:bg-[#333] text-[#F0F0F0] border-[rgba(255,255,255,0.04)]'
                }`}
              >
                Waking up
              </button>
              <button 
                id="sleep-checkin-btn"
                disabled={!!localStorage.getItem('anchor_sleep_start')}
                onClick={() => {
                   localStorage.setItem('anchor_sleep_start', Date.now().toString());
                   addToast("Sleep well! Come back to log wake time.", "info");
                 }}
                className={`flex-1 sm:flex-none sm:px-6 lg:flex-1 xl:flex-none xl:px-6 text-sm font-bold h-[44px] rounded-[12px] transition-colors border flex items-center justify-center gap-2 shadow-sm ${
                  !!localStorage.getItem('anchor_sleep_start')
                  ? 'bg-[rgba(124,111,247,0.05)] text-[#7C6FF7]/30 border-[rgba(124,111,247,0.05)] cursor-not-allowed'
                  : 'bg-[rgba(124,111,247,0.15)] hover:bg-[rgba(124,111,247,0.25)] text-[#7C6FF7] border-[rgba(124,111,247,0.2)]'
                }`}
              >
                Going to sleep
              </button>
            </div>
          </div>

          {/* Loadout reminder banner */}
          <div id="loadout-reminder-banner" className="bg-[#141414] rounded-[24px] p-6 border border-[rgba(255,255,255,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[rgba(124,111,247,0.1)] flex items-center justify-center shrink-0 text-[#7C6FF7]">
                <Backpack size={24} />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#F0F0F0]">Forgetting Something?</h3>
                <p className="text-[13px] text-[#888888] mt-0.5">Check your Loadout to make sure you are ready to go.</p>
              </div>
            </div>
            <button 
              id="view-loadout-remind-btn"
              onClick={() => navigate("loadout")}
              className="w-full sm:w-auto bg-[rgba(124,111,247,0.15)] hover:bg-[rgba(124,111,247,0.25)] text-[#7C6FF7] text-sm font-bold px-6 h-[44px] rounded-[12px] transition-colors border border-[rgba(124,111,247,0.2)] flex items-center justify-center gap-2 shrink-0 active:scale-95"
            >
              <span>View Loadout</span>
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Right Column (span 5): Daily Morning Habits Check-In */}
        <div className="lg:col-span-5 flex">
          <div id="daily-morning-habits-banner" className="w-full bg-gradient-to-br from-[#1E1E1E] to-[#141414] rounded-[24px] p-6 border border-[rgba(255,255,255,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#6FF7A0] animate-pulse" />
                  <span className="text-[11px] font-black uppercase text-[#888888] tracking-widest">Daily Alignment</span>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${isHabitCheckInComplete ? 'bg-[rgba(111,247,160,0.12)] text-[#6FF7A0]' : 'bg-[rgba(124,111,247,0.12)] text-[#7C6FF7] border border-[rgba(124,111,247,0.2)]'}`}>
                  {isHabitCheckInComplete ? 'Synchronized' : 'Ready'}
                </span>
              </div>

              <h2 className="text-[16px] font-bold text-[#F0F0F0] leading-snug">Morning Routine Check-In</h2>
              <p className="text-[13px] text-[#888888] mt-1.5 leading-relaxed">
                {isHabitCheckInComplete 
                  ? "Your morning habits are logged! Maintaining robust alignment with your daily flow."
                  : "Track your morning hydration, light, movement, and wellness checklist to stack up XP."
                }
              </p>

              {isHabitCheckInComplete && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {completedHabitIds.map(hId => {
                    const habit = MORNING_HABITS.find(h => h.id === hId);
                    if (!habit) return null;
                    return (
                      <span key={hId} className="text-[11px] font-semibold bg-[#1C1C1C] text-[#E0E0E0] border border-[rgba(255,255,255,0.06)] pl-1.5 pr-2.5 py-1 rounded-[8px] flex items-center gap-1">
                        <span>{habit.icon}</span>
                        <span>{habit.label}</span>
                      </span>
                    );
                  })}
                  {completedHabitIds.length === 0 && (
                    <span className="text-xs text-[#888888] italic">No attributes checked off.</span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6">
              <button 
                id="habit-checkin-start-btn"
                onClick={() => setIsHabitModalOpen(true)}
                disabled={isHabitCheckInComplete}
                className={`w-full h-[42px] rounded-[12px] font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  isHabitCheckInComplete 
                    ? 'bg-[#1F1F1F] text-[#606060] border border-[rgba(255,255,255,0.03)] cursor-not-allowed opacity-60' 
                    : 'bg-[#7C6FF7] hover:bg-[#6b5ee0] text-white shadow-[0_0_16px_rgba(124,111,247,0.2)]'
                }`}
              >
                {isHabitCheckInComplete ? (
                  <>
                    <Check size={13} className="text-[#6FF7A0]" />
                    <span>Check-In Completed Today</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Start Morning Check-In (+25 XP)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* QUESTS & BRAIN DUMP */}
        <div className="flex flex-col gap-6">
          {/* INBOX & TASKS */}
          <section id="inbox-section" className="bg-[#141414] rounded-[24px] p-6 border border-[rgba(255,255,255,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-[16px] font-bold text-[#F0F0F0]">Tasks</h2>
                <p className="text-[12px] text-[#888888] mt-0.5">Your quests and quick captures in one place.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("quests")}
                  className="text-[13px] font-bold bg-[#1A1A1A] text-[#888888] hover:text-[#F0F0F0] hover:bg-[#2A2A2A] transition-colors border border-[rgba(255,255,255,0.06)] px-3 py-1.5 rounded-[8px]"
                >
                  View All
                </button>
              </div>
            </div>

            <Modal isOpen={showGuide} onClose={() => {
              setShowGuide(false);
              localStorage.setItem("anchor_show_guide", "false");
            }}>
              <div className="bg-[#141414] rounded-[24px] p-6 relative overflow-hidden max-w-2xl w-full mx-auto border border-[rgba(124,111,247,0.15)] shadow-[0_4px_32px_rgba(0,0,0,0.4)]">
                <button 
                  onClick={() => {
                    setShowGuide(false);
                    localStorage.setItem("anchor_show_guide", "false");
                    addToast("Guide hidden. You're ready to go!", "info");
                  }}
                  className="absolute top-4 right-4 text-[#888888] hover:text-[#F0F0F0] transition-all p-1 hover:bg-[rgba(255,255,255,0.05)] rounded-full"
                  aria-label="Dismiss guide"
                >
                  <X size={18} />
                </button>
                <h4 className="text-[18px] font-bold text-[#7C6FF7] uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Sparkles size={18} className="animate-pulse" /> New User Quick Start Guide
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex items-start gap-4 bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.04)]">
                    <span className="text-[24px] shrink-0">🛌</span>
                    <div>
                      <p className="text-[14px] font-bold text-[#F0F0F0] mb-1">Track Sleep</p>
                      <p className="text-[12px] text-[#888888] leading-relaxed">
                        Log when you go to bed or wake up using the sleep check-in buttons to align with circadian rhythms.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.04)]">
                    <span className="text-[24px] shrink-0">💧</span>
                    <div>
                      <p className="text-[14px] font-bold text-[#F0F0F0] mb-1">Morning Alignment</p>
                      <p className="text-[12px] text-[#888888] leading-relaxed">
                        Cross off daily morning habits (Hydrate, Light, Mindful Movement) to stack up XP and set up your day.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.04)]">
                    <span className="text-[24px] shrink-0">🎒</span>
                    <div>
                      <p className="text-[14px] font-bold text-[#F0F0F0] mb-1">Pack Loadout</p>
                      <p className="text-[12px] text-[#888888] leading-relaxed">
                        Go to the <span className="text-[#7C6FF7] font-semibold">Loadout</span> tab to check off your essential items so you never forget anything.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.04)]">
                    <span className="text-[24px] shrink-0">⚓</span>
                    <div>
                      <p className="text-[14px] font-bold text-[#F0F0F0] mb-1">Tasks</p>
                      <p className="text-[12px] text-[#888888] leading-relaxed">
                        Set your own tasks from the bottom right plus button. Complete tasks to earn XP and level up. Use the AI Assistant to help organize and schedule your day automatically!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>

            <div className="space-y-4">
              {/* PRIMARY QUEST */}
              {primaryQuest && (
                <div id={`active-quest-item-${primaryQuest.id}`} className="bg-[#1A1A1A] p-4.5 rounded-[18px] border border-[rgba(124,111,247,0.25)] relative overflow-hidden group hover:border-[rgba(124,111,247,0.4)] transition-all">
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-[rgba(124,111,247,0.12)] rounded-full blur-[20px] pointer-events-none"></div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => completeQuest(primaryQuest.id, primaryQuest.xp, primaryQuest.createdAt)}
                        className={`w-[22px] h-[22px] shrink-0 mt-0.5 rounded-[4px] border-2 flex items-center justify-center transition-colors ${justCompletedIds.includes(primaryQuest.id) ? "border-[#6FF7A0] bg-[#6FF7A0]" : "border-[#7C6FF7] hover:border-[#6FF7A0] bg-[#0A0A0A]"}`}
                      >
                        {justCompletedIds.includes(primaryQuest.id) && (
                          <Check size={14} color="#0A0A0A" strokeWidth={3} />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1 bg-[rgba(124,111,247,0.12)] px-2 py-0.5 rounded-[4px] w-fit">
                          <span className="text-[9px] font-bold text-[#7C6FF7] uppercase tracking-wider">Active Quest</span>
                        </div>
                        <p className="text-[15px] font-bold text-[#F0F0F0] leading-tight line-clamp-2">
                          {primaryQuest.title}
                        </p>
                        {primaryQuest.due && (
                          <p className="text-[12px] text-[#888888] font-medium mt-1">
                            {primaryQuest.due}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-[12px] font-bold px-2.5 py-1 rounded-full bg-[rgba(247,217,111,0.1)] text-[#F7D96F] shrink-0">
                      +{primaryQuest.xp} XP
                    </div>
                  </div>
                </div>
              )}

              {/* REGULAR QUESTS */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-2 px-1">Upcoming Tasks</h3>
                <AnimatePresence>
                  {regularQuests.length > 0 ? (
                    regularQuests.map((quest) => {
                      const isJustCompleted = justCompletedIds.includes(quest.id);
                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: isJustCompleted ? 0.6 : 1, y: 0 }}
                          exit={{
                            opacity: 0,
                            x: -20,
                            transition: { duration: 0.2 },
                          }}
                          key={quest.id}
                          className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-[14px] border border-[rgba(255,255,255,0.04)] group hover:bg-[#1E1E1E] transition-colors min-h-[56px]"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                completeQuest(quest.id, quest.xp, quest.createdAt)
                              }
                              className={`w-[18px] h-[18px] shrink-0 rounded-[4px] border-2 flex items-center justify-center transition-colors ${isJustCompleted ? "border-[#6FF7A0] bg-[#6FF7A0]" : "border-[rgba(255,255,255,0.2)] hover:border-[#6FF7A0] bg-[#0A0A0A]"}`}
                            >
                              {isJustCompleted && (
                                <Check size={12} color="#0A0A0A" strokeWidth={3} />
                              )}
                            </button>
                            <div>
                              <p
                                className={`text-[13px] font-bold leading-tight mb-0.5 line-clamp-1 transition-all ${isJustCompleted ? "text-[#888888] line-through" : "text-[#F0F0F0]"}`}
                              >
                                {quest.title}
                              </p>
                              <p className="text-[11px] text-[#888888] font-medium leading-none">
                                {quest.due}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 tabular-nums transition-colors ${isJustCompleted ? "bg-[#F7D96F] text-[#0A0A0A]" : "bg-[rgba(247,217,111,0.1)] text-[#F7D96F]"}`}
                          >
                            +{quest.xp} XP
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    !primaryQuest && (
                      <div className="text-center py-4 px-3 bg-[#1A1A1A] rounded-[14px] border border-dashed border-[rgba(255,255,255,0.1)]">
                        <p className="text-[#888888] text-[12px] leading-relaxed">
                          No upcoming tasks.
                        </p>
                      </div>
                    )
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 gap-6">
        {/* AI Stretch Goals Array */}
        <section id="stretch-goals-section" className="bg-gradient-to-br from-[#1E1E1E] to-[#141414] rounded-[24px] p-6 border border-[rgba(255,255,255,0.08)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C6FF7] rounded-full blur-[80px] opacity-[0.05] pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-6 z-10 w-full">
            <div>
              <h2 className="text-[16px] font-bold text-[#F0F0F0] flex items-center gap-2">
                <Sparkles size={16} className="text-[#6FBBF7]" />
                AI Stretch Goals
              </h2>
              <p className="text-[12px] text-[#888888] mt-0.5">Micro-habits tailored for you</p>
            </div>
            <button 
              onClick={fetchStretchGoals} 
              disabled={isStretchLoading}
              className="p-2 text-[#888888] hover:text-[#7C6FF7] bg-[rgba(255,255,255,0.04)] rounded-lg transition-colors border border-[rgba(255,255,255,0.04)]"
            >
              <RefreshCcw size={14} className={isStretchLoading ? "animate-spin text-[#7C6FF7]" : ""} />
            </button>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 z-10">
            {stretchGoals ? (
              stretchGoals.map((goal, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-[#1A1A1A] rounded-[16px] border border-[rgba(255,255,255,0.04)] group transition-colors hover:bg-[#1E1E1E]">
                  <div className="w-6 h-6 rounded-full bg-[rgba(111,187,247,0.1)] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-[#6FBBF7]">{i + 1}</span>
                  </div>
                  <p className="text-[13px] text-[#E0E0E0] leading-snug">{goal}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-[#888888] text-[13px] col-span-3">
                Click the refresh icon to scan your habit history and generate custom stretch goals.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Capture Modal for Dashboard specifically */}
      <Modal
        isOpen={showCaptureModal}
        onClose={() => setShowCaptureModal(false)}
      >
        <div className="flex flex-col gap-6">
          <h2 className="text-[20px] font-bold text-[#F0F0F0]">
            Quick Capture
          </h2>
          <textarea
            autoFocus
            value={captureText}
            onChange={(e) => setCaptureText(e.target.value)}
            placeholder="Quickly dump an idea, task, or distracting thought..."
            className="w-full bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-4 text-[#F0F0F0] outline-none min-h-[120px] resize-none focus:border-[#7C6FF7] focus:shadow-[0_0_12px_rgba(124,111,247,0.2)] transition-all text-[16px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleCapture();
              }
            }}
          />
          <button
            onClick={handleCapture}
            className="h-[52px] w-full bg-[#7C6FF7] hover:bg-[#6b5ee6] text-[#0A0A0A] rounded-[14px] font-bold text-[16px] transition-all"
          >
            Capture
          </button>
        </div>
      </Modal>

      {/* Morning Habits Check-In Modal */}
      <Modal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        title="Morning Routine Check-In"
      >
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs text-[#888888] font-bold uppercase tracking-wider mb-2">Progress Alignment</p>
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex-1 bg-[#1A1A1A] h-2 rounded-full overflow-hidden border border-[rgba(255,255,255,0.04)]">
                <div 
                  className="bg-gradient-to-r from-[#7C6FF7] to-[#6FF7A0] h-full transition-all duration-300"
                  style={{ width: `${(tempSelectedHabits.length / MORNING_HABITS.length) * 100}%` }}
                />
              </div>
              <span className="text-[13px] font-bold text-[#F0F0F0] shrink-0 tabular-nums">
                {tempSelectedHabits.length} / {MORNING_HABITS.length}
              </span>
            </div>
            <p className="text-[13px] text-[#888888]">
              Select the habit anchors you successfully executed this morning.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {MORNING_HABITS.map((habit) => {
              const isChecked = tempSelectedHabits.includes(habit.id);
              return (
                <div 
                  key={habit.id}
                  onClick={() => {
                    if (isChecked) {
                      setTempSelectedHabits(tempSelectedHabits.filter(id => id !== habit.id));
                    } else {
                      setTempSelectedHabits([...tempSelectedHabits, habit.id]);
                    }
                  }}
                  className={`p-4 rounded-[16px] border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isChecked 
                      ? 'bg-[rgba(124,111,247,0.06)] border-[#7C6FF7] shadow-[0_0_12px_rgba(124,111,247,0.1)]' 
                      : 'bg-[#1A1A1A] border-[rgba(255,255,255,0.04)] hover:bg-[#202020] hover:border-[rgba(255,255,255,0.05)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-[24px] select-none shrink-0 w-10 h-10 rounded-full bg-[#141414] flex items-center justify-center border border-[rgba(255,255,255,0.04)]">
                      {habit.icon}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-[#F0F0F0] leading-none mb-1">{habit.label}</h4>
                      <p className="text-[12px] text-[#888888] leading-tight pr-2">{habit.desc}</p>
                    </div>
                  </div>
                  
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                    isChecked 
                      ? 'bg-[#7C6FF7] border-[#7C6FF7] text-white' 
                      : 'border-[rgba(255,255,255,0.2)]'
                  }`}>
                    {isChecked && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => handleCompleteHabitCheckIn(tempSelectedHabits)}
            className="h-[50px] w-full bg-[#7C6FF7] hover:bg-[#6b5ee0] text-white rounded-[14px] font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(124,111,247,0.2)] mt-2"
          >
            <CheckCircle2 size={16} />
            <span>Lock Morning Status & Claim +25 XP</span>
          </button>
        </div>
      </Modal>

      {/* Streak Details Modal */}
      <Modal
        isOpen={isStreakDetailsOpen}
        onClose={() => setIsStreakDetailsOpen(false)}
        title="Streak Consistency Hub"
      >
        <div className="flex flex-col gap-5">
          {/* Glowing Streak Flame Banner */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[rgba(250,204,21,0.06)] to-[rgba(124,111,247,0.01)] rounded-[24px] border border-[rgba(250,204,21,0.1)] shadow-inner">
            <div className="relative w-20 h-20 flex items-center justify-center bg-gradient-to-br from-[#FACC15] to-[#EAB308] rounded-2xl shadow-[0_0_24px_rgba(250,204,21,0.3)] animate-pulse">
              <Flame size={40} className="text-white fill-white" />
              <div className="absolute -top-1.5 -right-1.5 bg-[#7C6FF7] text-white text-[10px] px-1.5 py-0.5 rounded-full font-black border border-[#141414]">
                LV.{state.user.level}
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-[#FACC15] mt-4 tracking-tight tabular-nums">
              {state.user.streakDays} Day Streak!
            </h3>
            <p className="text-[13px] text-zinc-400 font-medium text-center max-w-[320px] mt-1.5 leading-relaxed">
              Incredible discipline! You have active <span className="text-[#FACC15] font-bold">1.2x streak multipliers</span> boosting all of today's checklist completions.
            </p>
          </div>

          {/* Streak Freeze Shield Safeguard */}
          <div className="p-4 rounded-[16px] bg-[#1E1E1E] border border-[rgba(255,255,255,0.04)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[rgba(124,111,247,0.08)] flex items-center justify-center text-[#7C6FF7]">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#F0F0F0]">Streak Freeze Shield</h4>
                  <p className="text-[12px] text-[#888888] leading-tight">
                    {state.user.streakFreezes ? `${state.user.streakFreezes} active freeze(s)` : "No active freezes"}
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 bg-[rgba(247,160,111,0.1)] text-[#F7A06F] text-xs font-bold rounded-full border border-[rgba(247,160,111,0.2)] whitespace-nowrap">
                {state.user.xp} XP
              </div>
            </div>
            
            {/* Freeze Packages Store */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { days: 1, xp: 20, label: '1 Day' },
                { days: 2, xp: 40, label: '2 Days' },
                { days: 3, xp: 60, label: '3 Days' },
                { days: 7, xp: 100, label: '1 Week', discount: '30% OFF' },
              ].map((pkg) => (
                <button
                  key={pkg.days}
                  onClick={() => {
                    if (state.user.xp >= pkg.xp) {
                      updateUser({
                        xp: state.user.xp - pkg.xp,
                        streakFreezes: (state.user.streakFreezes || 0) + pkg.days
                      });
                      addToast(`Purchased ${pkg.label} freeze!`, 'success');
                    } else {
                      addToast("Not enough XP!", 'error');
                    }
                  }}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-[12px] border transition-all ${
                    state.user.xp >= pkg.xp
                      ? 'bg-[#141414] border-[rgba(255,255,255,0.04)] hover:border-[#7C6FF7] hover:bg-[rgba(124,111,247,0.04)] cursor-pointer hover:shadow-[0_4px_12px_rgba(124,111,247,0.1)]'
                      : 'bg-[#111] border-[rgba(255,255,255,0.02)] opacity-50 cursor-not-allowed'
                  }`}
                >
                  {pkg.discount && (
                    <div className="absolute -top-2 bg-[#F7A06F] text-[#141414] text-[9px] font-black px-1.5 py-0.5 rounded-sm shadow-md">
                      {pkg.discount}
                    </div>
                  )}
                  <div className="text-[14px] font-bold text-[#F0F0F0]">{pkg.label}</div>
                  <div className="text-[11px] font-bold text-[#7C6FF7] mt-1">{pkg.xp} XP</div>
                </button>
              ))}
            </div>
          </div>

          {/* Habit History Chart / Visualizer */}
          <div className="p-4 rounded-[16px] bg-[#1E1E1E] border border-[rgba(255,255,255,0.04)]">
            <h4 className="text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-3">
              Consistency History (Last 7 Days)
            </h4>
            <div className="flex justify-between gap-1 select-none font-mono">
              {Array.from({ length: 7 }).map((_, idx) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - idx));
                const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
                const isToday = idx === 6;
                const isCompleted = [true, true, false, true, true, false, true][idx];
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                    <span className={`text-[10px] font-bold ${isToday ? 'text-[#FACC15] underline decoration-dotted' : 'text-zinc-500'}`}>
                      {dayLabel}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                      isCompleted 
                        ? 'bg-[rgba(250,204,21,0.08)] border-[#FACC15] text-[#FACC15]' 
                        : 'bg-[#141414] border-[rgba(255,255,255,0.04)] text-zinc-600'
                    }`}>
                      {isCompleted ? <Check size={14} strokeWidth={3} /> : <X size={12} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* View Leaderboard CTA */}
          <button
            onClick={() => {
              setIsStreakDetailsOpen(false);
              navigate("leaderboard");
              addToast("Compete on specific habit streaks with friends!", "info");
            }}
            className="h-[50px] w-full bg-gradient-to-r from-[#FACC15] to-[#EAB308] hover:from-[#EAB308] hover:to-[#FACC15] text-white rounded-[14px] font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(250,204,21,0.2)] mt-1"
          >
            <Sparkles size={16} />
            <span>Compete on Global Leaderboard</span>
          </button>
        </div>
      </Modal>
    </div>
  );
}
