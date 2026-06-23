import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useApp } from './AppContext';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { applyTheme, watchSystemTheme } from '../components/settings/themeUtils';

export interface SettingsType {
  profile: {
    displayName: string;
    username: string;
    email: string;
    avatarType: string;
    avatarImage: string | null;
    memberSince: string;
    plan: string;
    twoFactorEnabled: boolean;
    sessions: Array<{ id: number; device: string; active: boolean; lastSeen: string }>;
  };
  notifications: {
    masterEnabled: boolean;
    morningCheckin: { enabled: boolean; time: string };
    bedtimeReminder: { enabled: boolean; minutesBefore: number };
    breakfastNudge: { enabled: boolean; time: string };
    phoneDownAlert: { enabled: boolean };
    questDueReminders: { enabled: boolean; leadTimes: string[] };
    questCompletionCelebration: { enabled: boolean; sound: boolean };
    dailySummary: { enabled: boolean; time: string };
    anchorStartingSoon: { enabled: boolean; minutesBefore: number };
    anchorMissed: { enabled: boolean };
    leaderboardUpdates: { enabled: boolean };
    friendChallenges: { enabled: boolean };
    weeklySummary: { enabled: boolean; day: string; time: string };
    sound: { enabled: boolean; type: string };
    vibration: { enabled: boolean };
    quietHours: { enabled: boolean; from: string; to: string; days: string[] };
  };
  schedule: {
    weekStart: string;
    timeFormat: string;
    dateFormat: string;
    minBreakMinutes: number;
    autoBufferBlocks: boolean;
    weekendsOverride: boolean;
    weekendWakeTime: string;
    weekendBedtime: string;
    recurringAnchors: Array<{ id: number; title: string; days: string[]; startTime: string; duration: number; type: string }>;
    categories: Array<{ id: number; name: string; color: string }>;
  };
  sleep: {
    targetHours: number;
    idealBedtime: string;
    targetWakeTime: string;
    scoreWeights: {
      duration: number;
      consistency: number;
      timing: number;
      wakeEvents: number;
    };
    journalEnabled: boolean;
    showInDashboard: boolean;
    debtWarningThreshold: number;
  };
  gamification: {
    xpValues: {
      questComplete: number;
      breakfast: number;
      sleepTarget: number;
      loadoutComplete: number;
    };
    streakFreeze: boolean;
    streakGracePeriod: string;
    showXPBar: boolean;
    showLevelBadge: boolean;
    levelUpNotification: boolean;
    levelUpSound: boolean;
    questDifficulty: {
      easy: number;
      medium: number;
      hard: number;
      epic: number;
    };
    autoSuggestDifficulty: boolean;
  };
  appearance: {
    colorMode: string;
    accentColor: string;
    sidebarWidth: number;
    density: string;
    showSidebarLabels: boolean;
    animationsEnabled: boolean;
    reducedMotion: boolean;
    dashboard: {
      showStatsBar: boolean;
      showSleepPanel: boolean;
      showActiveQuest: boolean;
      timelineView: string;
      questsPerRow: number;
    };
    fontSize: number;
    fontFamily: string;
  };
  privacy: {
    leaderboardParticipation: boolean;
    leaderboardDisplayName: string;
    shareXP: boolean;
    shareStreak: boolean;
    shareQuests: boolean;
    shareSleep: boolean;
    blockedUsers: string[];
    analyticsEnabled: boolean;
    personalizationEnabled: boolean;
    profileVisibility: string;
  };
  focus: {
    blockingEnabled: boolean;
    blockedSites: string[];
    blockingStrictness: string;
    sessionLength: number;
    breakLength: number;
    sessionsBeforeLongBreak: number;
    longBreakLength: number;
    autoStartBreaks: boolean;
    autoStartSessions: boolean;
    focusSound: string;
    hideNotifications: boolean;
    greyOutCards: boolean;
    showTimerInTab: boolean;
    endOfSessionAction: string;
  };
  data: {
    cloudSync: boolean;
    syncEmail: string;
    autoBackup: boolean;
    backupFrequency: string;
    lastBackup: string | null;
  };
  connections: {
    googleCalendar: boolean;
    appleCalendar: boolean;
    outlook: boolean;
    spotify: boolean;
    discord: boolean;
    notion: boolean;
  };
}

