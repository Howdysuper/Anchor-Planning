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
  Lock
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { useToast } from "../contexts/ToastContext";
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
      const res = await fetch("/api/stretch-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recentHabits })
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
        <div className="hidden sm:block">
        </div>
      </header>

      {/* STATS BAR */}
      <div className="flex flex-wrap gap-4 mb-8">
        {/* Render Pinned Widgets First */}
        {[
          {
            id: 'sleep',
            component: (
              <div
                key="sleep"
                className="bg-[#141414] rounded-[20px] p-5 border border-[rgba(255,255,255,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] min-h-[110px] min-w-[200px] flex-1 flex flex-col justify-end group transition-colors relative"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); togglePin('sleep'); }} className="text-[#888888] hover:text-[#7C6FF7]">
                    <Pin size={14} className={pinnedWidgets.includes('sleep') ? "fill-[#7C6FF7] text-[#7C6FF7]" : ""} />
                  </button>
                </div>
                <div onClick={() => navigate("sleep")} className="cursor-pointer">
                  <div className="flex items-center gap-3 mb-2 opacity-80 mt-auto">
                    <Moon size={18} className="text-[#7C6FF7]" />
                    <span className="text-[13px] font-medium text-[#888888]">
                      Sleep Score
                    </span>
                  </div>
                  <p className="text-[32px] font-bold tabular-nums leading-none hover:text-[#7C6FF7] transition-colors">
                    {state.sleep.score}
                    <span className="text-lg text-[#888888]">%</span>
                  </p>
                </div>
              </div>
            )
          },
          {
            id: 'sleep_checkin',
            component: (
              <div key="sleep_checkin" className="bg-[#141414] rounded-[20px] p-5 border border-[rgba(255,255,255,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] min-h-[110px] min-w-[200px] flex-1 flex flex-col justify-end group transition-colors relative">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button onClick={(e) => { e.stopPropagation(); togglePin('sleep_checkin'); }} className="text-[#888888] hover:text-[#7C6FF7]">
                    <Pin size={14} className={pinnedWidgets.includes('sleep_checkin') ? "fill-[#7C6FF7] text-[#7C6FF7]" : ""} />
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-3 opacity-80 mt-auto">
                  <Moon size={18} className="text-[#7C6FF7]" />
                  <span className="text-[13px] font-medium text-[#888888]">
                    Sleep Check-in
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-auto w-full">
                  <button 
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
                    className="flex-1 bg-[#252525] hover:bg-[#333] text-[#F0F0F0] text-[11px] font-bold py-2 rounded-[10px] transition-colors border border-[rgba(255,255,255,0.04)] flex items-center justify-center gap-1"
                  >
                    Waking up
                  </button>
                  <button 
                    onClick={() => {
                       localStorage.setItem('anchor_sleep_start', Date.now().toString());
                       addToast("Sleep well! Come back to log wake time.", "info");
                    }}
                    className="flex-1 bg-[rgba(124,111,247,0.15)] hover:bg-[rgba(124,111,247,0.25)] text-[#7C6FF7] text-[11px] font-bold py-2 rounded-[10px] transition-colors border border-[rgba(124,111,247,0.2)] flex items-center justify-center gap-1"
                  >
                    Going to sleep
                  </button>
                </div>
              </div>
            )
          },
          {
            id: 'xp',
            component: (
              <div key="xp" className="bg-[#141414] rounded-[20px] p-5 border border-[rgba(255,255,255,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] min-h-[110px] min-w-[200px] flex-1 flex flex-col justify-end group relative cursor-pointer">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button onClick={(e) => { e.stopPropagation(); togglePin('xp'); }} className="text-[#888888] hover:text-[#6FBBF7]">
                    <Pin size={14} className={pinnedWidgets.includes('xp') ? "fill-[#6FBBF7] text-[#6FBBF7]" : ""} />
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-2 opacity-80 mt-auto">
                  <Shield size={18} className="text-[#6FBBF7]" />
                  <span className="text-[13px] font-medium text-[#888888]">
                    XP This Week
                  </span>
                </div>
                <p className="text-[32px] font-bold tabular-nums leading-none">
                  {state.user.xp}
                </p>
                <div className="absolute inset-0 bg-[#000] bg-opacity-90 rounded-[20px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none p-4 text-center z-10">
                  <span className="text-xs font-bold text-[#F0F0F0]">
                    Level {state.user.level}
                    <br />
                    Next: {state.user.xpToNextLevel}
                  </span>
                </div>
              </div>
            )
          },
          {
            id: 'tasks',
            component: (
              <div
                key="tasks"
                className="bg-[#141414] rounded-[20px] p-5 border border-[rgba(255,255,255,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] min-h-[110px] min-w-[200px] flex-1 flex flex-col justify-end group transition-colors relative"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); togglePin('tasks'); }} className="text-[#888888] hover:text-[#6FF7A0]">
                    <Pin size={14} className={pinnedWidgets.includes('tasks') ? "fill-[#6FF7A0] text-[#6FF7A0]" : ""} />
                  </button>
                </div>
                <div onClick={() => navigate("quests")} className="cursor-pointer">
                  <div className="flex items-center gap-3 mb-2 opacity-80 mt-auto">
                    <CheckCircle2 size={18} className="text-[#6FF7A0]" />
                    <span className="text-[13px] font-medium text-[#888888]">
                      Tasks Done
                    </span>
                  </div>
                  <p className="text-[32px] font-bold tabular-nums leading-none hover:text-[#6FF7A0] transition-colors">
                    {completedTodayCount}
                  </p>
                </div>
              </div>
            )
          }
        ].sort((a, b) => {
          const aPinned = pinnedWidgets.includes(a.id);
          const bPinned = pinnedWidgets.includes(b.id);
          if (aPinned && !bPinned) return -1;
          if (!aPinned && bPinned) return 1;
          return 0;
        }).map(widget => widget.component)}
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* LEFT 60% - TIMELINE */}
        <section className="lg:col-span-7 bg-[#141414] rounded-[24px] p-8 border border-[rgba(255,255,255,0.06)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[16px] font-bold text-[#F0F0F0]">
              Today's Anchor Flow
            </h2>
            <span
              className="text-[13px] font-medium text-[#888888] cursor-pointer hover:text-[#F0F0F0] transition-colors"
              onClick={() => navigate("anchors")}
            >
              Manage
            </span>
          </div>

          <div className="relative pl-0 flex-1 min-h-[300px]">
            {/* Timeline track */}
            <div className="absolute top-6 bottom-6 left-[111px] w-[2px] bg-gradient-to-b from-[#7C6FF7] via-[rgba(111,247,160,0.3)] to-[rgba(255,255,255,0.06)] shadow-[0_0_8px_rgba(124,111,247,0.15)] pointer-events-none"></div>

            {state.anchors.map((anchor) => {
              const catTheme = getCategoryTheme(anchor.category);
              const isNoteOpen = expandedNoteId === anchor.id;
              const isEditingThisNote = editingNoteId === anchor.id;

              return (
                <div
                  key={anchor.id}
                  className="relative z-10 flex min-h-[82px] items-stretch mb-4 last:mb-0 group"
                >
                  {/* Left: Time (width 100px) */}
                  <div
                    className={`w-[100px] pt-5 shrink-0 text-right pr-6 ${anchor.status === "done" ? "opacity-50" : ""}`}
                  >
                    <span className="text-[13px] font-semibold text-[#F0F0F0] tabular-nums whitespace-nowrap leading-none block">
                      {anchor.time}
                    </span>
                  </div>

                  {/* Center dot/checkmark with visual PROGRESS RING around the anchor point */}
                  <div
                    onClick={() => toggleAnchorStatus(anchor.id)}
                    title="Click to cycle status - completed, in progress, upcoming"
                    className="w-8 shrink-0 flex justify-center relative cursor-pointer hover:scale-110 active:scale-95 transition-transform z-20"
                  >
                    <svg
                      className="absolute top-[14px] w-8 h-8 -rotate-90 pointer-events-none"
                      viewBox="0 0 32 32"
                    >
                      <circle
                        cx="16"
                        cy="16"
                        r="13.5"
                        fill="none"
                        stroke="rgba(255,255,255,0.04)"
                        strokeWidth="2.5"
                      />
                      <motion.circle
                        cx="16"
                        cy="16"
                        r="13.5"
                        fill="none"
                        stroke={
                          anchor.status === "done"
                            ? "#6FF7A0"
                            : anchor.status === "active"
                              ? "#6FBBF7"
                              : "#7C6FF7"
                        }
                        strokeWidth="2.5"
                        strokeDasharray="85"
                        initial={{ strokeDashoffset: 85 }}
                        animate={{
                          strokeDashoffset:
                            anchor.status === "done"
                              ? 0
                              : anchor.status === "active"
                                ? 34
                                : 68,
                        }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        strokeLinecap="round"
                        className={
                          anchor.status === "active"
                            ? "drop-shadow-[0_0_4px_rgba(111,187,247,0.5)]"
                            : anchor.status === "done"
                              ? "drop-shadow-[0_0_4px_rgba(111,247,160,0.3)]"
                              : ""
                        }
                      />
                    </svg>

                    {/* Center contents */}
                    <div className="absolute top-[18px] w-6 h-6 rounded-full bg-[#141414] z-10 flex items-center justify-center border border-[rgba(255,255,255,0.06)]">
                      {anchor.status === "done" ? (
                        <Check
                          size={11}
                          strokeWidth={4}
                          className="text-[#6FF7A0] drop-shadow-[0_0_3px_rgba(111,247,160,0.8)]"
                        />
                      ) : anchor.status === "active" ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#6FBBF7] shadow-[0_0_8px_#6FBBF7] animate-pulse" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-[rgba(255,255,255,0.25)]" />
                      )}
                    </div>
                  </div>

                  {/* Right: Content card with hover effects and glassy design */}
                  <div
                    className={`flex-1 pl-10 py-1 ${anchor.status === "done" ? "opacity-[0.62]" : ""}`}
                  >
                    <motion.div 
                      drag={anchor.status !== "done" ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      dragSnapToOrigin={true}
                      onDragEnd={(e, info) => {
                        if (info.offset.x > 100 && anchor.status !== "done") {
                           const updated = state.anchors.map(a => {
                              if (a.id === anchor.id) {
                                 const xpAward = a.xp || 15;
                                 updateUser({ xp: state.user.xp + xpAward });
                                 addToast(`Swipe Completed! +${xpAward} XP`, "success");
                                 if (typeof navigator !== 'undefined' && navigator.vibrate) {
                                   navigator.vibrate([40, 30, 40]);
                                 }
                                 return { ...a, status: 'done' };
                              }
                              return a;
                           });
                           setAnchors(updated);
                        }
                      }}
                      className={`relative p-[1.5px] rounded-[20px] bg-gradient-to-br transition-all duration-300 ${
                      anchor.status === 'active'
                        ? "from-[#7C6FF7]/60 via-[rgba(111,187,247,0.3)] to-transparent shadow-[0_4px_24px_rgba(124,111,247,0.15)]"
                        : "from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.02)]"
                    }`}>
                      <div
                        className={`w-full bg-[#141414]/95 backdrop-blur-md rounded-[19px] p-4 group/card transition-all duration-300 ${
                          anchor.status === "active" ? "bg-[#1C1A2E]/95" : "hover:bg-[#1C1C1C]"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <p
                                className={`text-[16px] font-bold ${
                                  anchor.status === "upcoming" 
                                    ? "text-[#F0F0F0]" 
                                    : anchor.status === "done" 
                                    ? "text-[#888888] line-through" 
                                    : "text-[#7C6FF7]"
                                }`}
                              >
                                {anchor.title}
                              </p>
                              {/* Dynamic tag badge */}
                              <span 
                                style={{ backgroundColor: catTheme.bg, color: catTheme.color, borderColor: catTheme.border }}
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 shrink-0"
                              >
                                <Tag size={9} />
                                {anchor.category || 'General'}
                              </span>
                            </div>

                            {anchor.subtitle && (
                              <p className="text-[13px] text-[#888888] font-medium mt-1">
                                {anchor.subtitle}
                              </p>
                            )}

                            <div className="flex items-center gap-3 mt-3">
                              <span
                                className={`px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wide border ${
                                  anchor.status === "done" 
                                    ? "bg-[rgba(111,247,160,0.08)] text-[#6FF7A0] border-[rgba(111,247,160,0.2)]" 
                                    : anchor.status === "active" 
                                    ? "bg-[rgba(111,187,247,0.12)] text-[#6FBBF7] border-[rgba(111,187,247,0.25)] animate-pulse" 
                                    : "bg-[#1E1E1E] text-[#888888] border-[rgba(255,255,255,0.04)]"
                                }`}
                              >
                                {anchor.status === "done"
                                  ? "Done"
                                  : anchor.status === "active"
                                    ? "Active"
                                    : anchor.type}
                              </span>
                              {anchor.xp > 0 && (
                                <span className="text-[12px] font-bold text-[#F7D96F] tabular-nums">
                                  +{anchor.xp} XP
                                </span>
                              )}

                              {/* Toggle expandable notes panel */}
                              <button
                                onClick={() => handleToggleNote(anchor.id)}
                                className={`flex items-center gap-1 text-xs font-bold transition-all p-1 px-2 rounded-md ${
                                  isNoteOpen 
                                    ? 'bg-[rgba(124,111,247,0.15)] text-[#7C6FF7]' 
                                    : anchor.note
                                    ? 'bg-[rgba(255,255,255,0.05)] text-[#6FBBF7] hover:bg-[rgba(255,255,255,0.08)]'
                                    : 'text-[#888888] hover:text-[#F0F0F0] hover:bg-[rgba(255,255,255,0.03)]'
                                }`}
                              >
                                <StickyNote size={12} />
                                <span>{anchor.note ? "Note" : "Add Note"}</span>
                                {isNoteOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDelete(anchor.id)}
                            className="opacity-0 group-hover/card:opacity-100 p-1.5 text-[#888888] hover:text-[#F76F6F] hover:bg-[rgba(247,111,111,0.1)] rounded-lg transition-all"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        {/* Collapsible panel with textarea */}
                        <AnimatePresence>
                          {isNoteOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.18 }}
                              className="overflow-hidden mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)]"
                            >
                              {isEditingThisNote ? (
                                <div className="flex flex-col gap-2.5">
                                  <textarea
                                    rows={2}
                                    value={tempNoteText}
                                    onChange={(e) => setTempNoteText(e.target.value)}
                                    placeholder="Write daily checklist notes..."
                                    className="w-full bg-[#1A1A1A] text-[#F0F0F0] text-[14px] p-2.5 rounded-[10px] border border-[rgba(255,255,255,0.08)] outline-none focus:border-[#7C6FF7]/50 resize-none leading-relaxed"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => setEditingNoteId(null)}
                                      className="h-[30px] px-3 bg-transparent border border-[rgba(255,255,255,0.08)] text-[#888888] hover:text-[#F0F0F0] rounded-[6px] text-xs font-bold transition-all"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleUpdateNote(anchor.id)}
                                      className="h-[30px] px-3 bg-[#7C6FF7] hover:bg-[#6b5ee6] text-[#0A0A0A] rounded-[6px] text-xs font-bold transition-all flex items-center gap-1"
                                    >
                                      <Save size={11} />
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-2.5">
                                  {anchor.note ? (
                                    <div className="bg-[#1A1A1A]/80 p-3 rounded-[10px] border border-[rgba(255,255,255,0.03)] text-[13.5px] text-[#E0E0E0] leading-relaxed">
                                      {anchor.note}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-[#888888] italic">
                                      No notes attached to this anchor point.
                                    </p>
                                  )}
                                  <div className="flex justify-end">
                                    <button
                                      onClick={() => startEditingNote(anchor.id, anchor.note)}
                                      className="h-[28px] px-2.5 bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-[#888888] hover:text-[#F0F0F0] border border-[rgba(255,255,255,0.06)] rounded-[6px] text-xs font-bold transition-all flex items-center gap-1"
                                    >
                                      <FileText size={11} />
                                      {anchor.note ? "Edit Note" : "Write Note"}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RIGHT 40% - BATTERY & ACTIVE QUEST */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* SLEEP BATTERY */}
          <section className="bg-[#141414] rounded-[24px] p-6 border border-[rgba(255,255,255,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] text-center flex flex-col items-center flex-1">
            <div className="flex items-center gap-2 mb-5">
              <Moon size={16} className="text-[#888888]" />
              <h2 className="text-[13px] font-bold text-[#888888] tracking-widest uppercase">
                Sleep Intel
              </h2>
            </div>

            <div
              className="relative w-40 h-40 flex items-center justify-center my-auto transition-transform hover:scale-105 cursor-pointer"
              onClick={() => navigate("sleep")}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#1E1E1E"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#7C6FF7"
                  strokeWidth="6"
                  strokeDasharray="282.7"
                  strokeDashoffset={282.7 * (1 - state.sleep.score / 100)}
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_12px_rgba(124,111,247,0.4)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[40px] font-bold tabular-nums leading-none tracking-tight">
                  {state.sleep.score}
                </span>
              </div>
            </div>

            <div className="w-full bg-[#1A1A1A] rounded-[16px] p-4 flex items-center justify-between mt-4">
              <div className="text-left">
                <p className="text-[12px] text-[#888888] font-bold uppercase tracking-wide">
                  Accumulated Debt
                </p>
                <p
                  className={`text-[15px] font-bold mt-0.5 ${state.sleep.debtHours < 0 ? "text-[#F76F6F]" : "text-[#6FF7A0]"}`}
                >
                  {state.sleep.debtHours} hrs this week
                </p>
              </div>
              <button
                onClick={() => navigate("sleep")}
                className="w-8 h-8 rounded-full bg-[#252525] flex items-center justify-center text-[#888888] hover:text-[#F0F0F0] hover:bg-[#333] transition-colors"
              >
                <ChevronRight size={16} strokeWidth={3} />
              </button>
            </div>
          </section>

          {/* NEXT ANCHOR / ACTIVE QUEST */}
          {primaryQuest && (
            <AnimatePresence mode="popLayout">
              <motion.section
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                className="relative overflow-hidden bg-gradient-to-br from-[#1E1E1E] to-[#141414] rounded-[24px] p-6 border border-[rgba(255,255,255,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              >
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-[rgba(111,187,247,0.15)] rounded-full blur-[40px] pointer-events-none"></div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="pr-4">
                    <span className="text-[10px] font-bold text-[#6FBBF7] uppercase tracking-widest bg-[rgba(111,187,247,0.15)] px-2.5 py-1 rounded mb-3 inline-block">
                      Active Quest
                    </span>
                    <h3 className="text-[22px] font-bold text-[#F0F0F0] leading-[1.3]">
                      {primaryQuest.title}
                    </h3>
                  </div>
                  {primaryQuest.minutesLeft && (
                    <div className="bg-[#0A0A0A] min-w-[56px] h-[56px] rounded-[16px] flex flex-col items-center justify-center shrink-0 border border-[rgba(255,255,255,0.06)] shadow-inner">
                      <span className="text-[18px] font-bold tabular-nums leading-none mb-1 text-[#F0F0F0]">
                        {primaryQuest.minutesLeft}
                      </span>
                      <span className="text-[9px] font-bold text-[#888888] uppercase tracking-wider">
                        MIN
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-6 text-[13px] font-bold relative z-10">
                  {primaryQuest.youtubeBlocked && (
                    <div className="flex items-center gap-1.5 text-[#888888]">
                      <Shield size={16} strokeWidth={2.5} /> Focus Mode
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[#F7D96F] bg-[rgba(247,217,111,0.1)] px-2.5 py-1 rounded-md">
                    <Flame size={14} strokeWidth={2.5} /> +{primaryQuest.xp} XP
                  </div>
                </div>

                <button
                  onClick={() =>
                    completeQuest(
                      primaryQuest.id,
                      primaryQuest.xp,
                      primaryQuest.createdAt,
                    )
                  }
                  className="relative w-full h-[52px] bg-[#6FBBF7] hover:bg-[#5aaae6] active:scale-[0.98] text-[#0A0A0A] rounded-[14px] font-bold flex items-center justify-center transition-all shadow-[0_0_16px_rgba(111,187,247,0.2)] z-10 text-[16px]"
                >
                  Complete Quest
                </button>
              </motion.section>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QUEST LOG */}
        <section className="bg-[#141414] rounded-[24px] p-6 border border-[rgba(255,255,255,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[16px] font-bold text-[#F0F0F0]">Up Next</h2>
            <button
              onClick={() => navigate("quests")}
              className="text-[13px] font-bold text-[#888888] hover:text-[#F0F0F0] transition-colors"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
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
                      className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-[16px] border border-[rgba(255,255,255,0.04)] group hover:bg-[#1E1E1E] transition-colors min-h-[64px]"
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() =>
                            completeQuest(quest.id, quest.xp, quest.createdAt)
                          }
                          className={`w-[22px] h-[22px] shrink-0 rounded-[4px] border-2 flex items-center justify-center transition-colors ${isJustCompleted ? "border-[#6FF7A0] bg-[#6FF7A0]" : "border-[rgba(255,255,255,0.2)] hover:border-[#6FF7A0] bg-[#0A0A0A]"}`}
                        >
                          {isJustCompleted && (
                            <Check size={14} color="#0A0A0A" strokeWidth={3} />
                          )}
                        </button>
                        <div>
                          <p
                            className={`text-[15px] font-bold leading-tight mb-1 line-clamp-1 transition-all ${isJustCompleted ? "text-[#888888] line-through" : "text-[#F0F0F0]"}`}
                          >
                            {quest.title}
                          </p>
                          <p className="text-[12px] text-[#888888] font-medium leading-none">
                            {quest.due}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-[12px] font-bold px-3 py-1.5 rounded-full shrink-0 tabular-nums transition-colors ${isJustCompleted ? "bg-[#F7D96F] text-[#0A0A0A]" : "bg-[rgba(247,217,111,0.1)] text-[#F7D96F]"}`}
                      >
                        +{quest.xp} XP
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-[#888888] text-[14px]">
                  No upcoming quests.
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* BRAIN DUMP CACHE */}
        <section className="bg-[#141414] rounded-[24px] p-6 border border-[rgba(255,255,255,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[16px] font-bold text-[#F0F0F0]">Brain Dump</h2>
            <button
              onClick={() => navigate("braindump")}
              className="text-[13px] font-bold text-[#888888] hover:text-[#F0F0F0] transition-colors"
            >
              Organize
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 h-full pb-4">
            {state.brainDumps.slice(0, 2).map((dump) => (
              <div
                key={dump.id}
                onClick={() => navigate("braindump")}
                className="bg-[#1A1A1A] p-4 rounded-[16px] border border-[rgba(255,255,255,0.04)] hover:bg-[#1E1E1E] cursor-pointer transition-colors min-h-[80px] flex flex-col justify-between"
              >
                <p className="text-[14px] font-medium text-[#F0F0F0] leading-[1.5] break-words line-clamp-3">
                  {dump.text}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[12px] text-[#888888] font-bold">
                    {dump.time}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                    style={{ backgroundColor: dump.color, color: dump.color }}
                  ></span>
                </div>
              </div>
            ))}

            <div
              onClick={() => setShowCaptureModal(true)}
              className="bg-[rgba(124,111,247,0.05)] border border-dashed border-[rgba(124,111,247,0.2)] p-4 rounded-[16px] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[rgba(124,111,247,0.1)] transition-colors min-h-[80px] col-span-2 sm:col-span-1 group"
            >
              <span className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Plus size={16} className="text-[#7C6FF7]" />
              </span>
              <p className="text-[13px] font-bold text-[#7C6FF7]">
                Quick capture
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* AI INTELLIGENCE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Weekly Completion Trends Chart */}
        <section className="bg-[#141414] rounded-[24px] p-6 border border-[rgba(255,255,255,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[16px] font-bold text-[#F0F0F0]">Weekly Trajectory</h2>
            <select className="bg-transparent text-[12px] font-bold text-[#888888] outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="w-full flex-1 min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={WEEKLY_TREND_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C6FF7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C6FF7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#555" fontSize={11} tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} tickCount={4} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1A1A1A", borderColor: "rgba(255,255,255,0.08)", borderRadius: "12px", color: "#F0F0F0", fontSize: "12px" }}
                  itemStyle={{ color: "#7C6FF7", fontWeight: "bold" }}
                  labelStyle={{ color: "#888", marginBottom: "4px" }}
                />
                <Area type="monotone" dataKey="completed" stroke="#7C6FF7" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" activeDot={{ r: 5, stroke: "#7C6FF7", strokeWidth: 2, fill: "#141414" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* AI Stretch Goals Array */}
        <section className="bg-gradient-to-br from-[#1E1E1E] to-[#141414] rounded-[24px] p-6 border border-[rgba(255,255,255,0.08)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C6FF7] rounded-full blur-[80px] opacity-[0.05] pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-6 z-10">
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

          <div className="flex-1 flex flex-col justify-center gap-3 z-10">
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
              <div className="text-center py-6 text-[#888888] text-[13px]">
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
            placeholder="What's on your mind?"
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
    </div>
  );
}
