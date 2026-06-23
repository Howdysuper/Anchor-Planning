import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { useToast } from "../contexts/ToastContext";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Clock,
  X,
  Check,
  Bell,
  BellOff,
  BellRing,
  FileText,
  Tag,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  StickyNote,
  Flame
} from "lucide-react";
import Modal from "./ui/Modal";

const CATEGORIES = [
  { name: 'Health', color: '#6FF7A0', bg: 'rgba(111,247,160,0.1)', border: 'rgba(111,247,160,0.25)', text: '#6FF7A0' },
  { name: 'School', color: '#6FBBF7', bg: 'rgba(111,187,247,0.1)', border: 'rgba(111,187,247,0.25)', text: '#6FBBF7' },
  { name: 'Creativity', color: '#F7A06F', bg: 'rgba(247,160,111,0.1)', border: 'rgba(247,160,111,0.25)', text: '#F7A06F' },
  { name: 'Routine', color: '#7C6FF7', bg: 'rgba(124,111,247,0.1)', border: 'rgba(124,111,247,0.25)', text: '#7C6FF7' },
  { name: 'Leisure', color: '#F7D96F', bg: 'rgba(247,217,111,0.1)', border: 'rgba(247,217,111,0.25)', text: '#F7D96F' },
];

export default function AnchorPoints() {
  const { 
    state, 
    setAnchors, 
    updateUser, 
    notificationPermission, 
    requestNotificationPermission, 
    triggerManualReminder 
  } = useApp();
  const { addToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAnchor, setNewAnchor] = useState({
    time: "12:00 PM",
    title: "",
    type: "fixed",
    category: "Health",
    note: ""
  });

  const [expandedNoteId, setExpandedNoteId] = useState<number | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [tempNoteText, setTempNoteText] = useState("");

  const [hasClaimedToday, setHasClaimedToday] = useState(() => {
    try {
      const claimedToday = localStorage.getItem('anchor_habits_claimed_date');
      return claimedToday === new Date().toISOString().split('T')[0];
    } catch (e) {
      return false;
    }
  });

  const [selectedMood, setSelectedMood] = useState<string | null>(() => {
    try {
      const savedMood = localStorage.getItem('anchor_daily_mood_today');
      if (savedMood) {
        const parsed = JSON.parse(savedMood);
        if (parsed.date === new Date().toISOString().split('T')[0]) {
          return parsed.mood;
        }
      }
      return null;
    } catch(e) {
      return null;
    }
  });

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('anchor_daily_mood_today', JSON.stringify({ date: today, mood }));
    addToast(`Mood logged: ${mood}`, 'success');
  };

  const doneAnchorsCount = state.anchors.filter((a: any) => a.status === 'done').length;
  const totalAnchorsCount = state.anchors.length;
  const habitsCompletionPercent = totalAnchorsCount > 0 ? Math.round((doneAnchorsCount / totalAnchorsCount) * 100) : 0;

  const handleClaimStreak = () => {
    if (hasClaimedToday) return;
    if (doneAnchorsCount !== totalAnchorsCount || totalAnchorsCount === 0) {
      addToast("Complete all habit anchors to claim your daily streak!", "error");
      return;
    }
    
    // Increment streak days and add +25 XP
    const nextStreak = state.user.streakDays + 1;
    const nextXp = state.user.xp + 25;
    
    updateUser({ 
      streakDays: nextStreak,
      xp: nextXp
    });
    
    try {
      localStorage.setItem('anchor_habits_claimed_date', new Date().toISOString().split('T')[0]);
    } catch(e) {}
    
    setHasClaimedToday(true);
    addToast(`⚡ Streak Shield fully secured! +25 XP awarded. Your streak is now ${nextStreak} days!`, "success");
  };

  const handleAddAnchor = () => {
    if (!newAnchor.title.trim()) {
      addToast("Please enter an anchor title", "error");
      return;
    }
    const anchor = {
      id: Date.now(),
      time: newAnchor.time,
      title: newAnchor.title,
      subtitle: "",
      status: "upcoming",
      type: newAnchor.type,
      category: newAnchor.category,
      note: newAnchor.note,
      xp: 15,
    };
    
    // Sort logic
    const sorted = [...state.anchors, anchor].sort((a, b) => {
      const getMinutes = (t: string) => {
        const match = t.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
        if (!match) return 0;
        let hrs = parseInt(match[1]);
        const mins = parseInt(match[2]);
        const amp = match[3].toUpperCase();
        if (amp === 'PM' && hrs < 12) hrs += 12;
        if (amp === 'AM' && hrs === 12) hrs = 0;
        return hrs * 60 + mins;
      };
      return getMinutes(a.time) - getMinutes(b.time);
    });

    setAnchors(sorted);
    addToast("Anchor added successfully", "success");
    setIsModalOpen(false);
    setNewAnchor({ time: "12:00 PM", title: "", type: "fixed", category: "Health", note: "" });
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* PAGE HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-[#F0F0F0] tracking-tight leading-tight mb-2">
            Anchor Points
          </h1>
          <p className="text-[16px] text-[#888888] font-medium">
            Your daily rhythm, categories, and timely reminders.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-[48px] px-6 bg-[#7C6FF7] hover:bg-[#6b5ee6] text-[#0A0A0A] rounded-[14px] font-bold text-sm transition-all shadow-[0_4px_20px_rgba(124,111,247,0.3)] flex items-center justify-center gap-2 self-start sm:self-auto hover:scale-105 active:scale-95"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Anchor Point
        </button>
      </header>

      {/* DAILY MOOD TRACKER */}
      <div className="bg-[#141414] rounded-[24px] p-6 border border-[rgba(255,255,255,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-[14px] font-bold text-[#888888] uppercase tracking-widest mb-1">Daily Check-In</h2>
          <p className="text-[16px] font-bold text-[#F0F0F0]">How are you feeling today?</p>
        </div>
        <div className="flex bg-[#1A1A1A] rounded-[16px] p-2 border border-[rgba(255,255,255,0.04)] relative z-10 w-full sm:w-auto justify-between sm:justify-start gap-1">
          {[
            { emoji: '😞', label: 'Struggling' },
            { emoji: '😐', label: 'Meh' },
            { emoji: '😌', label: 'Okay' },
            { emoji: '😃', label: 'Good' },
            { emoji: '🤩', label: 'Amazing' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => handleMoodSelect(item.label)}
              title={item.label}
              className={`w-12 h-12 flex items-center justify-center text-[24px] rounded-[12px] transition-all hover:scale-110 active:scale-95 ${
                selectedMood === item.label 
                  ? 'bg-[#7C6FF7] shadow-[0_0_16px_rgba(124,111,247,0.4)] transform scale-110' 
                  : 'hover:bg-[rgba(255,255,255,0.06)] opacity-70 hover:opacity-100 grayscale hover:grayscale-0'
              } ${selectedMood && selectedMood !== item.label ? 'opacity-30 scale-90' : ''}`}
            >
              {item.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* LOCAL NOTIFICATION CARD */}
      <div className="relative p-[1px] rounded-[24px] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.01)] mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="bg-[#141414]/90 backdrop-blur-md rounded-[23px] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-[16px] shrink-0 ${
              notificationPermission === 'granted' 
                ? 'bg-[rgba(111,247,160,0.1)] text-[#6FF7A0] border border-[rgba(111,247,160,0.2)]' 
                : notificationPermission === 'denied'
                ? 'bg-[rgba(247,111,111,0.1)] text-[#F76F6F] border border-[rgba(247,111,111,0.2)]'
                : 'bg-[rgba(124,111,247,0.1)] text-[#7C6FF7] border border-[rgba(124,111,247,0.2)]'
            }`}>
              {notificationPermission === 'granted' ? (
                <BellRing size={24} className="animate-pulse" />
              ) : notificationPermission === 'denied' ? (
                <BellOff size={24} />
              ) : (
                <Bell size={24} />
              )}
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#F0F0F0] flex items-center gap-1.5">
                {notificationPermission === 'granted' && "Reminders Active & Protected"}
                {notificationPermission === 'denied' && "Notifications Blocked"}
                {notificationPermission === 'default' && "Activate Timely Notifications"}
              </h3>
              <p className="text-[14px] text-[#888888] mt-1 max-w-xl leading-relaxed">
                {notificationPermission === 'granted' 
                  ? "Gentle local nudges will fire standard OS notifications when active anchors map to your current time, helping you protect your daily streak."
                  : notificationPermission === 'denied'
                  ? "We can't fire notifications because they are disabled in your browser. Please clear permissions in your site URL settings bar to enable."
                  : "Allow browser Notification capabilities to receive clean visual alerts at the exact minute your routine checklist triggers."}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
            {notificationPermission === 'default' && (
              <button
                onClick={requestNotificationPermission}
                className="w-full md:w-auto h-[44px] px-5 bg-[rgba(124,111,247,0.15)] hover:bg-[rgba(124,111,247,0.22)] text-[#7C6FF7] border border-[rgba(124,111,247,0.3)] rounded-[12px] font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Access Reminders
              </button>
            )}
            {notificationPermission === 'granted' && (
              <button
                onClick={() => {
                  if (state.anchors.length > 0) {
                    triggerManualReminder(state.anchors[0].id);
                    addToast("Test system nudge fired!", "info");
                  } else {
                    addToast("Add an anchor point first to test notifications", "error");
                  }
                }}
                className="w-full md:w-auto h-[44px] px-5 bg-[rgba(111,247,160,0.12)] hover:bg-[rgba(111,247,160,0.18)] text-[#6FF7A0] border border-[rgba(111,247,160,0.25)] rounded-[12px] font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Trigger Test Nudge (OS)
              </button>
            )}
            {notificationPermission === 'denied' && (
              <div className="text-xs font-bold text-[#F76F6F] border border-[rgba(247,111,111,0.2)] bg-[rgba(247,111,111,0.06)] px-3.5 py-2.5 rounded-[12px] text-center w-full">
                Locked: Check URL settings
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HABIT STREAK TRACKER CARD */}
      <div className="relative p-[1px] rounded-[24px] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.01)] mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="bg-[#141414]/90 backdrop-blur-md rounded-[23px] p-6">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
            
            {/* Left Header Info */}
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-[#F7A06F] to-[#7C6FF7]/30 border border-[rgba(247,160,111,0.2)] flex items-center justify-center font-bold text-3xl shadow-[0_0_20px_rgba(247,160,111,0.2)] relative shrink-0">
                <Flame className="text-[#F7A06F] animate-pulse" size={32} />
                <div className="absolute -top-1.5 -right-1.5 bg-[#7C6FF7] text-[#FFFFFF] text-[10px] px-1.5 py-0.5 rounded-full font-black min-w-[20px] text-center border border-[#0A0A0A]">
                  LV.{state.user.level}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-[#F0F0F0]">Circadian Streak Shield</h3>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[rgba(247,160,111,0.1)] text-[#F7A06F] uppercase tracking-wider">
                    {state.user.streakDays} Day Streak!
                  </span>
                </div>
                <p className="text-[14px] text-[#888888] mt-1 max-w-lg leading-relaxed font-normal">
                  Calculate and lock your daily habits. Hit 100% completion across all timeline Anchor points to safeguard your streak freeze multiplier.
                </p>
              </div>
            </div>

            {/* Middle Progress Meter - Circular SVG Ring */}
            <div className="flex-1 max-w-md w-full flex items-center justify-center gap-6">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <motion.circle 
                    cx="50" cy="50" r="42" 
                    fill="none" 
                    stroke={habitsCompletionPercent === 100 ? "#6FF7A0" : "#7C6FF7"} 
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="263.89" 
                    initial={{ strokeDashoffset: 263.89 }}
                    animate={{ strokeDashoffset: 263.89 - (263.89 * habitsCompletionPercent) / 100 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={habitsCompletionPercent > 0 ? "drop-shadow-[0_0_8px_rgba(124,111,247,0.5)]" : ""}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[20px] font-mono font-bold text-[#F0F0F0] leading-none">{habitsCompletionPercent}%</span>
                </div>
              </div>
              
              <div className="flex flex-col justify-center gap-1.5 flex-1">
                <span className="text-xs font-bold text-[#888888] uppercase tracking-wider">Today's Habits Progress</span>
                <span className="text-sm font-mono font-bold text-[#6FF7A0] mb-1">{doneAnchorsCount} / {totalAnchorsCount} Anchors Completed</span>
                <div className="text-[11px] font-bold text-[#888888] flex items-center gap-1.5">
                  {habitsCompletionPercent === 100 ? (
                    <span className="text-[#6FF7A0] flex items-center gap-1"><Check size={12}/> Complete! Ready to lock streak.</span>
                  ) : (
                    <span>Check off remaining timeline blocks today.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Action Trigger CTA */}
            <div className="shrink-0 flex items-center min-w-[200px]">
              {hasClaimedToday ? (
                <div className="w-full text-center py-3 px-4 rounded-[14px] bg-[rgba(111,247,160,0.06)] border border-[rgba(111,247,160,0.15)] text-xs font-bold text-[#6FF7A0] flex items-center justify-center gap-2 select-none shadow-[0_2px_12px_rgba(111,247,160,0.05)]">
                  <Check size={14} className="stroke-[3]" />
                  Streak Secured Today!
                </div>
              ) : (
                <button
                  onClick={handleClaimStreak}
                  disabled={doneAnchorsCount !== totalAnchorsCount || totalAnchorsCount === 0}
                  className={`w-full h-12 rounded-[14px] font-bold text-xs transition-all flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.97] shadow-lg ${
                    doneAnchorsCount === totalAnchorsCount && totalAnchorsCount > 0
                      ? 'bg-[#7C6FF7] text-[#0A0A0A] cursor-pointer hover:bg-[#6b5ee6] shadow-[0_4px_16px_rgba(124,111,247,0.35)]'
                      : 'bg-[#1E1E1E] hover:bg-[#1E1E1E] border border-[rgba(255,255,255,0.05)] text-zinc-500 cursor-not-allowed hover:scale-100 active:scale-100'
                  }`}
                >
                  <Flame size={14} />
                  Claim Daily Habit XP
                </button>
              )}
            </div>

          </div>

          {/* Last 7 Days Habit Record visualization */}
          <div className="border-t border-[rgba(255,255,255,0.05)] mt-5 pt-4 flex items-center justify-between gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-[#888888] uppercase tracking-widest">Habit Completion History (Last 7 Days)</span>
            <div className="flex items-center gap-2.5 sm:gap-4 font-mono">
              {Array.from({ length: 7 }).map((_, idx) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - idx));
                const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
                const isDayToday = idx === 6;
                
                // Let's mark completion status based on some mock data + actual current day achievement
                let isCompletedForDay = [true, true, false, true, true, false, hasClaimedToday][idx];
                
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 min-w-[36px]">
                    <span className={`text-[10px] font-bold ${isDayToday ? 'text-[#7C6FF7] underline border-b border-[#7C6FF7]/50' : 'text-zinc-500'}`}>
                      {dayLabel}
                    </span>
                    <div 
                      title={isCompletedForDay ? "Habits fully checked off" : "Partially completed / inactive"}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        isCompletedForDay 
                          ? 'bg-[#6FF7A0] text-[#0A0A0A] shadow-[0_0_12px_rgba(111,247,160,0.25)] border border-[#6FF7A0]/40' 
                          : isDayToday && habitsCompletionPercent > 0
                          ? 'bg-[rgba(124,111,247,0.15)] text-[#7C6FF7] border border-[#7C6FF7]/30 border-dashed animate-pulse'
                          : 'bg-[#1E1E1E] text-zinc-650 border border-[rgba(255,255,255,0.04)]'
                      }`}
                    >
                      {isCompletedForDay ? (
                        <Check size={13} strokeWidth={3} />
                      ) : (
                        <span className="text-[10px] font-bold opacity-60">•</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ANCHOR TIMELINE FLOW */}
      <div className="relative p-[1px] rounded-[24px] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.01)] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="bg-[#141414]/90 backdrop-blur-md rounded-[23px] p-6 sm:p-8">
          <div className="relative pl-0 space-y-0">
            <div className="absolute top-6 bottom-6 left-[95px] sm:left-[111px] w-[2px] bg-gradient-to-b from-[#7C6FF7] via-[rgba(111,247,160,0.3)] to-[rgba(255,255,255,0.06)] shadow-[0_0_8px_rgba(124,111,247,0.15)] pointer-events-none"></div>

            <AnimatePresence>
              {state.anchors.map((anchor) => {
                const catTheme = getCategoryTheme(anchor.category);
                const isNoteOpen = expandedNoteId === anchor.id;
                const isEditingThisNote = editingNoteId === anchor.id;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                    key={anchor.id}
                    className="relative z-10 flex min-h-[82px] items-stretch mb-4 last:mb-0"
                  >
                    {/* Left Time Column */}
                    <div className={`w-[80px] sm:w-[100px] pt-5 shrink-0 text-right pr-4 sm:pr-6 ${anchor.status === "done" ? "opacity-50" : ""}`}>
                      <span className="text-[12px] sm:text-[13px] font-bold text-[#F0F0F0] tracking-tight tabular-nums block leading-none">
                        {anchor.time}
                      </span>
                    </div>

                    {/* Progress Circle & Icon */}
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

                      {/* Check, Pulse, or Hollow Core */}
                      <div className="absolute top-[18px] w-6 h-6 rounded-full bg-[#141414] z-10 flex items-center justify-center border border-[rgba(255,255,255,0.06)]">
                        {anchor.status === "done" ? (
                          <Check
                            size={11}
                            strokeWidth={4}
                            className="text-[#6FF7A0] drop-shadow-[0_0_4px_rgba(111,247,160,0.8)]"
                          />
                        ) : anchor.status === "active" ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#6FBBF7] shadow-[0_0_8px_#6FBBF7] animate-pulse" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-[rgba(255,255,255,0.25)]" />
                        )}
                      </div>
                    </div>

                    {/* Right: Glassy Card Content */}
                    <div className={`flex-1 pl-10 py-1 transition-opacity duration-300 ${anchor.status === "done" ? "opacity-[0.62]" : ""}`}>
                      {/* Double-layer premium card layout */}
                      <div className={`relative p-[1px] rounded-[20px] bg-gradient-to-br transition-all duration-300 ${
                        anchor.status === 'active'
                          ? "from-[#7C6FF7]/60 via-[rgba(111,187,247,0.3)] to-transparent shadow-[0_4px_24px_rgba(124,111,247,0.15)]"
                          : "from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.02)]"
                      }`}>
                        <div className={`w-full bg-[#141414]/95 backdrop-blur-md rounded-[19px] p-5 group/card transition-all duration-300 ${
                          anchor.status === "active" ? "bg-[#1C1A2E]/95" : "hover:bg-[#1C1C1C]"
                        }`}>
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <p className={`text-[17px] font-bold ${
                                  anchor.status === "upcoming" 
                                    ? "text-[#F0F0F0]" 
                                    : anchor.status === "done" 
                                    ? "text-[#888888] line-through" 
                                    : "text-[#7C6FF7]"
                                }`}>
                                  {anchor.title}
                                </p>

                                {/* Dynamic Category Badge */}
                                <span 
                                  style={{ backgroundColor: catTheme.bg, color: catTheme.color, borderColor: catTheme.border }}
                                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border flex items-center gap-1 shrink-0"
                                >
                                  <Tag size={10} />
                                  {anchor.category || 'General'}
                                </span>
                              </div>

                              {anchor.subtitle && (
                                <p className="text-[13px] text-[#888888] font-medium mt-1">
                                  {anchor.subtitle}
                                </p>
                              )}

                              {/* Action Row */}
                              <div className="flex items-center gap-4 mt-4">
                                <span className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wide border ${
                                  anchor.status === "done" 
                                    ? "bg-[rgba(111,247,160,0.08)] text-[#6FF7A0] border-[rgba(111,247,160,0.2)]" 
                                    : anchor.status === "active" 
                                    ? "bg-[rgba(111,187,247,0.12)] text-[#6FBBF7] border-[rgba(111,187,247,0.25)] animate-pulse" 
                                    : "bg-[#1E1E1E] text-[#888888] border-[rgba(255,255,255,0.04)]"
                                }`}>
                                  {anchor.status === "done"
                                    ? "Done"
                                    : anchor.status === "active"
                                      ? "Active In-Progress"
                                      : anchor.type}
                                </span>

                                {anchor.xp > 0 && (
                                  <span className="text-[12px] font-bold text-[#F7D96F] tabular-nums">
                                    +{anchor.xp} XP
                                  </span>
                                )}

                                {/* Collapsible Notes Trigger Button */}
                                <button
                                  onClick={() => handleToggleNote(anchor.id)}
                                  className={`flex items-center gap-1.5 text-xs font-bold transition-all p-1 px-2 rounded-md ${
                                    isNoteOpen 
                                      ? 'bg-[rgba(124,111,247,0.15)] text-[#7C6FF7]' 
                                      : anchor.note
                                      ? 'bg-[rgba(255,255,255,0.05)] text-[#6FBBF7] hover:bg-[rgba(255,255,255,0.08)]'
                                      : 'text-[#888888] hover:text-[#F0F0F0] hover:bg-[rgba(255,255,255,0.03)]'
                                  }`}
                                >
                                  <StickyNote size={13} />
                                  <span>{anchor.note ? "Journal Note" : "Attach Note"}</span>
                                  {isNoteOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </button>
                              </div>
                            </div>

                            {/* Card control right col */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDelete(anchor.id)}
                                className="opacity-0 group-hover/card:opacity-100 p-2 text-[#888888] hover:text-[#F76F6F] hover:bg-[rgba(247,111,111,0.1)] rounded-lg transition-all"
                                title="Delete Anchor"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Collapsible Panel with Note */}
                          <AnimatePresence>
                            {isNoteOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]"
                              >
                                {isEditingThisNote ? (
                                  <div className="flex flex-col gap-3">
                                    <textarea
                                      rows={3}
                                      value={tempNoteText}
                                      onChange={(e) => setTempNoteText(e.target.value)}
                                      placeholder="Write ideas, homework lists, reminders or a brief logs entry about this hour..."
                                      className="w-full bg-[#1A1A1A] text-[#F0F0F0] text-[15px] p-3 rounded-[12px] border border-[rgba(255,255,255,0.1)] outline-none focus:border-[#7C6FF7]/50 resize-none leading-relaxed font-sans"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => setEditingNoteId(null)}
                                        className="h-[36px] px-4 bg-transparent border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.03)] text-[#888888] hover:text-[#F0F0F0] rounded-[8px] text-xs font-bold transition-all"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleUpdateNote(anchor.id)}
                                        className="h-[36px] px-4 bg-[#7C6FF7] hover:bg-[#6b5ee6] text-[#0A0A0A] rounded-[8px] text-xs font-bold transition-all flex items-center gap-1.5"
                                      >
                                        <Save size={13} />
                                        Save Note
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-3">
                                    {anchor.note ? (
                                      <div className="bg-[#1A1A1A]/80 p-3.5 rounded-[12px] border border-[rgba(255,255,255,0.03)]">
                                        <p className="text-[14px] text-[#E0E0E0] whitespace-pre-line leading-relaxed font-sans">
                                          {anchor.note}
                                        </p>
                                      </div>
                                    ) : (
                                      <p className="text-xs font-semibold text-[#888888] italic">
                                        No notes attached to this anchor yet. Add ideas or checklists below.
                                      </p>
                                    )}

                                    <div className="flex justify-end">
                                      <button
                                        onClick={() => startEditingNote(anchor.id, anchor.note)}
                                        className="h-[32px] px-3.5 bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-[#888888] hover:text-[#F0F0F0] border border-[rgba(255,255,255,0.06)] rounded-[8px] text-xs font-bold transition-all flex items-center gap-1.5"
                                      >
                                        <FileText size={12} />
                                        {anchor.note ? "Edit Entry" : "Write First Note"}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* CREATE NEW ANCHOR POINT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Anchor Point"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#888888] uppercase tracking-wider">
              Trigger Time
            </label>
            <div className="h-[52px] bg-[#1E1E1E] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 flex items-center relative focus-within:border-[rgba(255,255,255,0.2)]">
              <Clock size={18} className="text-[#888888] mr-3" />
              <input
                type="text"
                value={newAnchor.time}
                onChange={(e) =>
                  setNewAnchor({ ...newAnchor, time: e.target.value })
                }
                placeholder="e.g. 7:15 AM or 10:30 PM"
                className="w-full h-full bg-transparent outline-none text-[#F0F0F0] font-medium text-[16px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#888888] uppercase tracking-wider">
              Title / Activity Name
            </label>
            <div className="h-[52px] bg-[#1E1E1E] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 flex items-center focus-within:border-[rgba(255,255,255,0.2)]">
              <input
                type="text"
                value={newAnchor.title}
                onChange={(e) =>
                  setNewAnchor({ ...newAnchor, title: e.target.value })
                }
                placeholder="e.g. Creative Session, Gymnasium, Study"
                className="w-full h-full bg-transparent outline-none text-[#F0F0F0] font-medium text-[16px]"
              />
            </div>
          </div>

          {/* COLOR CODED HIERARCHY SELECTOR */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#888888] uppercase tracking-wider">
              Habit Category Tag
            </label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setNewAnchor({ ...newAnchor, category: cat.name })}
                  style={{
                    backgroundColor: newAnchor.category === cat.name ? cat.bg : '#1E1E1E',
                    borderColor: newAnchor.category === cat.name ? cat.color : 'rgba(255,255,255,0.04)',
                    color: newAnchor.category === cat.name ? cat.color : '#888888'
                  }}
                  className="h-[40px] rounded-[10px] text-[11px] font-bold transition-all border flex flex-col items-center justify-center hover:scale-[1.03] active:scale-[0.97]"
                >
                  <span className="truncate max-w-full px-1">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#888888] uppercase tracking-wider">
              Initial Note / Goal Checklist (Optional)
            </label>
            <textarea
              rows={2}
              value={newAnchor.note}
              onChange={(e) => setNewAnchor({ ...newAnchor, note: e.target.value })}
              placeholder="e.g. Read 15 pages / review next steps / pack hydration bag."
              className="w-full bg-[#1E1E1E] text-[#F0F0F0] text-[15px] p-3 rounded-[12px] border border-[rgba(255,255,255,0.08)] outline-none focus:border-[rgba(255,255,255,0.2)] resize-none font-sans"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-[#888888] uppercase tracking-wider">
              Anchor Type
            </label>
            <div className="flex gap-2">
              {["fixed", "buffer", "recurring"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNewAnchor({ ...newAnchor, type })}
                  className={`flex-1 h-[44px] rounded-[10px] text-[13px] font-bold capitalize transition-colors border ${
                    newAnchor.type === type
                      ? "bg-[rgba(124,111,247,0.15)] text-[#7C6FF7] border-[#7C6FF7]"
                      : "bg-[#1E1E1E] text-[#888888] border-[rgba(255,255,255,0.04)] hover:bg-[#252525]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddAnchor}
            className="h-[52px] w-full bg-[#7C6FF7] hover:bg-[#6b5ee6] text-[#0A0A0A] rounded-[12px] font-bold text-[16px] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_20px_rgba(124,111,247,0.3)] mt-2"
          >
            Create Routine Event
          </button>
        </div>
      </Modal>
    </div>
  );
}