const defaultSettings: SettingsType = {
  profile: {
    displayName: "Shaurya",
    username: "shaurya",
    email: "shaurya@example.com",
    avatarType: "letter",
    avatarImage: null,
    memberSince: "June 2026",
    plan: "free",
    twoFactorEnabled: false,
    sessions: [
      { id: 1, device: "This device", active: true, lastSeen: "Now" },
      { id: 2, device: "iPhone 14", active: false, lastSeen: "2 days ago" },
      { id: 3, device: "Chrome on Windows", active: false, lastSeen: "5 days ago" }
    ]
  },
  notifications: {
    masterEnabled: true,
    morningCheckin: { enabled: true, time: "07:00" },
    bedtimeReminder: { enabled: true, minutesBefore: 30 },
    breakfastNudge: { enabled: true, time: "07:30" },
    phoneDownAlert: { enabled: true },
    questDueReminders: { enabled: true, leadTimes: ["30min", "1hr"] },
    questCompletionCelebration: { enabled: true, sound: true },
    dailySummary: { enabled: true, time: "21:00" },
    anchorStartingSoon: { enabled: true, minutesBefore: 10 },
    anchorMissed: { enabled: true },
    leaderboardUpdates: { enabled: true },
    friendChallenges: { enabled: true },
    weeklySummary: { enabled: true, day: "sunday", time: "20:00" },
    sound: { enabled: true, type: "default" },
    vibration: { enabled: true },
    quietHours: { enabled: false, from: "22:00", to: "07:00", days: ["mon","tue","wed","thu","fri","sat","sun"] }
  },
  schedule: {
    weekStart: "monday",
    timeFormat: "12hr",
    dateFormat: "MM/DD/YYYY",
    minBreakMinutes: 15,
    autoBufferBlocks: true,
    weekendsOverride: false,
    weekendWakeTime: "09:00",
    weekendBedtime: "23:00",
    recurringAnchors: [],
    categories: [
      { id: 1, name: "School", color: "#6FBBF7" },
      { id: 2, name: "Work", color: "#F7A06F" },
      { id: 3, name: "Health", color: "#6FF7A0" },
      { id: 4, name: "Personal", color: "#F7D96F" }
    ]
  },
  sleep: {
    targetHours: 8,
    idealBedtime: "22:00",
    targetWakeTime: "06:00",
    scoreWeights: {
      duration: 40,
      consistency: 30,
      timing: 20,
      wakeEvents: 10
    },
    journalEnabled: false,
    showInDashboard: true,
    debtWarningThreshold: -5
  },
  gamification: {
    xpValues: {
      questComplete: 10,
      breakfast: 20,
      sleepTarget: 25,
      loadoutComplete: 15
    },
    streakFreeze: true,
    streakGracePeriod: "1hour",
    showXPBar: true,
    showLevelBadge: true,
    levelUpNotification: true,
    levelUpSound: true,
    questDifficulty: {
      easy: 10,
      medium: 20,
      hard: 35,
      epic: 50
    },
    autoSuggestDifficulty: true
  },
  appearance: {
    colorMode: "dark",
    accentColor: "#7C6FF7",
    sidebarWidth: 260,
    density: "default",
    showSidebarLabels: true,
    animationsEnabled: true,
    reducedMotion: false,
    dashboard: {
      showStatsBar: true,
      showSleepPanel: true,
      showActiveQuest: true,
      timelineView: "timeline",
      questsPerRow: 1
    },
    fontSize: 15,
    fontFamily: "inter"
  },
  privacy: {
    leaderboardParticipation: true,
    leaderboardDisplayName: "username",
    shareXP: true,
    shareStreak: true,
    shareQuests: true,
    shareSleep: false,
    blockedUsers: [],
    analyticsEnabled: true,
    personalizationEnabled: true,
    profileVisibility: "friends"
  },
  focus: {
    blockingEnabled: false,
    blockedSites: [
      "youtube.com", "twitter.com", "instagram.com",
      "tiktok.com", "reddit.com"
    ],
    blockingStrictness: "normal",
    sessionLength: 25,
    breakLength: 5,
    sessionsBeforeLongBreak: 4,
    longBreakLength: 15,
    autoStartBreaks: false,
    autoStartSessions: false,
    focusSound: "none",
    hideNotifications: true,
    greyOutCards: true,
    showTimerInTab: true,
    endOfSessionAction: "show_summary"
  },
  data: {
    cloudSync: false,
    syncEmail: "",
    autoBackup: true,
    backupFrequency: "weekly",
    lastBackup: null
  },
  connections: {
    googleCalendar: false,
    appleCalendar: false,
    outlook: false,
    spotify: false,
    discord: false,
    notion: false
  }
};

