import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppState = {
  user: {
    name: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    streakDays: number;
    avatar: string;
    proUntil?: number | null;
    lastStreakClaimDate?: string;
    lastVisitDate?: string;
    totalAppVisits?: number;
    streakBroken?: boolean;
    savedStreakDays?: number;
    streak_v3_resetted?: boolean;
  };
  sleep: {
    score: number;
    debtHours: number;
    bedtime: string;
    wakeTime: string;
    history: number[];
    windDownReminder: boolean;
  };
  anchors: any[];
  quests: any[];
  brainDumps: any[];
  loadout: { items: any[] };
  currentPage: string;
};

const initialState: AppState = {
  user: {
    name: "Shaurya",
    level: 4,
    xp: 840,
    xpToNextLevel: 1000,
    streakDays: 1,
    avatar: "S",
    proUntil: null,
    lastStreakClaimDate: "",
    lastVisitDate: "",
    totalAppVisits: 0,
    streakBroken: false,
    savedStreakDays: 1,
    streak_v3_resetted: true
  },
  sleep: {
    score: 72,
    debtHours: -1.4,
    bedtime: "10:45 PM",
    wakeTime: "5:15 AM",
    history: [68, 74, 71, 80, 72, 65, 72],
    windDownReminder: true,
  },
  anchors: [
    { id: 1, time: "5:00 AM", title: "Optimized Wake", subtitle: "Morning loadout completed", xp: 15, status: "done", type: "auto", category: "Health", note: "Woke up at 5:05 AM, drank 400ml water and checked morning task logs." },
    { id: 2, time: "8:00 AM", title: "School", subtitle: "Device in focus mode", status: "active", type: "fixed", category: "School", note: "Need to hand in English essay draft before block 3." },
    { id: 3, time: "3:00 PM", title: "Free Buffer", subtitle: "", status: "upcoming", type: "buffer", category: "Creativity", note: "Plan to work on design layout project." },
    { id: 4, time: "10:45 PM", title: "Phone Down", subtitle: "Wind-down sequence", status: "upcoming", type: "bedtime", category: "Routine", note: "Charge phone across the room to avoid scrolling." }
  ],
  quests: [
    { id: 1, title: "Buy protein powder", due: "Today", xp: 10, done: false, category: "errand", streak: 3 },
    { id: 2, title: "Finish English essay", due: "Tomorrow", xp: 20, done: false, category: "school", streak: 5 },
    { id: 3, title: "Call Mom", due: "In 3 days", xp: 30, done: false, category: "personal", streak: 2 },
    { id: 4, title: "Calculus Study Session", due: "Today", xp: 40, done: false, category: "school", active: true, minutesLeft: 18, youtubeBlocked: true, streak: 8 }
  ],
  brainDumps: [
    { id: 1, text: "Look up that new productivity framework", time: "2h ago", category: "idea", color: "orange" },
    { id: 2, text: "Sign permission slip", time: "5h ago", category: "task", color: "blue" }
  ],
  loadout: {
    items: [
      { id: 1, label: "Phone", checked: true },
      { id: 2, label: "Wallet", checked: true },
      { id: 3, label: "Keys", checked: false },
      { id: 4, label: "Water bottle", checked: false },
      { id: 5, label: "Headphones", checked: true }
    ]
  },
  currentPage: "dashboard"
};

