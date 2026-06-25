import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

export type AppState = {
  user: {
    name: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    streakDays: number;
    streakFreezes?: number;
    avatar: string;
    proUntil?: number | null;
    lastStreakClaimDate?: string;
    lastVisitDate?: string;
    totalAppVisits?: number;
    streakBroken?: boolean;
    savedStreakDays?: number;
    streak_v3_resetted?: boolean;
    onboarded?: boolean;
    xpPool: number;
    xpPoolLastResetDate: string;
    loadoutLastResetDate: string;
  };
  sleep: {
    score: number;
    debtHours: number;
    bedtime: string;
    wakeTime: string;
    history: number[];
    windDownReminder: boolean;
    sleepStartTime: number | null;
  };
  anchors: any[];
  quests: any[];
  brainDumps: any[];
  loadout: { items: any[] };
  currentPage: string;
};

const initialState: AppState = {
  user: {
    name: "User",
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    streakDays: 1,
    streakFreezes: 0,
    avatar: "U",
    proUntil: null,
    lastStreakClaimDate: "",
    lastVisitDate: "",
    totalAppVisits: 0,
    streakBroken: false,
    savedStreakDays: 1,
    streak_v3_resetted: true,
    onboarded: false,
    xpPool: 100,
    xpPoolLastResetDate: new Date().toISOString().split('T')[0],
    loadoutLastResetDate: new Date().toISOString().split('T')[0]
  },
  sleep: {
    score: 100,
    debtHours: 0,
    bedtime: "10:00 PM",
    wakeTime: "6:00 AM",
    history: [],
    windDownReminder: true,
    sleepStartTime: null,
  },
  anchors: [],
  quests: [],
  brainDumps: [],
  loadout: { items: [] },
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
  const { user } = useAuth();
  
  const [state, setState] = useState<AppState>(() => {
    let parsedState = initialState;
    try {
      const saved = localStorage.getItem('anchor_app_state');
      // ... we will let useEffect fetch from firestore if missing locally, but for now try local
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
        parsedState = { 
          ...initialState, 
          ...parsed,
          user: { ...initialState.user, ...(parsed.user || {}) },
          sleep: { ...initialState.sleep, ...(parsed.sleep || {}) },
          loadout: { ...initialState.loadout, ...(parsed.loadout || {}) }
        };
      }
    } catch(e) {}

    try {
      const onboardInfo = localStorage.getItem('anchor_personalization');
      if (onboardInfo) {
        const p = JSON.parse(onboardInfo);
        if (p.wakeHour !== undefined && p.sleepHour !== undefined) {
          const formatHour = (v: number) => {
            const normalized = ((v % 24) + 24) % 24;
            let h = normalized;
            const ampm = normalized >= 12 ? 'PM' : 'AM';
            if (h === 0) h = 12;
            else if (h > 12) h -= 12;
            return `${h}:00 ${ampm}`;
          };
          
          parsedState.sleep = {
            ...parsedState.sleep,
            wakeTime: formatHour(p.wakeHour),
            bedtime: formatHour(p.sleepHour),
          };
          
          if (parsedState.anchors.length === 0) {
            parsedState.anchors = [
               { id: Date.now(), time: formatHour(p.wakeHour), title: "Optimized Wake", subtitle: "Start of day", xp: 15, status: "upcoming", type: "auto", category: "Health", note: "" },
               { id: Date.now() + 1, time: formatHour(p.sleepHour), title: "Phone Down", subtitle: "Wind-down sequence", xp: 15, status: "upcoming", type: "bedtime", category: "Routine", note: "" }
            ];
          }
        }
      }
    } catch (e) {}

    return parsedState;
  });

  const dataLoadedRef = useRef(false);

  // Check Firestore once on user loaded
  useEffect(() => {
    if (user) {
      dataLoadedRef.current = false;
      
      // Load user-specific cached local state first so we reset instantly and synchronously!
      const userSaved = localStorage.getItem(`anchor_app_state_${user.uid}`);
      if (userSaved) {
        try {
          const parsed = JSON.parse(userSaved);
          setState({
            ...initialState,
            ...parsed,
            user: { ...initialState.user, ...(parsed.user || {}) },
            sleep: { ...initialState.sleep, ...(parsed.sleep || {}) },
            loadout: { ...initialState.loadout, ...(parsed.loadout || {}) }
          });
        } catch (e) {
          setState({
            ...initialState,
            user: {
              ...initialState.user,
              name: user.displayName || "User",
              onboarded: false
            }
          });
        }
      } else {
        setState({
          ...initialState,
          user: {
            ...initialState.user,
            name: user.displayName || "User",
            onboarded: false
          }
        });
      }

      const withTimeout = <T,>(promise: Promise<T>, ms = 10000): Promise<T> => {
        return Promise.race([
          promise,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), ms)
          )
        ]);
      };

      // Fetch latest state from the database directly via Firestore document operations with 10s timeout
      withTimeout(getDoc(doc(db, 'users', user.uid)), 10000).then((docSnap) => {
        if (docSnap.exists()) {
          const dbState = docSnap.data() as AppState;
          setState(prev => ({
             ...prev, 
             ...dbState,
             user: { ...prev.user, ...(dbState.user || {}) },
             sleep: { ...prev.sleep, ...(dbState.sleep || {}) },
             loadout: { ...prev.loadout, ...(dbState.loadout || {}) }
          }));
          if (dbState.user?.onboarded) {
            localStorage.setItem('anchor_onboarded', 'true');
            localStorage.setItem(`anchor_onboarded_${user.uid}`, 'true');
            window.dispatchEvent(new Event('storage'));
          } else {
            localStorage.removeItem('anchor_onboarded');
            localStorage.removeItem(`anchor_onboarded_${user.uid}`);
          }
        } else {
          // New user! Ensure clean onboarding triggers
          localStorage.removeItem('anchor_onboarded');
          localStorage.removeItem(`anchor_onboarded_${user.uid}`);
          
          // Write initial state to Firestore
          const initialUserDoc = {
            ...initialState,
            user: {
              ...initialState.user,
              name: user.displayName || "User",
              onboarded: false
            }
          };
          setDoc(doc(db, 'users', user.uid), initialUserDoc, { merge: true }).catch((err) => {
            console.warn("Firestore initial write error:", err);
          });
        }
        dataLoadedRef.current = true;
      }).catch((err) => {
        console.warn("Firestore state fetch timed out or failed. Falling back to offline client cache.", err);
        dataLoadedRef.current = true;
      });
    } else {
      // User logged out, clear state
      setState(initialState);
      localStorage.removeItem('anchor_app_state');
      localStorage.removeItem('anchor_onboarded');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`anchor_app_state_${user.uid}`, JSON.stringify(state));
      localStorage.setItem('anchor_app_state', JSON.stringify(state));
      if (dataLoadedRef.current) {
        setDoc(doc(db, 'users', user.uid), state, { merge: true }).catch((err) => {
          console.error("Firestore save failed:", err);
        });
      }
    } else {
      localStorage.setItem('anchor_app_state', JSON.stringify(state));
    }
  }, [state, user]);

  // Track visits and update streak
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const prevVisits = state.user.totalAppVisits || 0;
    const lastVisit = state.user.lastVisitDate;
    let currentStreak = state.user.streakDays;
    let isBroken = state.user.streakBroken || false;
    let savedStreak = state.user.savedStreakDays || currentStreak;
    let xpPool = state.user.xpPool;
    let xpPoolLastResetDate = state.user.xpPoolLastResetDate;
    let loadoutLastResetDate = state.user.loadoutLastResetDate;
    
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
      
      // Daily XP Pool reset
      if (xpPoolLastResetDate !== today) {
        xpPool = 100;
        xpPoolLastResetDate = today;
      }

      // Loadout reset
      if (loadoutLastResetDate !== today) {
        updateLoadout({ items: state.loadout.items.map(i => ({ ...i, checked: false })) });
        loadoutLastResetDate = today;
      }
      
      updateUser({
        totalAppVisits: prevVisits + 1,
        lastVisitDate: today,
        streakDays: currentStreak,
        streakBroken: isBroken,
        savedStreakDays: savedStreak,
        xpPool,
        xpPoolLastResetDate,
        loadoutLastResetDate
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