const SETTINGS_KEY = 'anchor_settings_v1';

function deepMerge(defaults: any, overrides: any): any {
  const result = { ...defaults };
  for (const key in overrides) {
    if (
      overrides[key] !== null &&
      typeof overrides[key] === 'object' &&
      !Array.isArray(overrides[key])
    ) {
      result[key] = deepMerge(defaults[key] || {}, overrides[key]);
    } else {
      result[key] = overrides[key];
    }
  }
  return result;
}

interface SettingsContextProps {
  settings: SettingsType;
  updateSetting: <T>(path: string, value: T) => void;
  resetProgress: () => void;
  clearAllData: () => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  resetSection: (sectionKey: keyof SettingsType) => void;
  addBlockedSite: (site: string) => void;
  removeBlockedSite: (site: string) => void;
  addRecurringAnchor: (anchor: SettingsType['schedule']['recurringAnchors'][0]) => void;
  removeRecurringAnchor: (id: number) => void;
  addCategory: (cat: { name: string; color: string }) => void;
  updateCategory: (id: number, name: string) => void;
  deleteCategory: (id: number) => void;
  logOutAllSessions: () => void;
  backupNow: () => void;
  playToneNotification: (type?: string) => void;
  playFocusOscillatorPreview: (type: string) => void;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used inside a SettingsProvider");
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, updateState, updateUser, setAnchors, setQuests, setBrainDumps } = useApp();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [settings, setSettings] = useState<SettingsType>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return deepMerge(defaultSettings, JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load settings.", e);
    }
    return defaultSettings;
  });

  const loadedUserIdRef = useRef<string | null>(null);

  // Synchronize settings profile with the actual logged-in user and isolate cache
  useEffect(() => {
    if (user) {
      const userSettingsKey = `anchor_settings_v1_${user.uid}`;
      const saved = localStorage.getItem(userSettingsKey);
      let userSettings = defaultSettings;
      if (saved) {
        try {
          userSettings = deepMerge(defaultSettings, JSON.parse(saved));
        } catch (e) {
          console.warn("Could not load user-specific settings", e);
        }
      } else {
        const globalSaved = localStorage.getItem(SETTINGS_KEY);
        if (globalSaved) {
          try {
            userSettings = deepMerge(defaultSettings, JSON.parse(globalSaved));
          } catch (e) {}
        }
      }

      setSettings({
        ...userSettings,
        profile: {
          ...userSettings.profile,
          email: user.email || userSettings.profile.email,
          displayName: state.user?.name || user.displayName || userSettings.profile.displayName,
          username: state.user?.name ? state.user.name.toLowerCase().replace(/\s+/g, '_') : (user.displayName ? user.displayName.toLowerCase().replace(/\s+/g, '_') : userSettings.profile.username)
        }
      });
      loadedUserIdRef.current = user.uid;
    } else {
      setSettings(defaultSettings);
      loadedUserIdRef.current = null;
    }
  }, [user, state.user?.name]);

  // Save to localStorage specifically isolated per user
  useEffect(() => {
    try {
      if (user) {
        if (loadedUserIdRef.current === user.uid) {
          localStorage.setItem(`anchor_settings_v1_${user.uid}`, JSON.stringify(settings));
        }
      } else if (loadedUserIdRef.current === null) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      }
    } catch (e) {
      console.warn("Could not save settings.", e);
    }
  }, [settings, user]);

  // Apply settings to document on change
  useEffect(() => {
    // 1. Accent color
    document.documentElement.style.setProperty('--primary', settings.appearance.accentColor || '#7C6FF7');
    document.documentElement.style.setProperty('--color-primary', settings.appearance.accentColor || '#7C6FF7');
    
    // 2. Font size
    document.documentElement.style.setProperty('--font-size-body', `${settings.appearance.fontSize}px`);
    
    // 3. Sidebar width
    document.documentElement.style.setProperty('--sidebar-width', `${settings.appearance.sidebarWidth}px`);
    
    // 4. Content density
    const rootClassList = document.documentElement.classList;
    rootClassList.remove('density-compact', 'density-comfortable');
    if (settings.appearance.density === 'compact') {
      rootClassList.add('density-compact');
    } else if (settings.appearance.density === 'comfortable') {
      rootClassList.add('density-comfortable');
    }

    // 5. Font Family
    let fontValue = '"Inter", sans-serif';
    if (settings.appearance.fontFamily === 'mono') {
      fontValue = '"JetBrains Mono", Courier, monospace';
    } else if (settings.appearance.fontFamily === 'rounded') {
      fontValue = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    }
    document.documentElement.style.setProperty('--font-family', fontValue);
    document.body.style.fontFamily = fontValue;

    // 6. Animations
    if (!settings.appearance.animationsEnabled) {
      rootClassList.add('no-animations');
    } else {
      rootClassList.remove('no-animations');
    }

    // 7. Theme color mode
    applyTheme(settings.appearance.colorMode);
  }, [settings.appearance.colorMode, settings.appearance.accentColor, settings.appearance.fontSize, settings.appearance.sidebarWidth, settings.appearance.density, settings.appearance.fontFamily, settings.appearance.animationsEnabled]);

  // Watch for system theme changes in real-time when 'auto' option is active
  useEffect(() => {
    if (settings.appearance.colorMode !== 'auto') return;

    const cleanup = watchSystemTheme((newTheme) => {
      applyTheme('auto');
      addToast(`Switched to ${newTheme} mode via System Preferences`, 'info');
    });

    return cleanup;
  }, [settings.appearance.colorMode, addToast]);

  const updateSetting = <T,>(path: string, value: T) => {
    setSettings((prev) => {
      const keys = path.split('.');
      const updated = { ...prev } as any;
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const resetProgress = () => {
    // Reset XP, levels, and streak counters in state and local storage
    const updatedUser = {
      ...state.user,
      xp: 0,
      level: 1,
      streak: 0,
      xpToNextLevel: 100,
    };
    updateUser(updatedUser);
    addToast("XP and Routine Streak reset accomplished! 🎯", "success");
  };

  const clearAllData = async () => {
    try {
      const { auth, db } = await import('../lib/firebase');
      const { doc, deleteDoc } = await import('firebase/firestore');
      if (auth.currentUser) {
        try {
          await deleteDoc(doc(db, 'users', auth.currentUser.uid));
        } catch (dbErr) {
          console.warn("Could not delete firestore user document, proceeding with signout:", dbErr);
        }
        await auth.signOut();
      }
    } catch (e) {
      console.error("Error during database cleanup:", e);
    } finally {
      localStorage.clear();
      // Re-init with defaults
      localStorage.setItem('anchor_onboarded', 'false');
      addToast("All data successfully cleared. Setting up character system...", "info");
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    }
  };

  const exportData = (): string => {
    const backupObj = {
      settings,
      anchors: state.anchors,
      quests: state.quests,
      brainDumps: state.brainDumps,
      user: state.user,
      timestamp: new Date().toISOString()
    };
    addToast("Configuration backup exported!", "success");
    return JSON.stringify(backupObj, null, 2);
  };

  const importData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.settings) {
        setSettings(deepMerge(defaultSettings, parsed.settings));
      }
      if (parsed.anchors) {
        setAnchors(parsed.anchors);
      }
      if (parsed.quests) {
        setQuests(parsed.quests);
      }
      if (parsed.brainDumps) {
        setBrainDumps(parsed.brainDumps);
      }
      if (parsed.user) {
        updateUser(parsed.user);
      }
      addToast("Routine history and options restored!", "success");
      return true;
    } catch (e) {
      addToast("Failed to parse Backup file. Ensure it is valid JSON.", "error");
      return false;
    }
  };

  const resetSection = (sectionKey: keyof SettingsType) => {
    setSettings((prev) => ({
      ...prev,
      [sectionKey]: defaultSettings[sectionKey]
    }));
    addToast(`Section default configuration restored!`, "success");
  };

  const addBlockedSite = (site: string) => {
    const cleaned = site.trim().toLowerCase();
    if (!cleaned) return;
    if (settings.focus.blockedSites.includes(cleaned)) {
      addToast(`${cleaned} is already registered on focus lists!`, "error");
      return;
    }
    updateSetting('focus.blockedSites', [...settings.focus.blockedSites, cleaned]);
    addToast(`${cleaned} locked under routine rules! 🔒`, "success");
  };

  const removeBlockedSite = (site: string) => {
    updateSetting('focus.blockedSites', settings.focus.blockedSites.filter(s => s !== site));
    addToast(`${site} removed from block filters.`, "info");
  };

  const addRecurringAnchor = (anchor: SettingsType['schedule']['recurringAnchors'][0]) => {
    updateSetting('schedule.recurringAnchors', [...settings.schedule.recurringAnchors, anchor]);
    addToast("Recurring schedule template saved!", "success");
  };

  const removeRecurringAnchor = (id: number) => {
    updateSetting('schedule.recurringAnchors', settings.schedule.recurringAnchors.filter(a => a.id !== id));
    addToast("Recurring template removed.", "info");
  };

  const addCategory = (cat: { name: string; color: string }) => {
    const newCat = {
      id: Date.now(),
      name: cat.name,
      color: cat.color
    };
    updateSetting('schedule.categories', [...settings.schedule.categories, newCat]);
    addToast(`Category ${cat.name} added!`, "success");
  };

  const updateCategory = (id: number, name: string) => {
    const nextCategories = settings.schedule.categories.map((c) => {
      if (c.id === id) {
        return { ...c, name };
      }
      return c;
    });
    updateSetting('schedule.categories', nextCategories);
    addToast("Category name modified!", "success");
  };

  const deleteCategory = (id: number) => {
    updateSetting('schedule.categories', settings.schedule.categories.filter(c => c.id !== id));
    addToast("Category deleted.", "info");
  };

  const logOutAllSessions = () => {
    updateSetting('profile.sessions', settings.profile.sessions.map((s) => {
      if (s.id === 1) return s; // keep current active
      return { ...s, active: false, lastSeen: "Disconnected" };
    }));
    addToast("Logged out of 2 secondary sessions ✓", "success");
  };

  const backupNow = () => {
    updateSetting('data.lastBackup', new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
    addToast("Backup configuration compressed!", "success");
  };

  const playToneNotification = (type = 'default') => {
    if (typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const lc = type.toLowerCase();
      if (lc === 'gentle') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      } else if (lc === 'ping') {
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
      } else if (lc === 'chime') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      } else if (lc === 'none') {
        return;
      } else { // default
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);
      }
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.24);
    } catch (e) {
      console.warn("AudioContext tone generation blocked by sandbox/user activity.", e);
    }
  };

  const playFocusOscillatorPreview = (type: string) => {
    if (typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      const lc = type.toLowerCase();
      if (lc === 'brown noise' || lc === 'white noise' || lc === 'forest' || lc === 'rain') {
        // Synthesizing soothing low frequency droning hum representing background audio
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 2.9);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(103, ctx.currentTime);
        osc2.frequency.linearRampToValueAtTime(83, ctx.currentTime + 2.9);
      } else if (lc === 'lofi beats' || lc === 'lofi') {
        // Gentle chord oscillations
        osc.type = 'sine';
        osc.frequency.setValueAtTime(146.83, ctx.currentTime); // D3
        osc.frequency.setValueAtTime(196.00, ctx.currentTime + 0.8); // G3
        osc.frequency.setValueAtTime(220.00, ctx.currentTime + 1.6); // A3
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(293.66, ctx.currentTime); // D4
        osc2.frequency.setValueAtTime(392.00, ctx.currentTime + 0.8); // G4
      } else {
        // Standard hum
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
      }

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 3);
      
      osc.start();
      osc2.start();
      osc.stop(ctx.currentTime + 3);
      osc2.stop(ctx.currentTime + 3);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      resetProgress,
      clearAllData,
      exportData,
      importData,
      resetSection,
      addBlockedSite,
      removeBlockedSite,
      addRecurringAnchor,
      removeRecurringAnchor,
      addCategory,
      updateCategory,
      deleteCategory,
      logOutAllSessions,
      backupNow,
      playToneNotification,
      playFocusOscillatorPreview
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
