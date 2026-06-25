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

export default function StatisticsPage({ defaultTab = 'overview' }: { defaultTab?: 'overview' | 'sleep-overview' }) {
  const { state, updateSleep } = useApp();
  const { addToast } = useToast();
  
  // We have 2 sub-tabs: 'overview' (the multi-metric analytics) and 'sleep-overview' (all Sleep Intel inputs, battery and schedule controls)
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'sleep-overview'>(defaultTab);
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
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-border-base pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-[14px] uppercase tracking-wider mb-1">
            <Activity size={16} />
            <span>Circadian Intelligence System</span>
          </div>
          <h2 className="text-[32px] font-bold tracking-tight text-text-primary">Rhythm &amp; Statistics</h2>
          <p className="text-text-muted text-[15px] mt-1">
            Track, configure, and visualize the symbiosis of your sleep hygiene, task execution, and energy routine.
          </p>
        </div>

        {/* Tab Switcher for Unified Views */}
        <div className="flex items-center gap-2 bg-surface border border-border-base p-1 rounded-[14px]">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-[10px] transition-all ${
              activeSubTab === 'overview' 
                ? 'bg-[#7C6FF7] text-white shadow-md' 
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <BarChart3 size={14} />
            <span>Circadian Overview</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('sleep-overview')}
            className={`flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-[10px] transition-all ${
              activeSubTab === 'sleep-overview' 
                ? 'bg-[#7C6FF7] text-white shadow-md' 
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Moon size={14} />
            <span>Sleep Overview</span>
          </button>
        </div>
      </header>

      {/* CONDITIONAL RENDER: SUB-TAB 1: RHYTHMIC OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          
          {/* 4. WEEKLY TRAJECTORY GRAPH - WITH SECURE INACTIVE FALLBACK */}
          <section className="bg-surface border border-border-base rounded-[24px] p-6 flex flex-col gap-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-[18px] font-bold text-text-primary flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" />
                  <span> Rhythmic Weekly Trajectory</span>
                </h3>
                <p className="text-[13px] text-text-muted mt-1">
                  Correlating daily sleep quality variables (teal) with habit &amp; routine updates (purple).
                </p>
              </div>

              {hasHistoryData && (
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-text-muted">Tasks Done</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-[#00F5D4] rounded-full"></div>
                    <span className="text-text-muted">Sleep Score</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-primary-hover rounded-full"></div>
                    <span className="text-text-muted">Energy Velocity</span>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic visual fallback or interactive chart */}
            {!hasHistoryData ? (
              <div className="w-full h-[320px] bg-surface-2 rounded-[18px] border border-dashed border-border-base flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-primary/5 to-transparent opacity-60" />
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary border border-primary/20 relative z-10">
                  <Calendar size={24} />
                </div>
                <h4 className="text-[18px] font-bold text-text-primary mb-1.5 relative z-10">No Circadian Checks Recorded Yet</h4>
                <p className="text-xs text-text-muted max-w-[420px] leading-relaxed mb-6 relative z-10">
                  Daily Sleep &amp; Habit metrics chart automatically as data points are registered! Trigger a daily wake-up check-in via the Immersion dashboard, or adjust your schedules to calibrate your scores.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                  <button 
                    onClick={() => setActiveSubTab('sleep-overview')}
                    className="px-5 py-2.5 bg-primary text-white hover:bg-primary-hover rounded-[12px] font-bold text-xs shadow-md transition-colors"
                  >
                    Calibrate Sleep Schedule
                  </button>
                  <button 
                    onClick={() => addToast("First telemetry marker created!", "info")}
                    className="px-5 py-2.5 bg-surface-3 text-text-muted hover:text-text-primary border border-border-base font-bold text-xs transition-colors"
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

        </div>
      )}

      {/* CONDITIONAL RENDER: SUB-TAB 2: SLEEP OVERVIEW & BATTERY */}
      {activeSubTab === 'sleep-overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
          
          {/* AI SMART SUMMARY/INSIGHT Banner */}
          <div className="bg-gradient-to-r from-primary/10 via-surface to-surface border border-primary/20 rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm col-span-1 lg:col-span-2">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary shrink-0">
                <Sparkles size={24} className="animate-pulse" />
              </div>
              <div>
                <span className="text-xs text-primary font-semibold bg-primary/10 border border-primary/25 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                  AI Insight
                </span>
                <p className="text-[15px] text-text-primary font-medium mt-1.5 leading-relaxed">
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
          </div>

        </div>
      )}

      {/* CONDITIONAL RENDER: SUB-TAB 2: SLEEP OVERVIEW & BATTERY */}
      {activeSubTab === 'sleep-overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
          
          {/* Sleep Battery Panel */}
          <div className="bg-surface rounded-[24px] p-8 border border-border-base flex flex-col items-center justify-center text-center h-full">
            <h2 className="text-[13px] font-bold text-text-muted uppercase tracking-widest mb-6">
              Current Sleep Battery Charge
            </h2>

            <div className="relative w-[260px] h-[260px] flex items-center justify-center mb-8">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="var(--color-surface-2)"
                  strokeWidth="4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="4"
                  strokeDasharray="282.7"
                  strokeDashoffset={282.7 * (1 - state.sleep.score / 100)}
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_16px_var(--color-primary)] opacity-80"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[64px] font-bold tabular-nums leading-none mb-1 text-text-primary">
                  {state.sleep.score}
                  <span className="text-2xl text-text-muted">%</span>
                </span>
                <span className="text-[12px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3.5 py-1.5 rounded-full">
                  Target Calibrated
                </span>
              </div>
            </div>

            <div
              className={`p-4 rounded-[16px] w-full flex items-center justify-between border ${state.sleep.debtHours < 0 ? "bg-red-500/10 border-red-500/20" : "bg-green-500/10 border-green-500/20"}`}
            >
              <span className="text-[14px] font-medium text-text-muted">
                Accumulated Sleep Debt
              </span>
              <span
                className={`text-[16px] font-bold ${state.sleep.debtHours < 0 ? "text-[#F76F6F]" : "text-[#6FF7A0]"}`}
              >
                {state.sleep.debtHours} hrs this week
              </span>
            </div>

            {/* Tracking Methodology */}
            <div className="mt-5 p-4 text-left border border-border-base bg-surface-2/40 rounded-[16px] w-full">
              <h4 className="flex items-center gap-2 text-[13px] font-bold text-text-primary mb-2">
                <Info size={14} className="text-text-muted" /> Telemetry Protocol
              </h4>
              <p className="text-[12px] text-text-muted leading-relaxed">
                Circadian rhythm offsets are evaluated based on self-reported Wake Up checks and anchor point compliance. To automate intervals completely, connect wearable integrations via Settings (coming in the direct SDK sync release).
              </p>
            </div>
          </div>

          {/* Sleep Calibration Schedule controls */}
          <div className="flex flex-col gap-6">
            
            <div className="bg-surface rounded-[24px] p-8 border border-border-base shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-[16px] font-bold text-text-primary">Baseline Sleep Interval</h3>
                  <p className="text-xs text-text-muted mt-0.5">Your intended sleep/wake chronotype bounds.</p>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2.5 text-text-muted hover:text-text-primary bg-surface-2 rounded-xl border border-border-base flex items-center gap-1.5 text-xs font-bold transition-all"
                >
                  <Edit2 size={13} />
                  <span>Configure</span>
                </button>
              </div>

              <div className="flex justify-between items-center gap-4">
                <div className="flex-1 bg-surface-2 rounded-[16px] p-5 border border-border-base text-center">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2 block">
                    Bedtime
                  </span>
                  <span className="text-[24px] font-bold text-primary tabular-nums">
                    {state.sleep.bedtime}
                  </span>
                </div>
                <div className="flex-1 bg-surface-2 rounded-[16px] p-5 border border-border-base text-center">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2 block">
                    Wake Time
                  </span>
                  <span className="text-[24px] font-bold text-text-primary tabular-nums">
                    {state.sleep.wakeTime}
                  </span>
                </div>
              </div>

              {/* Wind-down Alert toggle */}
              <div className="mt-6 flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-[16px]">
                <div className="flex items-center gap-3">
                  <Moon size={20} className="text-primary" />
                  <div>
                    <p className="text-[14px] font-bold text-text-primary">
                      Wind-down reminder
                    </p>
                    <p className="text-[12px] text-text-muted mt-0.5">
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
                  className={`w-[48px] h-[28px] rounded-full flex items-center p-1 transition-colors ${state.sleep.windDownReminder ? "bg-primary" : "bg-surface-2 border border-border-base"}`}
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
              <div className="mt-4 p-4 bg-green-500/5 border border-green-500/20 rounded-[16px]">
                <h4 className="text-[12px] font-black text-[#6FF7A0] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles size={12} className="animate-pulse" />
                  <span>AI Optimal Wind-Down Prediction</span>
                </h4>
                <p className="text-[13px] text-text-muted leading-relaxed">
                  {aiRec.text}
                  {aiRec.time && <strong className="text-[#6FF7A0]">{aiRec.time}</strong>}
                  {aiRec.explanation && <span>{aiRec.explanation}</span>}
                </p>
              </div>
            </div>

            {/* 7-Day Completion trace matching original SleepIntel */}
            <div className="bg-surface rounded-[24px] p-8 border border-border-base shadow-lg flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-[16px] font-bold text-text-primary">7-Day Sleep &amp; Habit Summary</h3>
                  <p className="text-xs text-text-muted mt-0.5">Visualizing nightly recovery relative to routine stability.</p>
                </div>
                {hasHistoryData && (
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="text-text-muted">Sleep</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#6FF7A0]" />
                      <span className="text-text-muted">Habit Score</span>
                    </div>
                  </div>
                )}
              </div>

              {!hasHistoryData ? (
                <div className="h-[180px] bg-surface-2 rounded-[16px] border border-dashed border-border-base flex flex-col items-center justify-center p-4 text-center">
                  <AlertCircle size={20} className="text-text-muted mb-2" />
                  <span className="text-xs text-text-muted">No historic check-ins found. Complete your checks from the dashboard.</span>
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
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorHabitsIntel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6FF7A0" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#6FF7A0" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        stroke="var(--color-text-muted)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis
                        stroke="var(--color-text-muted)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                        tickCount={5}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-surface-2)",
                          borderColor: "var(--color-border-base)",
                          borderRadius: "14px",
                          color: "var(--color-text-primary)",
                          fontSize: "12px"
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Score"
                        name="Sleep Score"
                        stroke="var(--color-primary)"
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
          <div className="relative bg-surface border border-border-base rounded-[24px] p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-250">
            <header className="flex justify-between items-center mb-6">
              <h3 className="text-[18px] font-bold text-text-primary">Configure Bedtimes</h3>
            </header>
            
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-text-muted uppercase tracking-wide">
                  Intended Bedtime
                </label>
                <input
                  type="text"
                  value={editData.bed}
                  onChange={(e) => setEditData({ ...editData, bed: e.target.value })}
                  placeholder="e.g. 10:00 PM"
                  className="h-[52px] w-full bg-surface-2 rounded-[14px] border border-border-base px-4 outline-none text-primary focus:border-primary text-[18px] font-bold"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-text-muted uppercase tracking-wide">
                  Wake Up Boundary
                </label>
                <input
                  type="text"
                  value={editData.wake}
                  onChange={(e) => setEditData({ ...editData, wake: e.target.value })}
                  placeholder="e.g. 6:00 AM"
                  className="h-[52px] w-full bg-surface-2 rounded-[14px] border border-border-base px-4 outline-none text-text-primary focus:border-primary text-[18px] font-bold"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 h-[52px] bg-surface-3 text-text-muted hover:text-text-primary rounded-[14px] font-bold text-[14px] border border-border-base transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSchedule}
                  className="flex-1 h-[52px] bg-primary hover:bg-primary-hover text-white rounded-[14px] font-bold text-[14px] transition-all"
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