interface AppContextType {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  updateUser: (updates: Partial<AppState['user']>) => void;
  updateSleep: (updates: Partial<AppState['sleep']>) => void;
  updateLoadout: (updates: Partial<AppState['loadout']>) => void;
  setQuests: (quests: any[]) => void;
  setBrainDumps: (dumps: any[]) => void;
  setAnchors: (anchors: any[]) => void;
  navigate: (page: string) => void;
  notificationPermission: string;
  requestNotificationPermission: () => Promise<string>;
  triggerManualReminder: (anchorId: number) => void;
  purchaseProSubscription: () => { success: boolean; message: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('anchor_app_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.user) {
          if (!parsed.user.streak_v3_resetted) {
            parsed.user.streakDays = 1;
            parsed.user.savedStreakDays = 1;
            parsed.user.streakBroken = false;
            parsed.user.streak_v3_resetted = true;
          }
        }
        return { 
          ...initialState, 
          ...parsed,
          user: { ...initialState.user, ...(parsed.user || {}) },
          sleep: { ...initialState.sleep, ...(parsed.sleep || {}) },
          loadout: { ...initialState.loadout, ...(parsed.loadout || {}) }
        };
      }
    } catch(e) {}
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem('anchor_app_state', JSON.stringify(state));
  }, [state]);

  // Track visits and update streak
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const prevVisits = state.user.totalAppVisits || 0;
    const lastVisit = state.user.lastVisitDate;
    let currentStreak = state.user.streakDays;
    let isBroken = state.user.streakBroken || false;
    let savedStreak = state.user.savedStreakDays || currentStreak;
    
    if (lastVisit !== today) {
      if (lastVisit) {
        const lastDate = new Date(lastVisit);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          if (!isBroken) {
            currentStreak += 1;
            savedStreak = currentStreak;
          }
        } else if (diffDays > 1) {
          isBroken = true;
          savedStreak = currentStreak;
        }
      }
      
      updateUser({
        totalAppVisits: prevVisits + 1,
        lastVisitDate: today,
        streakDays: currentStreak,
        streakBroken: isBroken,
        savedStreakDays: savedStreak
      });
    } else {
      updateUser({ totalAppVisits: prevVisits + 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hook to monitor Pro Subscription expiration
  useEffect(() => {
    if (state.user.proUntil && state.user.proUntil < Date.now()) {
      updateUser({ proUntil: null });
    }
  }, [state.user.proUntil]);

  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        try {
          new Notification("🔔 Anchor Reminders Activated", {
            body: "We will send you gentle, timely reminders for unfinished anchors!",
          });
        } catch (e) {
          console.error("Local notification could not be created", e);
        }
      }
      return permission;
    }
    return 'default';
  };

  const parseTime = (timeStr: string) => {
    const match = timeStr.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return { hours, minutes };
  };

  const triggerManualReminder = (anchorId: number) => {
    const anchor = state.anchors.find(a => a.id === anchorId);
    if (!anchor) return;
    
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(`🔔 Reset Your Flow: ${anchor.title}`, {
            body: `Gentle reminder: Your "${anchor.title}" anchor is scheduled for ${anchor.time}. Let's complete it!`,
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  useEffect(() => {
    const sentTags = new Set<string>();

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const dateString = now.toDateString();

      // Ensure we read the freshest settings from localStorage
      let settings: any = null;
      try {
        const rawSettings = localStorage.getItem('anchor_settings_v1');
        if (rawSettings) {
          settings = JSON.parse(rawSettings);
        }
      } catch (e) {}

      // If master notifications are disabled, skip checking custom times
      const isMasterEnabled = settings ? settings.notifications?.masterEnabled !== false : true;
      
      // Smart-delay feature: pause notifications if user completed a significant amount of tasks early in the day
      const completedTasks = state.quests.filter(q => q.done).length + state.anchors.filter(a => a.status === 'done').length;
      const isEarlyInDay = currentHours < 14; // Before 2 PM
      const isSmartDelayActive = isMasterEnabled && isEarlyInDay && completedTasks >= 3;

      if (!isMasterEnabled || isSmartDelayActive) return;

      // 1. Process custom anchor-point schedule times
      state.anchors.forEach(anchor => {
        if (anchor.status === 'done') return; // Only notify unfinished ones!
        
        const parsed = parseTime(anchor.time);
        if (!parsed) return;

        if (parsed.hours === currentHours && parsed.minutes === currentMinutes) {
          const tag = `anchor-${anchor.id}-${dateString}-${currentHours}:${currentMinutes}`;
          if (!sentTags.has(tag)) {
            sentTags.add(tag);
            
            // Trigger OS Notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(`🔔 Anchor Reminder: ${anchor.title}`, {
                  body: `It's ${anchor.time}! Log your "${anchor.title}" check-in now to maintain your streak.`,
                  tag: `anchor-${anchor.id}`
                });
              } catch (e) {
                console.error(e);
              }
            }
            
            // Broadcast in-app custom event so pages can capture and render active alerts
            window.dispatchEvent(new CustomEvent('anchor-in-app-notification', {
              detail: {
                title: `Anchor Alert: ${anchor.title}`,
                body: `It's time for your scheduled "${anchor.title}" habits anchor! Check it off to lock XP.`,
                type: 'info'
              }
            }));
          }
        }
      });

      // 2. Process user-defined times from Settings (Task 3)
      if (settings && settings.notifications) {
        const nConfig = settings.notifications;

        // Morning Check-In Nudge (Triggers Waking Up)
        if (nConfig.morningCheckin?.enabled && nConfig.morningCheckin?.time) {
          const parsed = parseTime(nConfig.morningCheckin.time);
          if (parsed && parsed.hours === currentHours && parsed.minutes === currentMinutes) {
            const tag = `morning-checkin-${dateString}-${currentHours}:${currentMinutes}`;
            if (!sentTags.has(tag)) {
              sentTags.add(tag);
              const title = "☀️ Good morning! Waking up.";
              const body = `Checking you in for your morning! Sleep intel logs have been updated.`;
              
              // Waking up calculation
              // We dispatch state update safely
              setState(prev => {
                const sleepStart = localStorage.getItem('anchor_sleep_start');
                if (sleepStart) {
                  const durationMs = Date.now() - parseInt(sleepStart);
                  const hours = durationMs / (1000 * 60 * 60);
                  const newScore = Math.min(100, Math.max(0, Math.round((hours / 8) * 100)));
                  const debt = (8 - hours);
                  localStorage.removeItem('anchor_sleep_start');
                  
                  return {
                    ...prev,
                    sleep: {
                      ...prev.sleep,
                      score: newScore,
                      debtHours: parseFloat((prev.sleep.debtHours + debt).toFixed(1)),
                      history: [...prev.sleep.history.slice(1), newScore]
                    }
                  }
                }
                return prev;
              });

              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification(title, { body, tag: 'morning-checkin' });
                } catch (e) {}
              }
              window.dispatchEvent(new CustomEvent('anchor-in-app-notification', {
                detail: { title, body, type: 'success' }
              }));
            }
          }
        }

        // Bedtime Trigger (Going to Sleep)
        if (state.sleep.bedtime) {
          const parsed = parseTime(state.sleep.bedtime);
          if (parsed && parsed.hours === currentHours && parsed.minutes === currentMinutes) {
            const tag = `bedtime-checkin-${dateString}-${currentHours}:${currentMinutes}`;
            if (!sentTags.has(tag)) {
              sentTags.add(tag);
              const title = "🌙 Going to sleep";
              const body = `It's bedtime. Sleep intel active checking in for sleep.`;
              
              const sleepStart = localStorage.getItem('anchor_sleep_start');
              if (!sleepStart) {
                localStorage.setItem('anchor_sleep_start', Date.now().toString());
              }

              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification(title, { body, tag: 'bedtime-checkin' });
                } catch (e) {}
              }
              window.dispatchEvent(new CustomEvent('anchor-in-app-notification', {
                detail: { title, body, type: 'info' }
              }));
            }
          }
        }

        // Breakfast Nudge
        if (nConfig.breakfastNudge?.enabled && nConfig.breakfastNudge?.time) {
          const bTime = nConfig.breakfastNudge.time || "08:00 AM";
          const parsed = parseTime(bTime);
          if (parsed && parsed.hours === currentHours && parsed.minutes === currentMinutes) {
            const tag = `breakfast-nudge-${dateString}-${currentHours}:${currentMinutes}`;
            if (!sentTags.has(tag)) {
              sentTags.add(tag);
              const title = "🍳 Fuel Reserve Alert";
              const body = "Breakfast hours! Remember to hydrate, check morning checklists, and maintain your high focus multipliers!";
              
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification(title, { body, tag: 'breakfast-nudge' });
                } catch (e) {}
              }
              window.dispatchEvent(new CustomEvent('anchor-in-app-notification', {
                detail: { title, body, type: 'info' }
              }));
            }
          }
        }

        // Daily summary recap (Evening Habit Safeguard)
        if (nConfig.dailySummary?.enabled && nConfig.dailySummary?.time) {
          const parsed = parseTime(nConfig.dailySummary.time);
          if (parsed && parsed.hours === currentHours && parsed.minutes === currentMinutes) {
            const tag = `daily-summary-${dateString}-${currentHours}:${currentMinutes}`;
            if (!sentTags.has(tag)) {
              sentTags.add(tag);
              const title = "📈 EOD Habits Recap";
              const body = "Time to wind down! Check your Anchor Points timeline to register completed habits and shield your streaks.";
              
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification(title, { body, tag: 'daily-summary' });
                } catch (e) {}
              }
              window.dispatchEvent(new CustomEvent('anchor-in-app-notification', {
                detail: { title, body, type: 'warning' }
              }));
            }
          }
        }
      }

    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [state.anchors, state.user.streakDays, notificationPermission]);

  const updateState = (updates: Partial<AppState>) => setState(prev => ({ ...prev, ...updates }));
  const updateUser = (updates: Partial<AppState['user']>) => setState(prev => ({ ...prev, user: { ...prev.user, ...updates } }));
  const updateSleep = (updates: Partial<AppState['sleep']>) => setState(prev => ({ ...prev, sleep: { ...prev.sleep, ...updates } }));
  const updateLoadout = (updates: Partial<AppState['loadout']>) => setState(prev => ({ ...prev, loadout: { ...prev.loadout, ...updates } }));
  const setQuests = (quests: any[]) => setState(prev => ({ ...prev, quests }));
  const setBrainDumps = (brainDumps: any[]) => setState(prev => ({ ...prev, brainDumps }));
  const setAnchors = (anchors: any[]) => setState(prev => ({ ...prev, anchors }));
  const navigate = (page: string) => setState(prev => ({ ...prev, currentPage: page }));

  const purchaseProSubscription = () => {
    if (state.user.proUntil && state.user.proUntil > Date.now()) {
      return { success: false, message: "You already have an active Pro subscription!" };
    }
    if (state.user.xp >= 7000) {
      updateUser({ xp: state.user.xp - 7000, proUntil: Date.now() + 7 * 24 * 60 * 60 * 1000 });
      return { success: true, message: "Upgraded to Pro for 7 days! (-7000 XP)" };
    } else {
      return { success: false, message: `Not enough XP! You need ${7000 - state.user.xp} more XP.` };
    }
  };

  return (
    <AppContext.Provider value={{
      state,
      updateState,
      updateUser,
      updateSleep,
      updateLoadout,
      setQuests,
      setBrainDumps,
      setAnchors,
      navigate,
      notificationPermission,
      requestNotificationPermission,
      triggerManualReminder,
      purchaseProSubscription
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
