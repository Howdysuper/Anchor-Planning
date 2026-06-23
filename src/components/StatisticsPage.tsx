import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'motion/react';
import { 
  Activity, 
  BarChart3, 
  TrendingUp, 
  Moon, 
  Award, 
  CheckCircle, 
  Zap, 
  Brain, 
  Info, 
  Sparkles, 
  RefreshCw,
  Flame,
  TrendingDown,
  Edit2,
  Sliders,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Line
} from 'recharts';

export default function StatisticsPage() {
  const { state, updateSleep } = useApp();
  const { addToast } = useToast();
  
  // We have 2 sub-tabs: 'overview' (the multi-metric analytics) and 'calibration' (all Sleep Intel inputs, battery and schedule controls)
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'calibration'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    wake: state.sleep.wakeTime || '6:00 AM',
    bed: state.sleep.bedtime || '10:00 PM',
  });

  // --- PARSE & PREPARE DYNAMIC METRICS ---
  
  // 1. Quests / Tasks Done Metrics
  const questsTotal = state.quests.length;
  const questsCompleted = state.quests.filter(q => q.done).length;
  const questsPending = questsTotal - questsCompleted;
  const questCompletionRate = questsTotal > 0 ? Math.round((questsCompleted / questsTotal) * 100) : 0;
  
  // Calculate XP gained from quests completed this week
  const xpEarnedThisWeek = useMemo(() => {
    return state.quests
      .filter(q => q.done)
      .reduce((acc, curr) => acc + (curr.xp || 15), 0);
  }, [state.quests]);

  // 2. Sleep Analytics
  const currentSleepScore = state.sleep.score !== undefined ? state.sleep.score : 85;
  const currentDebtHours = state.sleep.debtHours || 0;
  const sleepDebtText = currentDebtHours > 0 
    ? `${currentDebtHours} hrs sleep debt` 
    : currentDebtHours < 0 
      ? `${Math.abs(currentDebtHours)} hrs surplus` 
      : 'Optimal balance';

  // Average Sleep Score
  const averageSleepScore = useMemo(() => {
    const history = state.sleep.history || [];
    if (history.length === 0) return currentSleepScore;
    const sum = history.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / history.length);
  }, [state.sleep.history, currentSleepScore]);

  // Sleep consistency calculation based on variance
  const sleepConsistencyIndex = useMemo(() => {
    const history = state.sleep.history || [];
    if (history.length <= 1) return 92; // Default high consistency
    const avg = history.reduce((acc, v) => acc + v, 0) / history.length;
    const sqDiffs = history.map(v => Math.pow(v - avg, 2));
    const variance = sqDiffs.reduce((acc, v) => acc + v, 0) / history.length;
    const stdDev = Math.sqrt(variance);
    const score = Math.max(50, Math.min(100, Math.round(100 - (stdDev * 2.2))));
    return score;
  }, [state.sleep.history]);

  // 3. Anchors consistency / rhythm index
  const anchorOverview = useMemo(() => {
    const anchors = state.anchors || [];
    const total = anchors.length;
    const completed = anchors.filter(a => a.status === 'done').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    let morningCount = 0;
    let afternoonCount = 0;
    let eveningCount = 0;
    let completedMorning = 0;
    let completedAfternoon = 0;
    let completedEvening = 0;

    anchors.forEach(a => {
      const timeStr = a.time || '';
      const isPm = timeStr.toLowerCase().includes('pm');
      const hourMatch = timeStr.match(/(\d+)/);
      let hourVal = hourMatch ? parseInt(hourMatch[1], 10) : 8;
      if (isPm && hourVal !== 12) hourVal += 12;
      if (!isPm && hourVal === 12) hourVal = 0;

      if (hourVal < 12) {
        morningCount++;
        if (a.status === 'done') completedMorning++;
      } else if (hourVal < 18) {
        afternoonCount++;
        if (a.status === 'done') completedAfternoon++;
      } else {
        eveningCount++;
        if (a.status === 'done') completedEvening++;
      }
    });

    return {
      total,
      completed,
      completionRate,
      morning: { total: morningCount, completed: completedMorning },
      afternoon: { total: afternoonCount, completed: completedAfternoon },
      evening: { total: eveningCount, completed: completedEvening }
    };
  }, [state.anchors]);

  // 4. Cognitive load analysis (Brain Dumps pending vs total anchors completed)
  const cognitiveDebtIndex = useMemo(() => {
    const totalDumps = state.brainDumps.length;
    if (totalDumps === 0) return 10; // Excellent clarity
    const unresolvedRatio = totalDumps / (Math.max(1, questsCompleted + anchorOverview.completed));
    const rawScore = Math.min(100, Math.round(unresolvedRatio * 35));
    return Math.max(15, rawScore); // Minimum score of 15%
  }, [state.brainDumps, questsCompleted, anchorOverview.completed]);

  const cognitiveClarityText = useMemo(() => {
    if (cognitiveDebtIndex < 30) return 'High Clarity (Mind Swept)';
    if (cognitiveDebtIndex < 60) return 'Moderate Baggage (Action Recommended)';
    return 'Cognitive Overload (Needs Brain Dump/Completion)';
  }, [cognitiveDebtIndex]);

  // AI Recommendation Engine (from original SleepIntel)
  const getAIRecommendation = () => {
    let message = `Based on your ${state.anchors.length} scheduled anchors and a sleep score of ${state.sleep.score}%, we recommend starting your routine at `;
    
    const bedtimeStr = state.sleep?.bedtime || "10:00 PM";
    const match = bedtimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return { text: "Based on your schedule, maintain your current wind-down.", time: bedtimeStr, explanation: " to keep aligned." };

    let hours = parseInt(match[1], 10);
    let mins = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();

    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    const deficitChunks = Math.max(0, Math.round((100 - state.sleep.score) / 10));
    let offsetMins = -(deficitChunks * 20);

    let explanation = "";
    if (offsetMins === 0) {
      explanation = " to maintain your strong sleep metrics!";
    } else {
      explanation = ` (${Math.abs(offsetMins)} mins early) to recover your sleep battery and maximize tomorrow's focus.`;
    }

    let newTotalMins = (hours * 60) + mins + offsetMins;
    if (newTotalMins < 0) newTotalMins += 24 * 60;
    
    let newHours = Math.floor(newTotalMins / 60) % 24;
    let newMins = newTotalMins % 60;

    const newAmpm = newHours >= 12 ? "PM" : "AM";
    if (newHours > 12) newHours -= 12;
    if (newHours === 0) newHours = 12;

    const timeStr = `${newHours}:${newMins.toString().padStart(2, '0')} ${newAmpm}`;
    return { text: message, time: timeStr, explanation };
  };

  const aiRec = getAIRecommendation();

  // 5. Weekly Trajectory Data (Sleep score, Quests Completed, Anchors Completed)
  const hasHistoryData = useMemo(() => {
    const hasHistory = state.sleep.history && state.sleep.history.length > 0;
    const hasQuests = state.quests.some(q => q.done);
    const hasAnchors = state.anchors.some(a => a.status === 'done');
    return hasHistory || hasQuests || hasAnchors;
  }, [state.sleep.history, state.quests, state.anchors]);

  const trajectoryChartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];
    
    const questsByDate = state.quests.reduce((acc, q) => {
      if (q.done && q.completedAtDate) {
        acc[q.completedAtDate] = (acc[q.completedAtDate] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const sleepHistory = state.sleep.history || [];

    // Rolling 7 days backwards (from i = 6 down to 0)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayName = days[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];

      // Sleep Score calculation - Defaults to 100% (or current sleep score), overrides with actual history if logged
      let sleepScore = state.sleep.score !== undefined ? state.sleep.score : 100;
      if (sleepHistory[d.getDay()] !== undefined) {
        sleepScore = sleepHistory[d.getDay()];
      } else if (sleepHistory[6 - i] !== undefined) {
        sleepScore = sleepHistory[6 - i];
      }

      // Tasks done - Strictly actual history
      let questsDone = questsByDate[dateStr] || 0;
      if (i === 0) {
        const realDoneToday = state.quests.filter(q => q.done && (!q.completedAtDate || q.completedAtDate === dateStr)).length;
        questsDone = Math.max(realDoneToday, questsDone);
      }

      // Anchors Kept - Strictly actual history
      let anchorsDone = 0;
      if (i === 0) {
        anchorsDone = state.anchors.filter(a => a.status === 'done').length;
      }

      // Energy Velocity - Strictly calculated from actual metrics
      const energyVelocity = (sleepScore > 0 || anchorsDone > 0 || questsDone > 0)
        ? Math.round((sleepScore * 0.4) + (anchorsDone * 10) + (questsDone * 15))
        : 0;

      data.push({
        day: i === 0 ? 'Today' : dayName,
        'Sleep Score': sleepScore,
        'Tasks Done': questsDone,
        'Anchors Kept': anchorsDone,
        'Energy Velocity': energyVelocity,
        date: dateStr
      });
    }

    return data;
  }, [state.sleep.history, state.sleep.score, state.quests, state.anchors]);

  // Combined dataset for Sleep intel 7-day habits graph matching original SleepIntel
  const sleepIntelChartData = useMemo(() => {
    const history = state.sleep.history || [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((dayName, i) => {
      const score = history[i] !== undefined ? history[i] : (state.sleep.score !== undefined ? state.sleep.score : 100);
      const habitCompletion = score >= 80 ? 95 : score >= 70 ? 82 : score >= 60 ? 68 : 0;
      return {
        name: dayName,
        Score: score,
        Habits: habitCompletion,
      };
    });
  }, [state.sleep.history, state.sleep.score]);

  // Circular progress helper
  const strokeDashoffset = (score: number) => {
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    return circumference * (1 - score / 100);
  };

  const handleSaveSchedule = () => {
    updateSleep({ wakeTime: editData.wake, bedtime: editData.bed });
    addToast("Circadian sleep schedule updated!", "success");
    setIsEditModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300 pb-24">
      
      {/* 1. HEADER SECTION */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[rgba(255,255,255,0.06)] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#7C6FF7] font-semibold text-[14px] uppercase tracking-wider mb-1">
            <Activity size={16} />
            <span>Circadian Intelligence System</span>
          </div>
          <h2 className="text-[32px] font-bold tracking-tight text-[#F0F0F0]">Rhythm &amp; Statistics</h2>
          <p className="text-[#888888] text-[15px] mt-1">
            Track, configure, and visualize the symbiosis of your sleep hygiene, task execution, and energy routine.
          </p>
        </div>

        {/* Tab Switcher for Unified Views */}
        <div className="flex items-center gap-2 bg-[#141414] border border-[rgba(255,255,255,0.06)] p-1 rounded-[14px]">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-[10px] transition-all ${
              activeSubTab === 'overview' 
                ? 'bg-[#7C6FF7] text-[#0A0A0A] shadow-[0_4px_12px_rgba(124,111,247,0.3)]' 
                : 'text-[#888888] hover:text-[#F0F0F0]'
            }`}
          >
            <BarChart3 size={14} />
            <span>Circadian Overview</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('calibration')}
            className={`flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-[10px] transition-all ${
              activeSubTab === 'calibration' 
                ? 'bg-[#7C6FF7] text-[#0A0A0A] shadow-[0_4px_12px_rgba(124,111,247,0.3)]' 
                : 'text-[#888888] hover:text-[#F0F0F0]'
            }`}
          >
            <Moon size={14} />
            <span>Sleep Calibration</span>
          </button>
        </div>
      </header>

      {/* CONDITIONAL RENDER: SUB-TAB 1: RHYTHMIC OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          
          {/* AI SMART SUMMARY/INSIGHT Banner */}
          <div className="bg-gradient-to-r from-[#17132B] via-[#101017] to-[#141414] border border-[rgba(124,111,247,0.18)] rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_12px_36px_rgba(124,111,247,0.05)]">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-[#7C6FF7]/20 flex items-center justify-center border border-[rgba(124,111,247,0.3)] text-[#7C6FF7] shrink-0">
                <Sparkles size={24} className="animate-pulse" />
              </div>
              <div>
                <span className="text-xs text-[#7C6FF7] font-semibold bg-[#7C6FF7]/10 border border-[#7C6FF7]/20 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                  AI Insight
                </span>
                <p className="text-[15px] text-[#E0E0E0] font-medium mt-1.5 leading-relaxed">
                  {currentSleepScore === 0
                    ? `CRITICAL EXHAUSTION: Your sleep battery is at 0%. You desperately need sleep! Sleep deprivation compromises your immune system, memory retention, and cognitive performance. Halt all quests, disable non-essential alerts, and prioritize absolute recovery immediately.`
                    : currentSleepScore < 40
                    ? `DANGER ZONE: Your sleep battery is critically low (${currentSleepScore}%). You desperately need sleep! Your capacity for focus is severely limited, raising the risk of errors. Skip optional checklists and get to bed as soon as possible.`
                    : currentSleepScore < 60
                    ? `LOW BATTERY: Your current rhythm score of ${currentSleepScore}% is insufficient. Shift your evening phone-down anchor earlier to reduce sleep debt and rebuild your neural bandwidth.`
                    : currentSleepScore < 75
                    ? `MODERATE DEBT: Your sleep score is lower than average (${currentSleepScore}%). Consider shifting evening anchors earlier by 30 mins to diminish your circadian lag and regain balance.`
                    : questsCompleted > 0 && currentSleepScore >= 80 
                    ? `Legendary sync! Your sleep score of ${currentSleepScore}% aligns with your ${questsCompleted} completed quests today. Consistent bedtime anchoring is maintaining peak cognitive productivity.`
                    : `Elevate productivity by checking off more quests. Your energetic reservoir (Sleep: ${currentSleepScore}%) is fully primed for high-focus deep work.`}
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-[#0F0F14] border border-[rgba(255,255,255,0.05)] text-xs text-[#888888] font-mono rounded-[12px]">
              <RefreshCw size={12} className="animate-spin-slow text-[#7C6FF7]" />
              <span>REAL-TIME ANALYSIS SYNCED</span>
            </div>
          </div>

          {/* THREE CENTRAL STATISTICAL BENTO TILES */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* STAT 1: Sleep Health Core */}
            <div className="bg-[#141414] border border-[rgba(255,255,255,0.06)] rounded-[24px] p-6 flex flex-col gap-6 relative overflow-hidden group hover:border-[rgba(124,111,247,0.3)] transition-all">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#888888] uppercase tracking-wider">Sleep Battery Status</span>
                  <span className="text-[28px] font-extrabold text-[#F0F0F0] mt-1 tracking-tight">{currentSleepScore}%</span>
                </div>
                <div className="w-10 h-10 rounded-[12px] bg-[rgba(124,111,247,0.08)] flex items-center justify-center text-[#7C6FF7]">
                  <Moon size={20} />
                </div>
              </div>

              {/* Radial Gauge */}
              <div className="flex items-center justify-center py-2 h-[130px] relative">
                <svg className="w-[130px] h-[130px] transform -rotate-90">
                  <circle
                    cx="65"
                    cy="65"
                    r="58"
                    stroke="rgba(255, 255, 255, 0.03)"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="65"
                    cy="65"
                    r="58"
                    stroke="#7C6FF7"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 58}
                    strokeDashoffset={strokeDashoffset(currentSleepScore)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: "drop-shadow(0 0 6px rgba(124, 111, 247, 0.4))" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-[26px] font-black font-mono tracking-tighter text-[#7C6FF7]">{currentSleepScore}</span>
                  <span className="text-[9px] font-extrabold text-[#888888] uppercase tracking-widest leading-none">RHYTHM</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-auto border-t border-[rgba(255,255,255,0.05)] pt-4">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#888888]">Baseline Habit:</span>
                  <span className="text-[#F0F0F0] font-bold">{state.sleep.bedtime} - {state.sleep.wakeTime}</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#888888]">Debt Calculation:</span>
                  <span className={`font-bold flex items-center gap-1 ${currentDebtHours <= 0 ? 'text-[#6FF7A0]' : 'text-[#F76F6F]'}`}>
                    {currentDebtHours <= 0 ? <Zap size={10} /> : <TrendingDown size={10} />}
                    {sleepDebtText}
                  </span>
                </div>
              </div>
            </div>

            {/* STAT 2: User XP Level Progression */}
            <div className="bg-[#141414] border border-[rgba(255,255,255,0.06)] rounded-[24px] p-6 flex flex-col gap-6 relative overflow-hidden group hover:border-[rgba(124,111,247,0.3)] transition-all">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#888888] uppercase tracking-wider">XP This Week</span>
                  <span className="text-[28px] font-extrabold text-[#7C6FF7] mt-1 tracking-tight font-mono">+{xpEarnedThisWeek} XP</span>
                </div>
                <div className="w-10 h-10 rounded-[12px] bg-[#7C6FF7]/10 flex items-center justify-center text-[#7C6FF7]">
                  <Award size={20} />
                </div>
              </div>

              {/* Level Progress Visual */}
              <div className="flex flex-col gap-3 py-3">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[11px] font-black uppercase text-[#888888] tracking-wider whitespace-nowrap">Progression</span>
                  <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <span className="text-[13.5px] font-extrabold text-[#7C6FF7]">LV {state.user.level}</span>
                    <span className="text-[#888888] text-[9px] font-bold">→</span>
                    <span className="text-[13.5px] font-extrabold text-[#888888]">LV {state.user.level + 1}</span>
                  </div>
                </div>

                <div className="w-full h-4 bg-[#1A1A1A] rounded-full p-1 border border-[rgba(255,255,255,0.03)] flex items-center shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-[#7C6FF7] to-[#B36FF7] rounded-full relative shadow-[0_0_8px_rgba(124,111,247,0.5)] transition-all duration-1000"
                    style={{ width: `${Math.max(8, Math.min(100, (state.user.xp / state.user.xpToNextLevel) * 100))}%` }}
                  >
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white animate-ping"></div>
                  </div>
                </div>

                <p className="text-[10px] text-[#888888] font-mono leading-tight tracking-tight mt-1">
                  Active Quest Completion multipliers applied. Remaining XP for Next Level: <span className="text-white font-bold">{state.user.xpToNextLevel - state.user.xp}</span>
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-auto border-t border-[rgba(255,255,255,0.05)] pt-4">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#888888]">Total Streaks:</span>
                  <span className="text-[#F0F0F0] font-bold flex items-center gap-1.5 text-[#EE9C1B]">
                    <Flame size={13} fill="#EE9C1B" />
                    {state.user.streakDays} Day Streak
                  </span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#888888]">Circadian multiplier:</span>
                  <span className="text-[#7C6FF7] font-bold">1.2x Active</span>
                </div>
              </div>
            </div>

            {/* STAT 3: Quest Mastery (Tasks Completed) */}
            <div className="bg-[#141414] border border-[rgba(255,255,255,0.06)] rounded-[24px] p-6 flex flex-col gap-6 relative overflow-hidden group hover:border-[rgba(124,111,247,0.3)] transition-all">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#888888] uppercase tracking-wider">Quest Mastery</span>
                  <span className="text-[28px] font-extrabold text-[#6FF7A0] mt-1 tracking-tight">{questsCompleted} / {questsTotal}</span>
                </div>
                <div className="w-10 h-10 rounded-[12px] bg-[rgba(111,247,160,0.08)] flex items-center justify-center text-[#6FF7A0]">
                  <CheckCircle size={20} />
                </div>
              </div>

              {/* Productivity Stats */}
              <div className="grid grid-cols-2 gap-3 py-1">
                <div className="bg-[#1A1A1A] p-2.5 rounded-[12px] border border-[rgba(255,255,255,0.03)] flex flex-col items-center text-center">
                  <span className="text-[10px] font-black uppercase text-[#888888] tracking-widest">Rate</span>
                  <span className="text-[18px] font-black text-[#6FF7A0] mt-1 font-mono">{questCompletionRate}%</span>
                </div>
                <div className="bg-[#1A1A1A] p-2.5 rounded-[12px] border border-[rgba(255,255,255,0.03)] flex flex-col items-center text-center">
                  <span className="text-[10px] font-black uppercase text-[#888888] tracking-widest">Remaining</span>
                  <span className="text-[18px] font-black text-[#EE3E54] mt-1 font-mono">{questsPending}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-auto border-t border-[rgba(255,255,255,0.05)] pt-4">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#888888]">Loadout Gears Equipped:</span>
                  <span className="text-[#F0F0F0] font-bold">{(state.loadout?.items || []).length} Gears</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#888888]">Efficiency Rating:</span>
                  <span className="text-[#6FF7A0] font-bold">
                    {questsTotal > 0 ? (questCompletionRate >= 80 ? 'Grade-A' : questCompletionRate >= 50 ? 'Grade-B' : 'Optimal') : 'Incomplete'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 4. WEEKLY TRAJECTORY GRAPH - WITH SECURE INACTIVE FALLBACK */}
          <section className="bg-[#141414] border border-[rgba(255,255,255,0.06)] rounded-[24px] p-6 flex flex-col gap-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-[18px] font-bold text-[#F0F0F0] flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#7C6FF7]" />
                  <span> Rhythmic Weekly Trajectory</span>
                </h3>
                <p className="text-[13px] text-[#888888] mt-1">
                  Correlating daily sleep quality variables (teal) with habit &amp; routine updates (purple).
                </p>
              </div>

              {hasHistoryData && (
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-[#7C6FF7] rounded-full"></div>
                    <span className="text-[#888888]">Tasks Done</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-[#00F5D4] rounded-full"></div>
                    <span className="text-[#888888]">Sleep Score</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-[#9F2BFF] rounded-full"></div>
                    <span className="text-[#888888]">Energy Velocity</span>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic visual fallback or interactive chart */}
            {!hasHistoryData ? (
              <div className="w-full h-[320px] bg-[#101010] rounded-[18px] border border-dashed border-[rgba(255,255,255,0.06)] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-[rgba(124,111,247,0.05)] to-transparent opacity-60" />
                <div className="w-14 h-14 rounded-full bg-[#1A1A24] flex items-center justify-center mb-4 text-[#7C6FF7] border border-[rgba(124,111,247,0.15)] relative z-10">
                  <Calendar size={24} />
                </div>
                <h4 className="text-[18px] font-bold text-[#F0F0F0] mb-1.5 relative z-10">No Circadian Checks Recorded Yet</h4>
                <p className="text-xs text-[#888888] max-w-[420px] leading-relaxed mb-6 relative z-10">
                  Daily Sleep &amp; Habit metrics chart automatically as data points are registered! Trigger a daily wake-up check-in via the Immersion dashboard, or adjust your schedules to calibrate your scores.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                  <button 
                    onClick={() => setActiveSubTab('calibration')}
                    className="px-5 py-2.5 bg-[#7C6FF7] text-[#0A0A0A] rounded-[12px] hover:bg-[#6b5ee6] font-bold text-xs shadow-md transition-colors"
                  >
                    Calibrate Sleep Schedule
                  </button>
                  <button 
                    onClick={() => addToast("First telemetry marker created!", "info")}
                    className="px-5 py-2.5 bg-[#1E1E1E] text-[#888888] rounded-[12px] hover:text-[#f0f0f0] border border-[rgba(255,255,255,0.05)] font-bold text-xs transition-colors"
                  >
                    Simulate Daily Check-in
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-[320px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trajectoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00F5D4" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00F5D4" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C6FF7" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#7C6FF7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#666666" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="#00F5D4" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      domain={[40, 100]}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#7C6FF7" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      domain={[0, 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1E1E1E', 
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        fontSize: '13px',
                        color: '#F0F0F0'
                      }}
                    />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="Sleep Score" 
                      stroke="#00F5D4" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorSleep)" 
                    />
                    <Area 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="Tasks Done" 
                      stroke="#7C6FF7" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorTasks)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* 5. ANCHOR POINT RHYTHM BREAKDOWN */}
          <section className="w-full">
            
            {/* Anchor point rhythm breakdown */}
            <div className="bg-[#141414] border border-[rgba(255,255,255,0.06)] rounded-[24px] p-6 flex flex-col gap-6 hover:border-[rgba(255,255,255,0.1)] transition-all">
              <div>
                <h3 className="text-[18px] font-bold text-[#F0F0F0] flex items-center gap-2">
                  <Zap size={18} className="text-[#7C6FF7]" />
                  <span>Anchor Habits Rhythm Index</span>
                </h3>
                <p className="text-[13px] text-[#888888] mt-1">
                  Detailed review of active anchor habits and current completion status.
                </p>
              </div>

              <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-1">
                {state.anchors.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-10">
                    <span className="text-[14px] text-[#888888]">No scheduled anchor point habits found.</span>
                    <span className="text-xs text-[#666] mt-2">Go to "Anchor Points" to establish your baseline schedule!</span>
                  </div>
                ) : (
                  state.anchors.map((anchor) => (
                    <div
                      key={anchor.id}
                      className="flex items-center justify-between p-3.5 rounded-[16px] bg-[#1A1A1A] border border-[rgba(255,255,255,0.03)] hover:border-[rgba(124,111,247,0.2)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          anchor.status === 'done' 
                            ? 'bg-[#6FF7A0]/10 text-[#6FF7A0] border border-[#6FF7A0]/20' 
                            : 'bg-[#ee9c1b]/10 text-[#ee9c1b] border border-[#ee9c1b]/20Off'
                        }`}>
                          {anchor.status === 'done' ? '✓' : '•'}
                        </div>
                        <div>
                          <span className="text-[14px] font-bold text-[#F0F0F0] block leading-tight">{anchor.title}</span>
                          <span className="text-[11px] text-[#888888] block mt-0.5 font-mono">{anchor.time} | {anchor.category || 'Mindset'}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className={`text-[12px] font-bold ${anchor.status === 'done' ? 'text-[#6FF7A0]' : 'text-[#EE9C1B]'}`}>
                          {anchor.status === 'done' ? 'SYNCED' : 'PENDING'}
                        </span>
                        <span className="text-[10px] text-[#888888] font-mono mt-0.5 block">Consistency: 92%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="bg-[#1A1A1A]/80 border border-[rgba(255,255,255,0.04)] rounded-[16px] p-4 flex justify-between items-center text-xs font-mono">
                <span className="text-[#888888]">OVERALL COMPLETION RATE:</span>
                <span className="text-[#7C6FF7] font-black">{anchorOverview.completionRate}%</span>
              </div>
            </div>

          </section>

        </div>
      )}

      {/* CONDITIONAL RENDER: SUB-TAB 2: SLEEP CALIBRATION & BATTERY */}
      {activeSubTab === 'calibration' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
          
          {/* Sleep Battery Panel */}
          <div className="bg-[#141414] rounded-[24px] p-8 border border-[rgba(255,255,255,0.06)] flex flex-col items-center justify-center text-center h-full">
            <h2 className="text-[13px] font-bold text-[#888888] uppercase tracking-widest mb-6">
              Current Sleep Battery Charge
            </h2>

            <div className="relative w-[260px] h-[260px] flex items-center justify-center mb-8">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#1E1E1E"
                  strokeWidth="4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#7C6FF7"
                  strokeWidth="4"
                  strokeDasharray="282.7"
                  strokeDashoffset={282.7 * (1 - state.sleep.score / 100)}
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_16px_rgba(124,111,247,0.5)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[64px] font-bold tabular-nums leading-none mb-1 text-white">
                  {state.sleep.score}
                  <span className="text-2xl text-[#888888]">%</span>
                </span>
                <span className="text-[12px] font-bold text-[#7C6FF7] uppercase tracking-widest bg-[rgba(124,111,247,0.1)] px-3.5 py-1.5 rounded-full">
                  Target Calibrated
                </span>
              </div>
            </div>

            <div
              className={`p-4 rounded-[16px] w-full flex items-center justify-between border ${state.sleep.debtHours < 0 ? "bg-[#1E1111] border-[rgba(247,111,111,0.2)]" : "bg-[#111e14] border-[rgba(111,247,160,0.2)]"}`}
            >
              <span className="text-[14px] font-medium text-[#888888]">
                Accumulated Sleep Debt
              </span>
              <span
                className={`text-[16px] font-bold ${state.sleep.debtHours < 0 ? "text-[#F76F6F]" : "text-[#6FF7A0]"}`}
              >
                {state.sleep.debtHours} hrs this week
              </span>
            </div>

            {/* Tracking Methodology */}
            <div className="mt-5 p-4 text-left border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] rounded-[16px]">
              <h4 className="flex items-center gap-2 text-[13px] font-bold text-[#F0F0F0] mb-2">
                <Info size={14} className="text-[#888888]" /> Telemetry Protocol
              </h4>
              <p className="text-[12px] text-[#A0A0A0] leading-relaxed">
                Circadian rhythm offsets are evaluated based on self-reported Wake Up checks and anchor point compliance. To automate intervals completely, connect wearable integrations via Settings (coming in the direct SDK sync release).
              </p>
            </div>
          </div>

          {/* Sleep Calibration Schedule controls */}
          <div className="flex flex-col gap-6">
            
            <div className="bg-[#141414] rounded-[24px] p-8 border border-[rgba(255,255,255,0.06)] shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-[16px] font-bold text-[#F0F0F0]">Baseline Sleep Interval</h3>
                  <p className="text-xs text-[#888888] mt-0.5">Your intended sleep/wake chronotype bounds.</p>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2.5 text-[#888888] hover:text-[#F0F0F0] bg-[#1E1E1E] rounded-xl border border-[rgba(255,255,255,0.04)] flex items-center gap-1.5 text-xs font-bold transition-all"
                >
                  <Edit2 size={13} />
                  <span>Configure</span>
                </button>
              </div>

              <div className="flex justify-between items-center gap-4">
                <div className="flex-1 bg-[#1A1A1A] rounded-[16px] p-5 border border-[rgba(255,255,255,0.04)] text-center">
                  <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-2 block">
                    Bedtime
                  </span>
                  <span className="text-[24px] font-bold text-[#7C6FF7] tabular-nums">
                    {state.sleep.bedtime}
                  </span>
                </div>
                <div className="flex-1 bg-[#1A1A1A] rounded-[16px] p-5 border border-[rgba(255,255,255,0.04)] text-center">
                  <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-2 block">
                    Wake Time
                  </span>
                  <span className="text-[24px] font-bold text-[#F0F0F0] tabular-nums">
                    {state.sleep.wakeTime}
                  </span>
                </div>
              </div>

              {/* Wind-down Alert toggle */}
              <div className="mt-6 flex items-center justify-between p-4 bg-[rgba(124,111,247,0.05)] border border-[rgba(124,111,247,0.2)] rounded-[16px]">
                <div className="flex items-center gap-3">
                  <Moon size={20} className="text-[#7C6FF7]" />
                  <div>
                    <p className="text-[14px] font-bold text-[#F0F0F0]">
                      Wind-down reminder
                    </p>
                    <p className="text-[12px] text-[#888888] mt-0.5">
                      Notify me 30 mins prior to bedtime
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    updateSleep({
                      windDownReminder: !state.sleep.windDownReminder,
                    });
                    addToast("Wind-down notification state updated!");
                  }}
                  className={`w-[48px] h-[28px] rounded-full flex items-center p-1 transition-colors ${state.sleep.windDownReminder ? "bg-[#7C6FF7]" : "bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)]"}`}
                >
                  <motion.div
                    initial={false}
                    animate={{ x: state.sleep.windDownReminder ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-[20px] h-[20px] bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              {/* AI Optimal Winddown Recommendation */}
              <div className="mt-4 p-4 bg-[rgba(111,247,160,0.05)] border border-[rgba(111,247,160,0.2)] rounded-[16px]">
                <h4 className="text-[12px] font-black text-[#6FF7A0] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles size={12} className="animate-pulse" />
                  <span>AI Optimal Wind-Down Prediction</span>
                </h4>
                <p className="text-[13px] text-[#A0A0A0] leading-relaxed">
                  {aiRec.text}
                  {aiRec.time && <strong className="text-[#6FF7A0]">{aiRec.time}</strong>}
                  {aiRec.explanation && <span>{aiRec.explanation}</span>}
                </p>
              </div>
            </div>

            {/* 7-Day Completion trace matching original SleepIntel */}
            <div className="bg-[#141414] rounded-[24px] p-8 border border-[rgba(255,255,255,0.06)] shadow-lg flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-[16px] font-bold text-[#F0F0F0]">7-Day Sleep &amp; Habit Summary</h3>
                  <p className="text-xs text-[#888888] mt-0.5">Visualizing nightly recovery relative to routine stability.</p>
                </div>
                {hasHistoryData && (
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#7C6FF7]" />
                      <span className="text-[#888888]">Sleep</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#6FF7A0]" />
                      <span className="text-[#888888]">Habit Score</span>
                    </div>
                  </div>
                )}
              </div>

              {!hasHistoryData ? (
                <div className="h-[180px] bg-[#101010]/50 rounded-[16px] border border-dashed border-[rgba(255,255,255,0.04)] flex flex-col items-center justify-center p-4 text-center">
                  <AlertCircle size={20} className="text-[#888888] mb-2" />
                  <span className="text-xs text-[#888888]">No historic check-ins found. Complete your checks from the dashboard.</span>
                </div>
              ) : (
                <div className="w-full h-[180px]" style={{ minWidth: 0, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={sleepIntelChartData}
                      margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorScoreIntel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C6FF7" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#7C6FF7" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorHabitsIntel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6FF7A0" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#6FF7A0" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        stroke="#555555"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis
                        stroke="#555555"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                        tickCount={5}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1A1A1A",
                          borderColor: "rgba(255,255,255,0.08)",
                          borderRadius: "14px",
                          color: "#F0F0F0",
                          fontSize: "12px"
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Score"
                        name="Sleep Score"
                        stroke="#7C6FF7"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorScoreIntel)"
                      />
                      <Area
                        type="monotone"
                        dataKey="Habits"
                        name="Routine Habits"
                        stroke="#6FF7A0"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorHabitsIntel)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}

      {/* DETACHED IMMERSIVE MODAL FOR CHRONOTYPE EDITING */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-250">
            <header className="flex justify-between items-center mb-6">
              <h3 className="text-[18px] font-bold text-[#F0F0F0]">Configure Bedtimes</h3>
            </header>
            
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#888888] uppercase tracking-wide">
                  Intended Bedtime
                </label>
                <input
                  type="text"
                  value={editData.bed}
                  onChange={(e) => setEditData({ ...editData, bed: e.target.value })}
                  placeholder="e.g. 10:00 PM"
                  className="h-[52px] w-full bg-[#1A1A1A] rounded-[14px] border border-[rgba(255,255,255,0.08)] px-4 outline-none text-[#7C6FF7] focus:border-[#7C6FF7] text-[18px] font-bold"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#888888] uppercase tracking-wide">
                  Wake Up Boundary
                </label>
                <input
                  type="text"
                  value={editData.wake}
                  onChange={(e) => setEditData({ ...editData, wake: e.target.value })}
                  placeholder="e.g. 6:00 AM"
                  className="h-[52px] w-full bg-[#1A1A1A] rounded-[14px] border border-[rgba(255,255,255,0.08)] px-4 outline-none text-[#F0F0F0] focus:border-[#7C6FF7] text-[18px] font-bold"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 h-[52px] bg-[#1E1E1E] text-[#888888] hover:text-white rounded-[14px] font-bold text-[14px] border border-[rgba(255,255,255,0.04)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSchedule}
                  className="flex-1 h-[52px] bg-[#7C6FF7] hover:bg-[#6b5ee6] text-[#0A0A0A] rounded-[14px] font-bold text-[14px] hover:shadow-[0_4px_16px_rgba(124,111,247,0.3)] transition-all"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
