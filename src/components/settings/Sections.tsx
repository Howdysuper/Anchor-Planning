import React, { useState, useEffect, useRef } from 'react';
import { useSettings, SettingsType } from '../../contexts/SettingsContext';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import {
  User, Bell, Anchor, Moon, Trophy, Palette, Shield, Focus, Database, 
  Plug, HelpCircle, AlertTriangle, Check, X, ShieldAlert, Key, 
  Download, Upload, Heart, Info, ChevronRight, Play, Eye, EyeOff, 
  Trash2, Plus, Copy, Lock, Sparkles, MessageSquare, Star, Edit3, Calendar, Clock
} from 'lucide-react';

import { SettingsCard } from './SettingsCard';
import { SettingsRow } from './SettingsRow';
import { SettingsToggle } from './SettingsToggle';
import { SettingsSlider } from './SettingsSlider';
import { SettingsDropdown } from './SettingsDropdown';
import { ColorPicker } from './ColorPicker';
import { TimePicker } from './TimePicker';
import { ConfirmationModal } from './ConfirmationModal';
import { ThemeCards } from './ThemeCards';
import { ThemeStatusPill } from './ThemeStatusPill';
import Modal from '../ui/Modal';

// --- SECTION 1: PROFILE & ACCOUNT ===
import AvatarWithCosmetic from '../ui/AvatarWithCosmetic';

export function ProfileSettings() {
  const { settings, updateSetting, logOutAllSessions } = useSettings();
  const { updateUser, state, resetStatistics } = useApp();
  const { addToast } = useToast();
  
  const handleResetStatistics = () => {
    if (confirm("Are you sure you want to permanently erase your statistics? This cannot be undone.")) {
      resetStatistics();
      addToast("Statistics successfully erased.", "success");
    }
  };

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Name states
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(settings.profile.displayName);

  // Username States
  const [username, setUsername] = useState(settings.profile.username);
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'checking' | 'idle'>('idle');

  // Email States
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(settings.profile.email);

  useEffect(() => {
    setTempName(settings.profile.displayName);
  }, [settings.profile.displayName]);

  useEffect(() => {
    setUsername(settings.profile.username);
  }, [settings.profile.username]);

  useEffect(() => {
    setTempEmail(settings.profile.email);
  }, [settings.profile.email]);

  // Password States
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Username validation simulation (debounce)
  useEffect(() => {
    if (!username) {
      setUsernameStatus('idle');
      return;
    }
    // Clean input
    const cleaned = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleaned !== username) setUsername(cleaned);
    
    setUsernameStatus('checking');
    const timer = setTimeout(() => {
      if (cleaned.length < 3) {
        setUsernameStatus('idle');
      } else {
        setUsernameStatus('available');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSaveName = () => {
    if (!tempName.trim()) {
      addToast("Display name cannot be empty", "error");
      return;
    }
    updateSetting('profile.displayName', tempName);
    updateUser({ name: tempName });
    setIsEditingName(false);
    addToast("Display Name updated!", "success");
  };

  const handleSaveUsername = () => {
    if (usernameStatus === 'available') {
      updateSetting('profile.username', username);
      addToast(`Username changed to @${username}`, "success");
    } else {
      addToast("Username is not available", "error");
    }
  };

  const handleSaveEmail = () => {
    if (!tempEmail.includes('@')) {
      addToast("Invalid email address format", "error");
      return;
    }
    updateSetting('profile.email', tempEmail);
    setIsEditingEmail(false);
    addToast("Confirmation link dispatched to your inbox!", "success");
  };

  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, label: 'None', color: 'bg-transparent' };
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/\d/.test(newPassword)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score++;
    if (/[A-Z]/.test(newPassword)) score++;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-[#F76F6F]' };
    if (score === 2) return { score, label: 'Fair', color: 'bg-[#F7A06F]' };
    if (score === 3) return { score, label: 'Good', color: 'bg-[#F7D96F]' };
    return { score, label: 'Strong', color: 'bg-[#6FF7A0]' };
  };

  const passStrength = getPasswordStrength();
  const isPassValid = newPassword.length >= 8 && /\d/.test(newPassword) && /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) && newPassword === confirmPassword;

  const handleUpdatePassword = () => {
    addToast("Password changed successfully ✓", "success");
    setIsPasswordModalOpen(false);
    setCurrPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const avatarsList = [
    '⚡', '🧬', '👾', '🚀', '🔮', '🍀', '🍕', '🐱'
  ];

  const handleRandomAvatar = () => {
    const rand = avatarsList[Math.floor(Math.random() * avatarsList.length)];
    // Update global state and context
    updateSetting('profile.avatarType', 'letter');
    updateSetting('profile.avatarImage', null);
    
    // Push updates up
    updateUser({ avatar: rand });
    setIsPhotoModalOpen(false);
    addToast(`Avatar randomized to ${rand}!`, "success");
  };

  const copyUserId = () => {
    navigator.clipboard.writeText("UID-2026-ANCHOR-SH7C");
    addToast("User ID Copied to clipboard ✓", "success");
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Account</h2>
        <p className="text-[14px] text-[#888888] mt-1.5">Manage your credentials, security levels, plan tiers, and logins.</p>
      </div>

      <SettingsCard title="Password & Authorization Settings">
        {/* Change Password */}
        <SettingsRow icon={<Key size={18} />} title="Security Passcode" description="Manage passcodes required for browser lockouts.">
          <button 
            onClick={() => setIsPasswordModalOpen(true)}
            className="h-[36px] px-4 bg-[#1E1E1E] hover:bg-[#252525] text-xs font-bold text-[#7C6FF7] border border-[rgba(255,255,255,0.04)] rounded-[8px] transition-all"
          >
            Update Passcode
          </button>
        </SettingsRow>

        {/* Sessions list */}
        <SettingsRow 
          icon={<Info size={18} />} 
          title="Active Devices" 
          description="Monitored hardware logged into this profile."
          isExpanded={true}
          expandedContent={
            <div className="flex flex-col gap-3 pt-2">
              <div className="space-y-2.5">
                {settings.profile.sessions.map((sess) => (
                  <div key={sess.id} className="flex justify-between items-center bg-[#151515] p-3 rounded-[12px] border border-[rgba(255,255,255,0.02)]">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${sess.active ? 'bg-[#6FF7A0] animate-pulse' : 'bg-zinc-600'}`} />
                      <span className="text-[13.5px] font-bold text-[#E0E0E0]">{sess.device}</span>
                    </div>
                    <span className="text-xs text-[#888888] font-medium">{sess.lastSeen}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={logOutAllSessions}
                className="mt-3 w-full sm:w-auto self-start h-[44px] px-6 bg-[#F76F6F] hover:bg-[#e05e5e] text-[#0A0A0A] rounded-xl text-[13.5px] font-bold transition-all shadow-[0_4px_16px_rgba(247,111,111,0.2)]"
              >
                Log Out All Other Devices
              </button>
            </div>
          }
        />
      </SettingsCard>

      <SettingsCard title="Actions">
        <SettingsRow icon={<AlertTriangle size={18} className="text-[#F76F6F]" />} title="System Departure" description="Log out of your current session on this device.">
          <button 
            onClick={() => {
              import('../../lib/firebase').then(({ logout }) => {
                logout().then(() => {
                  addToast("Successfully logged out.", "success");
                }).catch(() => {
                  addToast("Failed to log out.", "error");
                });
              });
            }}
            className="h-[36px] px-4 bg-transparent border border-[#F76F6F]/40 hover:bg-[#F76F6F]/10 text-[#F76F6F] font-bold text-xs rounded-[8px] transition-all cursor-pointer"
          >
            Log Out
          </button>
        </SettingsRow>
        <SettingsRow icon={<AlertTriangle size={18} className="text-error" />} title="Erase Statistics" description="Permanently reset your XP to 0 and Sleep Score to 100.">
          <button 
            onClick={handleResetStatistics}
            className="h-[36px] px-4 bg-error hover:bg-error/90 text-white font-bold text-xs rounded-[8px] transition-all cursor-pointer shadow-md"
          >
            Erase Statistics
          </button>
        </SettingsRow>
      </SettingsCard>

      {/* UPDATE PASSWORD MODAL */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Update Account Password">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-zinc-500 uppercase">Current Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={currPassword}
              onChange={(e) => setCurrPassword(e.target.value)}
              className="bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] px-4 py-2.5 rounded-[12px] text-[14px] text-white"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-zinc-500 uppercase">New Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] px-4 py-2.5 rounded-[12px] text-[14px] text-white"
            />
            {newPassword && (
              <div className="mt-1.5 flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold text-[#888888]">
                  <span>Strength Rating: {passStrength.label}</span>
                </div>
                <div className="h-1 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden flex gap-0.5">
                  <div className={`h-full ${passStrength.color} flex-1`} style={{ opacity: passStrength.score >= 1 ? 1 : 0.25 }} />
                  <div className={`h-full ${passStrength.color} flex-1`} style={{ opacity: passStrength.score >= 2 ? 1 : 0.25 }} />
                  <div className={`h-full ${passStrength.color} flex-1`} style={{ opacity: passStrength.score >= 3 ? 1 : 0.25 }} />
                  <div className={`h-full ${passStrength.color} flex-1`} style={{ opacity: passStrength.score >= 4 ? 1 : 0.25 }} />
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-zinc-500 uppercase">Confirm New Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] px-4 py-2.5 rounded-[12px] text-[14px] text-white"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="text-[11px] font-bold text-[#7C6FF7] text-left self-start hover:underline px-1 py-0.5"
          >
            {showPass ? 'Hide passwords' : 'Show passwords'}
          </button>

          <button
            onClick={handleUpdatePassword}
            disabled={!isPassValid}
            className="mt-2 h-[48px] w-full bg-[#7C6FF7] disabled:bg-[#1E1E1E] disabled:text-[#444] text-[#0A0A0A] disabled:cursor-not-allowed rounded-[12px] font-bold text-[14px] transition-all"
          >
            Update Password Code
          </button>
        </div>
      </Modal>
    </div>
  );
}


// --- SECTION 2: NOTIFICATIONS ===
export function NotificationSettings() {
  const { settings, updateSetting, playToneNotification } = useSettings();
  const { addToast } = useToast();

  const handleToggleMaster = (checked: boolean) => {
    updateSetting('notifications.masterEnabled', checked);
    addToast(checked ? "Universal notifications enabled!" : "All notifications muted.", checked ? "success" : "info");
  };

  const handleSoundPreview = () => {
    playToneNotification(settings.notifications.sound.type);
    addToast(`Playing sound preview: "${settings.notifications.sound.type}"`, "info");
  };

  const isDimmable = !settings.notifications.masterEnabled;

  const styleOptions = [
    { label: 'Default Chime', value: 'default' },
    { label: 'Gentle Sweep', value: 'gentle' },
    { label: 'Ping High-Density', value: 'ping' },
    { label: 'Chime Staccato', value: 'chime' },
    { label: 'No Audio', value: 'none' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Notifications</h2>
        <p className="text-[14px] text-[#888888] mt-1.5 font-medium">Control routine reminders, quest alert countdowns, and noise triggers.</p>
      </div>

      {/* Big prominent master card */}
      <div className="relative p-[1px] rounded-[24px] bg-gradient-to-br from-[#7C6FF7]/30 to-[rgba(255,255,255,0.01)] mb-6 shadow-xl">
        <div className="bg-[#141414] rounded-[23px] p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-[16px] font-bold text-[#F0F0F0]">Master Toggle</h3>
            <p className="text-[13px] text-[#888888] mt-0.5 leading-relaxed">Instantly enable/disable notifications for all devices globally.</p>
          </div>
          <SettingsToggle checked={settings.notifications.masterEnabled} onChange={handleToggleMaster} />
        </div>
      </div>

      {isDimmable && (
        <div className="bg-[rgba(247,111,111,0.06)] border border-[rgba(247,111,111,0.2)] p-4 rounded-[16px] mb-6 flex items-center gap-3">
          <ShieldAlert size={18} className="text-[#F76F6F]" />
          <span className="text-xs font-bold text-[#F76F6F] uppercase tracking-wide">
            Note: All notifications below are currently disabled by the master toggle.
          </span>
        </div>
      )}

      <div className={isDimmable ? 'opacity-50 pointer-events-none transition-opacity duration-300' : 'transition-opacity duration-300'}>
        <SettingsCard title="Anchor Check-In nudges">
          {/* Morning Check-In */}
          <SettingsRow 
            icon={<Bell size={18} />} 
            title="Morning Check-In" 
            description="Review scheduled anchors at wake-up trigger times."
            isExpanded={settings.notifications.morningCheckin.enabled}
            expandedContent={
              <div className="flex items-center justify-between gap-4 py-1 animate-in fade-in duration-100">
                <span className="text-xs font-bold text-[#888888]">TRIGGER HOUR</span>
                <TimePicker 
                  value={settings.notifications.morningCheckin.time} 
                  onChange={(val) => updateSetting('notifications.morningCheckin.time', val)} 
                />
              </div>
            }
          >
            <SettingsToggle 
              checked={settings.notifications.morningCheckin.enabled} 
              onChange={(checked) => updateSetting('notifications.morningCheckin.enabled', checked)} 
            />
          </SettingsRow>

          {/* Bedtime Reminder */}
          <SettingsRow 
            icon={<Moon size={18} />} 
            title="Bedtime Alert" 
            description="Wind-down alerts pushed before target bedtime hours."
            isExpanded={settings.notifications.bedtimeReminder.enabled}
            expandedContent={
              <div className="flex items-center justify-between gap-4 py-1">
                <span className="text-xs font-bold text-[#888888]">MARGIN TIME</span>
                <SettingsDropdown
                  options={[
                    { label: '15 Min Lead', value: 15 },
                    { label: '30 Min Lead', value: 30 },
                    { label: '45 Min Lead', value: 45 },
                    { label: '60 Min Lead', value: 60 },
                  ]}
                  value={settings.notifications.bedtimeReminder.minutesBefore}
                  onChange={(val) => updateSetting('notifications.bedtimeReminder.minutesBefore', val)}
                />
              </div>
            }
          >
            <SettingsToggle 
              checked={settings.notifications.bedtimeReminder.enabled} 
              onChange={(checked) => updateSetting('notifications.bedtimeReminder.enabled', checked)} 
            />
          </SettingsRow>

          {/* Breakfast Nudge */}
          <SettingsRow 
            icon={<Bell size={18} />} 
            title="Breakfast Nudge" 
            description="Fires on actual calculated waking hour, not at a fixed timezone."
          >
            <SettingsToggle 
              checked={settings.notifications.breakfastNudge.enabled} 
              onChange={(checked) => updateSetting('notifications.breakfastNudge.enabled', checked)} 
            />
          </SettingsRow>

          {/* Phone Down alert */}
          <SettingsRow 
            icon={<Shield size={18} />} 
            title="Phone Down Alert" 
            description="Fires exactly when routines mark bedtime focus triggers."
          >
            <SettingsToggle 
              checked={settings.notifications.phoneDownAlert.enabled} 
              onChange={(checked) => updateSetting('notifications.phoneDownAlert.enabled', checked)} 
            />
          </SettingsRow>
        </SettingsCard>

        <SettingsCard title="Quests & Task summaries">
          {/* Quest completion celebrations */}
          <SettingsRow 
            icon={<Trophy size={18} />} 
            title="Quest Completion celebrations" 
            description="Unlocks visual and sound celebratory bursts on task finish."
          >
            <SettingsToggle 
              checked={settings.notifications.questCompletionCelebration.enabled} 
              onChange={(checked) => updateSetting('notifications.questCompletionCelebration.enabled', checked)} 
            />
          </SettingsRow>

          {/* Daily Quest Summary */}
          <SettingsRow 
            icon={<Info size={18} />} 
            title="Daily Quest recap" 
            description="End-of-day summary of accomplishments and levels."
            isExpanded={settings.notifications.dailySummary.enabled}
            expandedContent={
              <div className="flex items-center justify-between gap-4 py-1">
                <span className="text-xs font-bold text-[#888888]">SUMMARY DISPATCH TIME</span>
                <TimePicker 
                  value={settings.notifications.dailySummary.time} 
                  onChange={(val) => updateSetting('notifications.dailySummary.time', val)} 
                />
              </div>
            }
          >
            <SettingsToggle 
              checked={settings.notifications.dailySummary.enabled} 
              onChange={(checked) => updateSetting('notifications.dailySummary.enabled', checked)} 
            />
          </SettingsRow>
        </SettingsCard>

        <SettingsCard title="Notifications Audio & Styles">
          {/* Notification Sound */}
          <SettingsRow 
            icon={<Bell size={18} />} 
            title="Chime Audio Palette" 
            description="Sound triggered on alert completion events."
          >
            <div className="flex items-center gap-3">
              <SettingsDropdown
                options={styleOptions}
                value={settings.notifications.sound.type}
                onChange={(val) => updateSetting('notifications.sound.type', val)}
              />
              <button
                type="button"
                onClick={handleSoundPreview}
                className="p-2.5 bg-[#1E1E1E] hover:bg-[#252525] rounded-[10px] border border-[rgba(255,255,255,0.06)] text-white hover:text-[#7C6FF7] transition-all"
                title="Preview sound chime"
              >
                <Play size={15} />
              </button>
            </div>
          </SettingsRow>

          {/* Vibration */}
          <SettingsRow icon={<Bell size={18} />} title="Mobile Haptics" description="Toggle phone vibration elements (applicable on mobile).">
            <SettingsToggle 
              checked={settings.notifications.vibration.enabled} 
              onChange={(checked) => updateSetting('notifications.vibration.enabled', checked)} 
            />
          </SettingsRow>

          {/* Quiet Hours */}
          <SettingsRow 
            icon={<Lock size={18} />} 
            title="Do Not Disturb (Quiet Hours)" 
            description="Temporarily mute all sound/haptic triggers during designated study/sleep slots."
            isExpanded={settings.notifications.quietHours.enabled}
            expandedContent={
              <div className="flex flex-col gap-3 py-1 bg-black/10 rounded-lg p-2 filter brightness-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#888888]">MUTING TIMEFRAME</span>
                  <div className="flex items-center gap-2">
                    <TimePicker 
                      value={settings.notifications.quietHours.from} 
                      onChange={(v) => updateSetting('notifications.quietHours.from', v)} 
                    />
                    <span className="text-xs text-zinc-500">to</span>
                    <TimePicker 
                      value={settings.notifications.quietHours.to} 
                      onChange={(v) => updateSetting('notifications.quietHours.to', v)} 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-xs font-bold text-[#888888] uppercase tracking-wide">ACTIVE DAYS</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
                      const isActive = settings.notifications.quietHours.days.includes(day);
                      return (
                        <button
                          key={day}
                          onClick={() => {
                            const next = isActive
                              ? settings.notifications.quietHours.days.filter((d) => d !== day)
                              : [...settings.notifications.quietHours.days, day];
                            updateSetting('notifications.quietHours.days', next);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                            isActive 
                              ? 'bg-[#7C6FF7] text-[#0A0A0A]' 
                              : 'bg-[#1A1A1A] text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {day[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            }
          >
            <SettingsToggle 
              checked={settings.notifications.quietHours.enabled} 
              onChange={(checked) => updateSetting('notifications.quietHours.enabled', checked)} 
            />
          </SettingsRow>
        </SettingsCard>
      </div>
    </div>
  );
}


// --- SECTION 3: ANCHOR & SCHEDULE ===
export function ScheduleSettings() {
  const { settings, updateSetting, addCategory, updateCategory, deleteCategory } = useSettings();
  const { addToast } = useToast();

  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#7C6FF7');
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editingCatText, setEditingCatText] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const tz = settings.schedule.timezone || 'UTC';
        const formatted = new Date().toLocaleTimeString('en-US', {
          timeZone: tz,
          hour12: settings.schedule.timeFormat === '12hr',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        setCurrentTime(formatted);
      } catch (e) {
        setCurrentTime(new Date().toLocaleTimeString());
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [settings.schedule.timezone, settings.schedule.timeFormat]);

  const timezonesList = [
    { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
    { label: 'EST / EDT (New York / Eastern)', value: 'America/New_York' },
    { label: 'PST / PDT (Los Angeles / Pacific)', value: 'America/Los_Angeles' },
    { label: 'GMT / BST (London / Greenwich)', value: 'Europe/London' },
    { label: 'CET / CEST (Paris / Central European)', value: 'Europe/Paris' },
    { label: 'IST (India Standard Time)', value: 'Asia/Kolkata' },
    { label: 'JST (Japan Standard Time)', value: 'Asia/Tokyo' },
    { label: 'AEST / AEDT (Sydney / Australian)', value: 'Australia/Sydney' },
  ];

  const handleAddNewCategory = () => {
    if (!newCatName.trim()) {
      addToast("Enter a category name", "error");
      return;
    }
    addCategory({ name: newCatName.trim(), color: newCatColor });
    setNewCatName('');
  };

  const startEditCat = (id: number, initial: string) => {
    setEditingCatId(id);
    setEditingCatText(initial);
  };

  const handleSaveCatName = (id: number) => {
    if (!editingCatText.trim()) return;
    updateCategory(id, editingCatText.trim());
    setEditingCatId(null);
  };

  const categoryOptions = [
    '#7C6FF7', '#6FBBF7', '#6FF7A0', '#F7A06F', '#F76FC8', '#F76F6F', '#F7D96F', '#E0E0E0'
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Schedule & Timeblocks</h2>
        <p className="text-[14px] text-[#888888] mt-1.5">Manage default calendars, automatic buffering, and color categories.</p>
      </div>

      <SettingsCard title="Time Formats & Conventions">
        {/* Default Week Start */}
        <SettingsRow icon={<Calendar size={18} />} title="Default Week Start" description="Set calendar rows alignment preference.">
          <SettingsDropdown
            options={[
              { label: 'Monday First', value: 'monday' },
              { label: 'Sunday First', value: 'sunday' },
            ]}
            value={settings.schedule.weekStart}
            onChange={(val) => updateSetting('schedule.weekStart', val)}
          />
        </SettingsRow>

        {/* Time formatting */}
        <SettingsRow icon={<Clock size={18} />} title="Time Display Format" description="Set visual clock representation.">
          <div className="flex gap-2">
            {[
              { id: '12hr', label: '12 Hour (AM/PM)' },
              { id: '24hr', label: '24 Hour' }
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => updateSetting('schedule.timeFormat', fmt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  settings.schedule.timeFormat === fmt.id
                    ? 'bg-[rgba(124,111,247,0.12)] text-[#7C6FF7] border-[#7C6FF7]'
                    : 'bg-[#1E1E1E] text-zinc-500 border-transparent hover:text-white'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </SettingsRow>

        {/* Date Format */}
        <SettingsRow icon={<Calendar size={18} />} title="Date System Format" description="Adjust standard dates visualization models.">
          <SettingsDropdown
            options={[
              { label: 'MM / DD / YYYY', value: 'MM/DD/YYYY' },
              { label: 'DD / MM / YYYY', value: 'DD/MM/YYYY' },
              { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
            ]}
            value={settings.schedule.dateFormat}
            onChange={(val) => updateSetting('schedule.dateFormat', val)}
          />
        </SettingsRow>

        {/* Time Zone */}
        <SettingsRow icon={<Clock size={18} />} title="System Time Zone" description="Configure active timezone used for scheduling & clocks.">
          <SettingsDropdown
            options={timezonesList}
            value={settings.schedule.timezone || 'UTC'}
            onChange={(val) => updateSetting('schedule.timezone', val)}
          />
        </SettingsRow>

        {/* Live Clock Display */}
        <div className="mx-5 mb-5 p-4 bg-[#141414] rounded-xl border border-[rgba(255,255,255,0.03)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#6FF7A0] animate-pulse" />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Synchronized Network Time</span>
          </div>
          <span className="text-sm font-mono font-bold text-[#6FF7A0]">{currentTime || 'Loading...'}</span>
        </div>
      </SettingsCard>

      <SettingsCard title="Buffer Space Calculations">
        {/* Minimum Break Between Events */}
        <SettingsRow 
          icon={<Clock size={18} />} 
          title="Minimum Buffer Gap" 
          description="Automatic layout margins inserted between sequential events."
        >
          <SettingsSlider
            min={0}
            max={60}
            step={5}
            value={settings.schedule.minBreakMinutes}
            onChange={(v) => updateSetting('schedule.minBreakMinutes', v)}
            formatValue={(v) => `${v} Min`}
          />
        </SettingsRow>

        {/* Free buffer block creation */}
        <SettingsRow icon={<Calendar size={18} />} title="Auto Buffer Gaps" description="Automatically inserts dragging buffers inside empty scheduler hours.">
          <SettingsToggle 
            checked={settings.schedule.autoBufferBlocks} 
            onChange={(checked) => updateSetting('schedule.autoBufferBlocks', checked)} 
          />
        </SettingsRow>

        {/* Weekends Override block */}
        <SettingsRow 
          icon={<Calendar size={18} />} 
          title="Weekend Override schedules" 
          description="Designate separate wake and bedtime calendars for Saturdays and Sundays."
          isExpanded={settings.schedule.weekendsOverride}
          expandedContent={
            <div className="flex flex-col gap-3 py-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#888888]">WEEKEND WAKE UP</span>
                <TimePicker 
                  value={settings.schedule.weekendWakeTime} 
                  onChange={(v) => updateSetting('schedule.weekendWakeTime', v)} 
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#888888]">WEEKEND BEDTIME</span>
                <TimePicker 
                  value={settings.schedule.weekendBedtime} 
                  onChange={(v) => updateSetting('schedule.weekendBedtime', v)} 
                />
              </div>
            </div>
          }
        >
          <SettingsToggle 
            checked={settings.schedule.weekendsOverride} 
            onChange={(checked) => updateSetting('schedule.weekendsOverride', checked)} 
          />
        </SettingsRow>
      </SettingsCard>

      <SettingsCard title="Categories & Tag management">
        {/* Category manager rendering */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2.5">
            {settings.schedule.categories.map((cat) => (
              <div 
                key={cat.id} 
                className="flex items-center gap-2.5 bg-[#1C1C1C] border border-[rgba(255,255,255,0.04)] px-3 py-1.5 rounded-xl text-xs font-bold"
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                {editingCatId === cat.id ? (
                  <input
                    type="text"
                    value={editingCatText}
                    onChange={(e) => setEditingCatText(e.target.value)}
                    onBlur={() => handleSaveCatName(cat.id)}
                    className="bg-[#141414] border border-[#7C6FF7] text-[11.5px] rounded px-1.5 py-0.5 outline-none max-w-[80px]"
                    autoFocus
                  />
                ) : (
                  <span className="text-zinc-200">{cat.name}</span>
                )}
                <div className="flex gap-1 border-l border-zinc-800 pl-2">
                  <button onClick={() => startEditCat(cat.id, cat.name)} className="text-[#888888] hover:text-[#7C6FF7]"><Edit3 size={11} /></button>
                  <button onClick={() => deleteCategory(cat.id)} className="text-[#888888] hover:text-[#F76F6F]"><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-[rgba(255,255,255,0.06)] my-1" />

          {/* New category box */}
          <div className="flex flex-col gap-3.5 bg-black/10 rounded-xl p-3 border border-[rgba(255,255,255,0.02)]">
            <span className="text-xs font-bold text-zinc-400">CREATE NEW CATEGORY TAG</span>
            <div className="flex gap-3 flex-wrap sm:flex-nowrap">
              <input
                type="text"
                placeholder="e.g. Creativity, Errand..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] px-3 py-2 rounded-[10px] text-xs font-medium outline-none text-white focus:border-[#7C6FF7]"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                {categoryOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setNewCatColor(opt)}
                    className="w-5 h-5 rounded-full relative"
                    style={{ backgroundColor: opt }}
                  >
                    {newCatColor === opt && <div className="absolute inset-0 bg-white/20 flex items-center justify-center text-zinc-900 font-bold text-[10px]">&bull;</div>}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleAddNewCategory}
                className="h-[34px] px-4 bg-[#7C6FF7] hover:bg-[#6b5ee6] text-[#0A0A0A] font-bold text-xs rounded-[8px] flex items-center gap-1 cursor-pointer transition-all shrink-0"
              >
                <Plus size={12} /> Add
              </button>
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}


// --- SECTION 4: SLEEP ===
export function SleepSettings() {
  const { settings, updateSetting } = useSettings();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Sleep Intel</h2>
        <p className="text-[14px] text-[#888888] mt-1.5 font-medium">Configure circadian battery targets, sleep journaling, and index score metrics.</p>
      </div>

      <SettingsCard title="Target Metrics">
        {/* Sleep duration */}
        <SettingsRow icon={<Moon size={18} />} title="Target Duration" description="Daily sleep hours objective. Recommended: 8-9 hours for teens.">
          <div className="flex flex-col gap-2.5 items-start lg:items-end w-full lg:w-auto">
            <SettingsSlider
              min={5}
              max={10}
              step={0.5}
              value={settings.sleep.targetHours}
              onChange={(v) => updateSetting('sleep.targetHours', v)}
              formatValue={(v) => `${v} Hours`}
            />
            {/* Color spectrum visualization */}
            <div className="h-1 w-full lg:w-64 bg-gradient-to-r from-[#F76F6F] via-[#F7A06F] to-[#6FF7A0] rounded-full overflow-hidden flex">
              <div className="flex-1 border-r border-[#0A0A0A]" title="Red (<6)" />
              <div className="flex-1 border-r border-[#0A0A0A]" title="Orange (6-7)" />
              <div className="flex-1" title="Green (7-9)" />
            </div>
          </div>
        </SettingsRow>

        {/* Bedtime */}
        <SettingsRow icon={<Moon size={18} />} title="Ideal Bedtime Target" description="Target hour to start wind-down routines.">
          <TimePicker 
            value={settings.sleep.idealBedtime} 
            onChange={(val) => updateSetting('sleep.idealBedtime', val)} 
          />
        </SettingsRow>

        {/* Wake time */}
        <SettingsRow icon={<Moon size={18} />} title="Target Wake Time" description="Optimal hour to initiate the morning loadout.">
          <TimePicker 
            value={settings.sleep.targetWakeTime} 
            onChange={(val) => updateSetting('sleep.targetWakeTime', val)} 
          />
        </SettingsRow>
      </SettingsCard>
    </div>
  );
}


// --- SECTION 5: GAMIFICATION & XP ===
export function GamificationSettings() {
  const { settings, updateSetting, resetSection } = useSettings();

  const xpValues = settings.gamification.xpValues;
  const predictedDailyXp = xpValues.questComplete + xpValues.breakfast + xpValues.sleepTarget + xpValues.loadoutComplete;

  // Render last 7 days of XP logs as a stylized mini CSS bar-chart layout
  const barData = [15, 30, 45, 10, 60, 40, 55];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Gamification & XP</h2>
        <p className="text-[14px] text-[#888888] mt-1.5">Tune XP values, streak freeze rules, level notifications, and view logs history.</p>
      </div>

      <SettingsCard title="XP Point Formulas">
        {/* Prediction info row */}
        <div className="p-4 bg-[rgba(124,111,247,0.06)] border-b border-[rgba(255,255,255,0.04)] px-5 text-[13px] text-[#888888] font-semibold flex justify-between items-center">
          <span>Complete all daily anchors predicted yield:</span>
          <span className="text-[#7C6FF7] font-bold font-mono">~{predictedDailyXp} XP / Day</span>
        </div>

        {/* Quest Complete */}
        <SettingsRow icon={<Trophy size={18} />} title="Quest Completion base XP" description="Standard point payout for clearing a dashboard task.">
          <input
            type="number"
            min={0}
            max={100}
            step={5}
            value={xpValues.questComplete}
            onChange={(e) => updateSetting('gamification.xpValues.questComplete', parseInt(e.target.value, 10) || 0)}
            className="w-20 bg-[#1E1E1E] text-white border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-[10px] text-center font-bold outline-none"
          />
        </SettingsRow>

        {/* Breakfast */}
        <SettingsRow icon={<Trophy size={18} />} title="Nutrition Log payout" description="Points rewarded for logging morning fuel triggers.">
          <input
            type="number"
            min={0}
            max={100}
            step={5}
            value={xpValues.breakfast}
            onChange={(e) => updateSetting('gamification.xpValues.breakfast', parseInt(e.target.value, 10) || 0)}
            className="w-20 bg-[#1E1E1E] text-white border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-[10px] text-center font-bold outline-none"
          />
        </SettingsRow>

        {/* Sleep Target */}
        <SettingsRow icon={<Trophy size={18} />} title="Circadian target payout" description="Points rewarded for aligning schedule with sleep limits.">
          <input
            type="number"
            min={0}
            max={100}
            step={5}
            value={xpValues.sleepTarget}
            onChange={(e) => updateSetting('gamification.xpValues.sleepTarget', parseInt(e.target.value, 10) || 0)}
            className="w-20 bg-[#1E1E1E] text-white border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-[10px] text-center font-bold outline-none"
          />
        </SettingsRow>

        {/* Loadout complete */}
        <SettingsRow icon={<Trophy size={18} />} title="Pack Loadout completion" description="Points rewarded for sliding off all item checklist anchors.">
          <input
            type="number"
            min={0}
            max={100}
            step={5}
            value={xpValues.loadoutComplete}
            onChange={(e) => updateSetting('gamification.xpValues.loadoutComplete', parseInt(e.target.value, 10) || 0)}
            className="w-20 bg-[#1E1E1E] text-white border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-[10px] text-center font-bold outline-none"
          />
        </SettingsRow>
      </SettingsCard>

      <SettingsCard title="Sensory & Tactile Feeback">
        {/* Device Level Haptics for completion */}
        <SettingsRow 
          icon={<Trophy size={18} />} 
          title="Habit Completion Haptic Feedback" 
          description="Provides a satisfying tactile vibration on your device when crossing off habits or quests."
        >
          <SettingsToggle 
            checked={settings.gamification.habitCompletionHaptics || false} 
            onChange={(checked) => updateSetting('gamification.habitCompletionHaptics', checked)} 
          />
        </SettingsRow>
      </SettingsCard>

      <SettingsCard title="Streak Protect configurations">
        {/* Streak Freeze */}
        <SettingsRow icon={<Shield size={18} />} title="Streak Freeze shields" description="Grants one routine bypass pass per week. Frozen shields left: 1/1.">
          <SettingsToggle 
            checked={settings.gamification.streakFreeze} 
            onChange={(checked) => updateSetting('gamification.streakFreeze', checked)} 
          />
        </SettingsRow>

      </SettingsCard>

      <SettingsCard title="XP Point History Charts">
        <div className="p-5 flex flex-col gap-4">
          <span className="text-xs font-bold text-zinc-400 block uppercase">Last 7 Days Yield</span>
          {/* Aesthetic mini CSS bar-chart layout */}
          <div className="flex h-32 items-end gap-3 px-3 border-b border-[rgba(255,255,255,0.06)] pb-2 pt-2 select-none">
            {barData.map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div 
                  className="w-full bg-[#7C6FF7]/80 hover:bg-[#7C6FF7] rounded-t-md transition-all relative duration-300"
                  style={{ height: `${(val / 70) * 100}%` }}
                >
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] px-1.5 py-0.5 rounded text-[9.5px] text-[#F0F0F0] opacity-0 group-hover:opacity-100 transition-opacity font-mono whitespace-nowrap">
                    {val} XP
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#888888] mt-2 block">{dayNames[idx]}</span>
              </div>
            ))}
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}


// --- SECTION 6: APPEARANCE ===
export function AppearanceSettings() {
  const { settings, updateSetting } = useSettings();

  const handleAccentChange = (hex: string) => {
    updateSetting('appearance.accentColor', hex);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Appearance</h2>
        <p className="text-[14px] text-[#888888] mt-1.5 font-medium">Fine-tune the custom OLED interface layout, spacing, scale, and colors.</p>
      </div>

      <SettingsCard title="Visual design themes">
        {/* Theme mode selection cards */}
        <div className="p-5 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4 w-full border-b border-[rgba(255,255,255,0.04)] pb-4">
            <div className="flex flex-col text-left">
              <span className="text-[15px] font-semibold text-[#F0F0F0] leading-snug">Color Mode</span>
              <span className="text-[13px] text-[#888888] mt-1">Choose how Anchor looks on your screen</span>
            </div>
            <ThemeStatusPill />
          </div>
          <ThemeCards />
        </div>

        {/* Theme accent color swatch row */}
        <div className="p-5 border-t border-[rgba(255,255,255,0.04)]">
          <span className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-3.5">Primary Accent Color</span>
          <ColorPicker value={settings.appearance.accentColor} onChange={handleAccentChange} />
        </div>
      </SettingsCard>



      <SettingsCard title="UI animation engines">
        {/* Enable animations */}
        <SettingsRow icon={<Palette size={18} />} title="Enable interface animations" description="Fluid motion frames, transitions, scaling checklist effects.">
          <SettingsToggle 
            checked={settings.appearance.animationsEnabled} 
            onChange={(checked) => updateSetting('appearance.animationsEnabled', checked)} 
          />
        </SettingsRow>

        {/* Reduced motion override */}
        <SettingsRow icon={<Palette size={18} />} title="Reduced motion" description="Only apply subtle fades, bypassing aggressive scaling/slide motions.">
          <SettingsToggle 
            checked={settings.appearance.reducedMotion} 
            onChange={(checked) => updateSetting('appearance.reducedMotion', checked)} 
          />
        </SettingsRow>
      </SettingsCard>
    </div>
  );
}

// --- SECTION 8: FOCUS & BLOCKING ===
export function FocusSettings() {
  const { settings, updateSetting, addBlockedSite, removeBlockedSite, playFocusOscillatorPreview } = useSettings();
  const [siteInput, setSiteInput] = useState('');

  const [activePlay, setActivePlay] = useState('');

  const handleFocusTonePreview = (soundName: string) => {
    playFocusOscillatorPreview(soundName);
    setActivePlay(soundName);
    setTimeout(() => {
      setActivePlay('');
    }, 3000);
  };

  const handleAddSiteSubmit = () => {
    if (!siteInput.trim()) return;
    addBlockedSite(siteInput.trim());
    setSiteInput('');
  };

  const isDimmable = !settings.focus.blockingEnabled;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Focus & Blocking</h2>
        <p className="text-[14px] text-[#888888] mt-1.5 font-medium">Configure app-blocking filters, timers intervals, and background relaxing audio.</p>
      </div>

      <div className="relative p-[1px] rounded-[24px] bg-gradient-to-br from-[#7C6FF7]/30 to-[rgba(255,255,255,0.01)] mb-6 shadow-xl">
        <div className="bg-[#141414] rounded-[23px] p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-[16px] font-bold text-[#F0F0F0]">Focus App-Block filters</h3>
            <p className="text-[13px] text-[#888888] mt-0.5 leading-relaxed font-semibold">Automatically blocks browser access to distracting domains during focus quests.</p>
          </div>
          <SettingsToggle checked={settings.focus.blockingEnabled} onChange={(c) => updateSetting('focus.blockingEnabled', c)} />
        </div>
      </div>

      <div className={isDimmable ? 'opacity-50 pointer-events-none transition-opacity duration-300' : 'transition-opacity duration-300'}>
        <SettingsCard title="Distracting domains lists">
          <div className="p-5 flex flex-col gap-4">
            <span className="text-xs font-bold text-zinc-400 block uppercase">Blocked Sites Entries</span>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Domain address (e.g. reddit.com)..."
                value={siteInput}
                onChange={(e) => setSiteInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSiteSubmit()}
                className="flex-1 bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] px-3 text-xs font-medium rounded-xl outline-none text-white focus:border-[#7C6FF7]"
              />
              <button onClick={handleAddSiteSubmit} className="px-4 bg-[#7C6FF7] text-[#0A0A0A] font-bold text-xs rounded-xl transition-all hover:scale-105 active:scale-95">Add Site</button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {settings.focus.blockedSites.map((site) => (
                <div key={site} className="flex items-center gap-1.5 bg-[#1C1C1C] px-3 py-1.5 rounded-xl border border-[rgba(255,255,255,0.04)] text-xs font-bold animate-in fade-in scale-95 duration-100">
                  <span className="text-zinc-300 font-mono">{site}</span>
                  <button onClick={() => removeBlockedSite(site)} className="text-[#888888] hover:text-[#F76F6F]" title="Remove block"><X size={12} /></button>
                </div>
              ))}
            </div>
            
            <p className="text-[11px] text-[#888888] italic font-semibold mt-1">
              *Full blocking functionality is boosted on our upcoming browser extension additions.
            </p>
          </div>

          <div className="h-px bg-[rgba(255,255,255,0.06)]" />

          {/* Strictness */}
          <SettingsRow icon={<Shield size={18} />} title="Blocking Strictness" description="Sets the penalty limits for bypass checks.">
            <div className="flex gap-2">
              {[
                { id: 'soft', label: 'Soft override' },
                { id: 'normal', label: 'Normal' },
                { id: 'strict', label: 'Strict lock' }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => updateSetting('focus.blockingStrictness', st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    settings.focus.blockingStrictness === st.id
                      ? 'bg-[rgba(124,111,247,0.12)] text-[#7C6FF7] border-[#7C6FF7]'
                      : 'bg-[#1E1E1E] text-zinc-500 border-transparent hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </SettingsRow>
        </SettingsCard>

        <SettingsCard title="Timers Pomodoro scales">
          {/* Default focus length */}
          <SettingsRow icon={<Focus size={18} />} title="Focus Interval duration" description="Default focus quest durations. Pomodoro standard: 25 min.">
            <SettingsSlider
              min={15}
              max={120}
              step={5}
              value={settings.focus.sessionLength}
              onChange={(v) => updateSetting('focus.sessionLength', v)}
              formatValue={(v) => `${v} Min`}
            />
          </SettingsRow>

          {/* Break length */}
          <SettingsRow icon={<Focus size={18} />} title="Break Interval duration" description="Soft breather windows between focus cycles.">
            <SettingsSlider
              min={5}
              max={30}
              step={1}
              value={settings.focus.breakLength}
              onChange={(v) => updateSetting('focus.breakLength', v)}
              formatValue={(v) => `${v} Min`}
            />
          </SettingsRow>
        </SettingsCard>
      </div>

      <SettingsCard title="Soothing audio environments">
        <SettingsRow icon={<Focus size={18} />} title="Background Focus sounds" description="Play relaxation sweeps during active focus intervals.">
          <div className="flex items-center gap-3">
            <SettingsDropdown
              options={[
                { label: 'No background audio', value: 'none' },
                { label: 'Brown Noise', value: 'brown noise' },
                { label: 'White Noise', value: 'white noise' },
                { label: 'Gentle Rain', value: 'rain' },
                { label: 'Deep Forest', value: 'forest' },
                { label: 'Lofi relax beats', value: 'lofi beats' },
              ]}
              value={settings.focus.focusSound}
              onChange={(val) => updateSetting('focus.focusSound', val)}
            />
            {settings.focus.focusSound !== 'none' && (
              <button
                type="button"
                onClick={() => handleFocusTonePreview(settings.focus.focusSound)}
                disabled={activePlay !== ''}
                className={`p-2.5 rounded-[10px] border transition-all ${
                  activePlay 
                    ? 'bg-[rgba(111,247,160,0.1)] text-[#6FF7A0] border-[rgba(111,247,160,0.2)]' 
                    : 'bg-[#1E1E1E] text-white hover:text-[#7C6FF7] border-[rgba(255,255,255,0.06)]'
                }`}
                title="Preview sound audio"
              >
                <Play size={15} className={activePlay ? 'animate-spin' : ''} />
              </button>
            )}
          </div>
        </SettingsRow>
      </SettingsCard>
    </div>
  );
}


// --- SECTION 9: DATA & STORAGE ===
export function DataSettings() {
  const { settings, updateSetting, clearAllData, exportData, importData, backupNow } = useSettings();
  const { state, setTasks, setBrainDumps } = useApp();
  const { addToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = [
    { label: 'Routine Tasks Logs', count: `${state.tasks.length} items`, key: 'tasks', defaultVal: [] },
    { label: 'Brain Dump Notes', count: `${state.brainDumps.length} items`, key: 'dumps', defaultVal: [] },
  ];

  const handleClearSpec = (key: string) => {
    if (key === 'tasks') {
      setTasks([]);
      addToast("Routine tasks cleared", "info");
    } else if (key === 'dumps') {
      setBrainDumps([]);
      addToast("Brain dump entries cleared", "info");
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const txt = event.target?.result as string;
      importData(txt);
    };
    reader.readAsText(file);
  };

  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportData());
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "anchor-backup.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Data & Storage</h2>
        <p className="text-[14px] text-[#888888] mt-1.5 font-medium">Control local localStorage volumes, manage backups, and clean database structures.</p>
      </div>

      <SettingsCard title="Local Cache volumes">
        {/* Storage analysis checklist */}
        <div className="p-5 flex flex-col gap-4">
          <div className="space-y-3">
            {stats.map((it) => (
              <div key={it.label} className="flex justify-between items-center bg-[#151515] p-3 rounded-xl border border-[rgba(255,255,255,0.02)]">
                <div>
                  <span className="text-xs font-bold text-zinc-300 block">{it.label}</span>
                  <span className="text-[11px] text-zinc-500 font-medium font-mono">{it.count}</span>
                </div>
                <button 
                  onClick={() => handleClearSpec(it.key)}
                  className="text-xs font-bold text-[#F76F6F] hover:underline cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>
            ))}
          </div>

          <div className="h-px bg-[rgba(255,255,255,0.06)]" />

          <div>
            <div className="flex justify-between text-xs font-bold text-[#888888] mb-1.5">
              <span>LOCAL LOCALSTORAGE SPACE USED</span>
              <span className="font-mono text-white">1.2 MB / 5.0 MB</span>
            </div>
            <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
              <div className="h-full bg-[#7C6FF7] rounded-all" style={{ width: '24%' }} />
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Import / Export backups">
        {/* Export Backup JSON */}
        <SettingsRow icon={<Download size={18} />} title="Backup Routine Logs" description="Export configuration logs matching anchors, quests, and active layout levels.">
          <button 
            type="button"
            onClick={handleDownloadBackup}
            className="h-[36px] px-4 bg-[#1E1E1E] hover:bg-[#252525] text-xs font-bold text-[#7C6FF7] rounded-[8px] transition-all flex items-center gap-1.5 border border-[rgba(255,255,255,0.04)]"
          >
            <Download size={12} /> Download .json File
          </button>
        </SettingsRow>

        {/* Import JSON file */}
        <SettingsRow icon={<Upload size={18} />} title="Restore Backup file" description="Restore previous levels, check-ins, or character options formats.">
          <div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={handleFileImport}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-[36px] px-4 bg-[#7C6FF7] hover:bg-[#6b5ee6] text-[#0A0A0A] text-xs font-bold rounded-[8px] transition-all flex items-center gap-1.5"
            >
              <Upload size={12} /> Upload Backup File
            </button>
          </div>
        </SettingsRow>
      </SettingsCard>

      <SettingsCard title="Backup schedules sync">
        {/* Backup now button */}
        <SettingsRow icon={<Database size={18} />} title="Immediate Local Sync" description={`Stores current settings profiles layout inside local client database caches. Last backup: ${settings.data.lastBackup || 'Never'}`}>
          <button
            onClick={backupNow}
            className="h-[36px] px-4 bg-[#1E1E1E] hover:bg-[#252525] border border-[rgba(255,255,255,0.04)] text-xs font-bold text-[#E0E0E0] rounded-[8px] transition-all"
          >
            Compress Backup
          </button>
        </SettingsRow>
      </SettingsCard>
    </div>
  );
}


import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// --- SECTION 10: CONNECTIONS ===
export function ConnectionsSettings() {
  const { settings, updateSetting } = useSettings();
  const { addToast } = useToast();

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin is from AI Studio preview or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_SPOTIFY_SUCCESS') {
        updateSetting('connections.spotify', true);
        addToast(`Spotify synced successfully ✓`, "success");
      }
      if (event.data?.type === 'OAUTH_DISCORD_SUCCESS') {
        updateSetting('connections.discord', true);
        addToast(`Discord synced successfully ✓`, "success");
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [updateSetting, addToast]);

  const handleToggleConn = async (key: string) => {
    const nextVal = !(settings.connections as any)[key];
    
    if (nextVal) {
      if (key === 'googleCalendar') {
        try {
          addToast(`Connecting to Google...`, "info");
          googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
          const result = await signInWithPopup(auth, googleProvider);
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            localStorage.setItem('google_calendar_token', credential.accessToken);
          }
          updateSetting(`connections.${key}`, true);
          addToast(`Google Calendar synced successfully ✓`, "success");
        } catch (e) {
          console.error(e);
          addToast(`Google Calendar connection failed.`, "error");
        }
      } else if (key === 'spotify' || key === 'discord') {
        addToast(`Opening ${key} authentication...`, "info");
        try {
          const res = await fetch(`/api/auth/${key}/url`);
          const data = await res.json();
          window.open(data.url, 'oauth_popup', 'width=600,height=700');
        } catch(e) {
          addToast(`Failed to open ${key} auth. Ensure keys are set.`, "error");
        }
      } else {
        // Other services
        addToast(`Please ensure ${key} keys are added to .env.example / secrets first.`, "info");
        setTimeout(() => {
          updateSetting(`connections.${key}`, true);
          addToast(`${key} synced successfully ✓`, "success");
        }, 1500);
      }
    } else {
      updateSetting(`connections.${key}`, false);
      addToast(`Disconnected association profile.`, "info");
    }
  };

  const integrations = [
    { id: 'googleCalendar', name: 'Google Calendar', desc: 'Sync timelines to automatically match check-in hours.', color: 'bg-blue-600/10 text-blue-400 border-blue-500/25' },
    { id: 'spotify', name: 'Spotify Music', desc: 'Sync relaxing ambient beats during deep focus tasks. Requires SPOTIFY_CLIENT_ID & SECRET.', color: 'bg-green-600/10 text-green-400 border-green-500/25' },
    { id: 'discord', name: 'Discord party challenges', desc: 'Sync streak metrics automatically to guild chats. Requires DISCORD_CLIENT_ID & SECRET.', color: 'bg-indigo-600/10 text-indigo-400 border-indigo-500/25' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Connections</h2>
        <p className="text-[14px] text-[#888888] mt-1.5 font-medium">Associate calendars, student directories, or social networks profiles.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-12">
        {integrations.map((int) => {
          const isConnected = (settings.connections as any)[int.id];
          return (
            <div 
              key={int.id}
              className="bg-[#141414]/90 backdrop-blur-md border border-[rgba(255,255,255,0.06)] rounded-[20px] p-5 flex flex-col justify-between gap-5 shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:scale-[1.01] transition-transform duration-200"
            >
              <div>
                <div className="flex justify-between items-center gap-3">
                  <div className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border uppercase tracking-wider ${int.color}`}>
                    {int.name.split(' ')[0]}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#6FF7A0] animate-pulse' : 'bg-zinc-600'}`} />
                    <span className="text-[10px] font-bold uppercase text-[#888888]">{isConnected ? 'ON' : 'OFF'}</span>
                  </div>
                </div>
                <h4 className="text-[15px] font-bold text-[#F0F0F0] mt-3">{int.name}</h4>
                <p className="text-[12.5px] text-[#888888] mt-1 leading-relaxed">{int.desc}</p>
              </div>

              <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.04)] pt-3">
                {isConnected ? (
                  <button 
                    onClick={() => handleToggleConn(int.id)}
                    className="text-xs font-bold text-[#F76F6F] hover:underline"
                  >
                    Disconnect Profile
                  </button>
                ) : (
                  <span className="text-xs font-bold text-zinc-500">Unconnected</span>
                )}
                <button
                  type="button"
                  onClick={() => handleToggleConn(int.id)}
                  className={`h-9 px-4.5 rounded-[10px] font-bold text-xs transition-all ${
                    isConnected 
                      ? 'bg-[rgba(124,111,247,0.12)] text-[#7C6FF7]' 
                      : 'bg-[#7C6FF7] text-[#0A0A0A]'
                  }`}
                >
                  {isConnected ? 'Associated' : 'Integrate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// --- SECTION 11: ABOUT & HELP ===
export function AboutSettings() {
  const { settings } = useSettings();
  const { addToast } = useToast();
  
  const [activeTabHelp, setActiveTabHelp] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isTOSOpen, setIsTOSOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackText, setFeedbackText] = useState('');
  const [ratingVal, setRatingVal] = useState(0);

  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const handleTriggerUpdate = () => {
    setLoadingUpdate(true);
    addToast("Searching secure release pools...", "info");
    setTimeout(() => {
      setLoadingUpdate(false);
      addToast("Your client configuration is up to date ✓", "success");
    }, 1200);
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim()) return;
    addToast("Dispatching logs package to dev servers...", "info");
    setTimeout(() => {
      addToast("Thanks! We read everything 💜", "success");
      setIsFeedbackOpen(false);
      setFeedbackText('');
    }, 800);
  };

  const handleRatingStar = (stars: number) => {
    setRatingVal(stars);
    addToast(`Thanks for the rating! 🌟`, "success");
  };

  const helpTopics: Record<string, string> = {
    "Getting Started Guide": "### Welcome to Anchor!\n\nAnchor is a lifestyle habit engine styled for students and teenagers to help battle daily procrastination, build healthy routines, and optimize sleeping schedules.\n\nUse customizable Anchor Timeblocks to lay down locked-in markers (such as study halls, gyms, breakfast or commute blocks) inside the day. Anchor will automatically sweep the schedule and calculate free spaces.",
    "How Anchor Points work": "### Scheduling Anchors\n\nDaily routines can prove chaotic without structural landmarks.\n\n1. Fixed Anchor Hours: Fixed schedule variables like school, jobs or commute.\n2. Draggable Gaps buffer: Free buffer time allocated automatically between back-to-back lessons.\n3. Swipe gestures are active to tick check-in blocks as Done as the day advances, helping accumulate levels and streak thresholds.",
    "Understanding your Sleep Score": "### Circadian Sleep index metrics\n\nYour calculated Sleep consistency score weights are measured across four primary parameters:\n\n* **Duration (40% Weighting Limit):** Tracking absolute sleep hours constraints.\n* **Consistency (30% Weighting Limit):** Tracking sleep schedules consistency variations.\n* **Timing (20% Weighting Limit):** Aligning sleep periods with designated ideal bedtime windows.\n* **Awake Events (10% Weighting Limit):** Micro-awake hours tracking.",
    "Gamification & XP explained": "### Gamification Formulas\n\nEarn XP and streaks multipliers as you clears routine tasks:\n\n* **Quests Done:** Standard task completions grant base points.\n* **Circadian Marks Completed:** Logging morning fuel or phone wind-down times pays higher index multipliers.\n* **Streak bonus multipliers:** Continuous checklist finishes amplify point rates and character levels.",
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">About & Help</h2>
        <p className="text-[14px] text-[#888888] mt-1.5 font-medium">Verify applet updates, access training tutorials, and send platform feedback.</p>
      </div>

      <SettingsCard title="Application Info Details">
        <SettingsRow icon={<Info size={18} />} title="App Release Release" description="Anchor Habit trackers core.">
          <span className="text-xs font-mono font-bold text-[#F0F0F0] bg-zinc-800 px-2 py-1 rounded">Anchor v1.0.0</span>
        </SettingsRow>
        <SettingsRow icon={<Info size={18} />} title="Build Identifier" description="Cryptographic staging logs sequence reference.">
          <span className="text-xs font-mono text-zinc-500">BUILD-2026-XQ47L</span>
        </SettingsRow>
        <SettingsRow icon={<Database size={18} />} title="Platform Environment" description="Engine framework runtime constraints.">
          <span className="text-[13px] text-zinc-300 font-bold">Web Sandbox (React)</span>
        </SettingsRow>
        <SettingsRow icon={<Sparkles size={18} />} title="Check Staging Package Updates" description="Poll release branches for hotfix modifications.">
          <button 
            type="button" 
            onClick={handleTriggerUpdate} 
            disabled={loadingUpdate}
            className="h-[36px] px-4 bg-[#1E1E1E] hover:bg-[#252525] border border-[rgba(255,255,255,0.04)] text-[#7C6FF7] rounded-lg text-xs font-bold transition-all disabled:opacity-40"
          >
            {loadingUpdate ? 'Searching...' : 'Poll Updates'}
          </button>
        </SettingsRow>
      </SettingsCard>

      <SettingsCard title="Help tutorials & Resources">
        {Object.keys(helpTopics).map((topic) => (
          <button
            key={topic}
            onClick={() => setActiveTabHelp(topic)}
            className="w-full text-left p-4.5 hover:bg-[#1C1C1C] transition-all flex items-center justify-between border-b border-[rgba(255,255,255,0.03)] last:border-0"
          >
            <div className="flex items-center gap-3">
              <HelpCircle size={16} className="text-zinc-500" />
              <span className="text-sm font-bold text-[#E0E0E0]">{topic}</span>
            </div>
            <ChevronRight size={16} className="text-zinc-600" />
          </button>
        ))}
      </SettingsCard>

      {/* Shortcuts */}
      <SettingsCard title="Sidebar Keyboard shortcuts">
        <div className="p-5 overflow-x-auto select-none">
          <table className="w-full text-left text-xs text-[#888888] font-semibold border-collapse">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)] text-[10px] uppercase tracking-wider">
                <th className="pb-2">Shortcut keystroke</th>
                <th className="pb-2">Associated Application endpoint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.03)] text-[13px] font-bold font-mono">
              <tr><td className="py-2.5 text-[#F0F0F0] font-bold">Ctrl/Cmd + K</td><td className="py-2.5 text-zinc-400">Trigger Quick Brain Dump Panel</td></tr>
              <tr><td className="py-2.5 text-[#F0F0F0] font-bold">Ctrl/Cmd + /</td><td className="py-2.5 text-zinc-400">Trigger Options settings console</td></tr>
              <tr><td className="py-2.5 text-[#F0F0F0] font-bold">Ctrl/Cmd + D</td><td className="py-2.5 text-zinc-400">Staging Dashboard timeline home redirect</td></tr>
              <tr><td className="py-2.5 text-[#F0F0F0] font-bold">Escape</td><td className="py-2.5 text-zinc-400">Close open drawers/panels modal elements</td></tr>
            </tbody>
          </table>
        </div>
      </SettingsCard>

      <SettingsCard title="Feedback & Ratings channels">
        <div className="p-4 flex gap-3 flex-wrap">
          <button 
            onClick={() => setIsFeedbackOpen(true)}
            className="flex-1 min-w-[140px] h-10 bg-[#1E1E1E] hover:bg-[#252525] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 text-zinc-400 border border-[rgba(255,255,255,0.04)]"
          >
            <MessageSquare size={14} /> Send Diagnostics Feedback
          </button>
          
          {/* Rate app trigger */}
          <div className="flex-1 min-w-[200px] h-10 bg-[#1E1E1E] border border-[rgba(255,255,255,0.04)] rounded-xl flex items-center justify-between px-3">
            <span className="text-xs font-bold text-zinc-400">Rate Client Stability</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((stars) => (
                <button
                  key={stars}
                  onClick={() => handleRatingStar(stars)}
                  onMouseEnter={() => setRatingVal(stars)}
                  onMouseLeave={() => setRatingVal(0)}
                  className="p-0.5 text-zinc-600 hover:text-[#F7D96F] transition-colors"
                >
                  <Star size={15} className={`${stars <= ratingVal ? 'text-[#F7D96F] fill-[#F7D96F]' : 'text-zinc-600'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* HELP RESOURCES SIDE DRAWR / TRANSITIONING POP */}
      {activeTabHelp && (
        <div className="fixed inset-y-0 right-0 w-[360px] max-w-full bg-[#141414] border-l border-[rgba(255,255,255,0.08)] shadow-[0_0_64px_rgba(0,0,0,0.8)] z-[200] p-6 flex flex-col justify-between animate-in slide-in-from-right duration-300">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-[rgba(255,255,255,0.06)]">
              <h4 className="text-[16px] font-bold text-white">{activeTabHelp}</h4>
              <button onClick={() => setActiveTabHelp(null)} className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800"><X size={18} /></button>
            </div>
            
            <div className="mt-5 text-[14px] text-zinc-300 leading-relaxed space-y-4 font-normal">
              {helpTopics[activeTabHelp].split('\n\n').map((para, idx) => {
                if (para.startsWith('###')) {
                  return <h5 key={idx} className="text-sm font-bold text-white uppercase tracking-wider pt-2">{para.substring(4)}</h5>;
                }
                if (para.startsWith('*')) {
                  return (
                    <ul key={idx} className="list-disc pl-5 space-y-2 mt-1 font-semibold text-zinc-400">
                      {para.split('\n').map((li, lidx) => (
                        <li key={lidx}>{li.substring(2)}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={idx}>{para}</p>;
              })}
            </div>
          </div>

          <button 
            onClick={() => setActiveTabHelp(null)}
            className="h-[44px] w-full bg-[#1E1E1E] hover:bg-[#252525] border border-[rgba(255,255,255,0.05)] text-xs font-bold rounded-[10px] text-white"
          >
            Dismiss Guide
          </button>
        </div>
      )}

      {/* SEND FEEDBACK MODAL */}
      <Modal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} title="Send Diagnostics Feedback">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between gap-1 border-b border-[rgba(255,255,255,0.04)] pb-3">
            {['bug', 'suggestion', 'compliment'].map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => setFeedbackType(tp)}
                className={`flex-1 h-9 rounded-lg text-xs font-bold uppercase transition-all ${
                  feedbackType === tp 
                    ? 'bg-[rgba(124,111,247,0.12)] text-[#7C6FF7] border border-[#7C6FF7]' 
                    : 'bg-[#1E1E1E] border border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tp}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-[11px] font-bold text-zinc-500 uppercase">Tell us more detail...</label>
            <textarea
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Explain any issues encountered or features you'd like to see added..."
              className="w-full bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-4 text-[14px] text-white focus:border-[#7C6FF7] outline-none resize-none leading-relaxed"
            />
          </div>

          <button
            onClick={handleFeedbackSubmit}
            disabled={!feedbackText.trim()}
            className="h-[48px] bg-[#7C6FF7] hover:bg-[#6b5ee6] disabled:bg-zinc-800 disabled:text-zinc-600 text-[#0A0A0A] disabled:cursor-not-allowed rounded-[12px] font-bold text-[14px] transition-all"
          >
            Submit Feedback
          </button>
        </div>
      </Modal>

      <SettingsCard title="Legal & Agreements">
        <div className="p-4 flex gap-3 flex-wrap">
          <button 
            onClick={() => setIsTOSOpen(true)}
            className="flex-1 min-w-[140px] h-10 bg-[#1E1E1E] hover:bg-[#252525] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 text-zinc-400 border border-[rgba(255,255,255,0.04)]"
          >
            <Shield size={14} className="text-[#7C6FF7]" /> Terms of Service Agreement
          </button>
          
          <button 
            onClick={() => setIsPrivacyOpen(true)}
            className="flex-1 min-w-[140px] h-10 bg-[#1E1E1E] hover:bg-[#252525] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 text-zinc-400 border border-[rgba(255,255,255,0.04)]"
          >
            <Shield size={14} className="text-[#7C6FF7]" /> Data Privacy Policy
          </button>
        </div>
      </SettingsCard>

      {/* TERMS OF SERVICE MODAL */}
      <Modal isOpen={isTOSOpen} onClose={() => setIsTOSOpen(false)} title="Terms of Service Agreement">
        <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 leading-relaxed text-zinc-300 text-[13px]">
          <p className="font-bold text-white text-[14px]">Welcome to Anchor!</p>
          <p>By using Anchor (the "App"), you agree to follow and be bound by these Terms of Service. Please read them carefully.</p>
          
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mt-2">1. Use of the Service</h4>
          <p>Anchor is designed to provide visual circadian rhythm optimization, daily routine checklists, sleep tracking algorithms, and habit-building mechanics. You agree to use this application for personal, non-commercial purposes only.</p>
          
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mt-2">2. Local Storage and Syncing</h4>
          <p>The App saves your task lists, sleep schedules, XP totals, and personalized preferences directly on your local device storage, and optionally syncs via our cloud database. Deleting browser storage may result in local data clearance if cloud synchronization is inactive.</p>
          
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mt-2">3. Accuracy of Data</h4>
          <p>The habit reminders, sleep optimization indexes, and scheduling buffers provided by Anchor are designed for educational and motivational purposes. We make no guarantees about absolute accuracy or scheduling perfection.</p>
          
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mt-2">4. Modifications to Terms</h4>
          <p>We reserve the right to update these terms at any time. Continued usage of the App after updates constitutes complete acceptance of the revised agreements.</p>
        </div>
        <button 
          onClick={() => setIsTOSOpen(false)}
          className="mt-4 h-[44px] w-full bg-[#1E1E1E] hover:bg-[#252525] text-white rounded-[12px] text-xs font-bold transition-all"
        >
          I Accept terms
        </button>
      </Modal>

      {/* PRIVACY POLICY MODAL */}
      <Modal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} title="Data Privacy Policy">
        <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 leading-relaxed text-zinc-300 text-[13px]">
          <p className="font-bold text-white text-[14px]">Your Privacy is our Priority</p>
          <p>This Privacy Policy explains how we gather, utilize, protect, and manage user profile configurations inside the Anchor ecosystem.</p>
          
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mt-2">1. Personal Information Collected</h4>
          <p>Anchor collects display names, user initials, habit completions, sleeps and waking logs, and device configurations. We do NOT harvest or sell any personal data to advertising agents or third-party trackers.</p>
          
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mt-2">2. Cloud Data Storage</h4>
          <p>If cloud syncing is active, your routines and gamification profiles are kept secure in a secure cloud database, encrypted in transit and at rest. These servers only serve user-authorized devices owned by you.</p>
          
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mt-2">3. Third-Party Integrations</h4>
          <p>No outside SDKs, tracking pixels, or diagnostic beacons are loaded within Anchor, maintaining total isolation and bulletproof security for your schedules.</p>
          
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mt-2">4. User Rights</h4>
          <p>You can erase all database-held metadata and local profiles instantly by accessing the "Danger Zone" segment inside our settings panel.</p>
        </div>
        <button 
          onClick={() => setIsPrivacyOpen(false)}
          className="mt-4 h-[44px] w-full bg-[#1E1E1E] hover:bg-[#252525] text-white rounded-[12px] text-xs font-bold transition-all"
        >
          Dismiss Policy
        </button>
      </Modal>
    </div>
  );
}


// --- SECTION 12: DANGER ZONE ===
export function DangerZoneSettings() {
  const { resetProgress, clearAllData, deleteAccountData, settings, updateSetting } = useSettings();
  const { state, updateUser, resetStatistics } = useApp();
  const { addToast } = useToast();
  
  const [activeModal, setActiveModal] = useState<'reset' | 'clear' | 'delete' | 'resetStats' | 'devMode' | null>(null);
  const [devPassword, setDevPassword] = useState('');

  const handleResetConfirm = () => {
    resetProgress();
    setActiveModal(null);
  };

  const handleResetStatsConfirm = () => {
    resetStatistics();
    addToast("XP reset to zero & sleep statistics erased!", "success");
    setActiveModal(null);
  };

  const handleClearConfirm = () => {
    clearAllData();
    setActiveModal(null);
  };

  const handleDeleteConfirm = () => {
    deleteAccountData();
    setActiveModal(null);
  };
  
  const handleDevModePassword = () => {
    if (devPassword === '12345678') {
      const isEnabling = !settings.devMode;
      updateSetting('devMode', isEnabling);
      if (isEnabling) {
        updateUser({ xp: 500000000 });
      }
      addToast(`Developer mode ${isEnabling ? 'enabled (500M XP granted)' : 'disabled'}`, 'success');
      setDevPassword('');
      setActiveModal(null);
    } else {
      addToast('Incorrect password', 'error');
    }
  };

  return (
    <div>
      {/* DEV MODE PASSWORD MODAL */}
      <Modal isOpen={activeModal === 'devMode'} onClose={() => setActiveModal(null)} title="Enter Password">
        <div className="flex flex-col gap-4 p-4">
          <input
            type="password"
            value={devPassword}
            onChange={(e) => setDevPassword(e.target.value)}
            className="bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] px-4 py-2.5 rounded-[12px] text-[14px] text-white"
            placeholder="Password"
          />
          <button
            onClick={handleDevModePassword}
            className="h-[48px] w-full bg-[#7C6FF7] text-[#0A0A0A] rounded-[12px] font-bold text-[14px] transition-all"
          >
            Confirm
          </button>
        </div>
      </Modal>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F76F6F]">Danger Zone</h2>
        <p className="text-[14px] text-[#888888] mt-1.5 font-medium">Destructive administrative actions that clear user records, metrics or profile details.</p>
      </div>

      <div className="border border-[#F76F6F]/20 rounded-[20px] bg-[#F76F6F]/[0.02] overflow-hidden w-full">
        {/* Developer Mode */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-5 border-b border-[#F76F6F]/10 w-full">
          <div className="flex items-start gap-3.5 flex-1 max-w-xl">
            <div className="text-[#F76F6F] mt-1 shrink-0"><AlertTriangle size={18} /></div>
            <div>
              <h4 className="text-[15px] font-bold text-white">Developer Mode</h4>
              <p className="text-[13px] text-[#888888] mt-1 leading-relaxed">
                Access advanced settings and disable restrictions. Password required.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveModal('devMode')}
            className={`w-full lg:w-auto h-[44px] px-6 shrink-0 ${settings.devMode ? 'bg-[#F76F6F]' : 'bg-[#F76F6F]/10'} hover:bg-[#F76F6F]/20 text-white border border-[#F76F6F]/30 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center cursor-pointer select-none`}
          >
            {settings.devMode ? 'Disable Developer Mode' : 'Enable Developer Mode'}
          </button>
        </div>

        {/* Reset XP and Sleep Statistics */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-5 border-b border-[#F76F6F]/10 w-full">
          <div className="flex items-start gap-3.5 flex-1 max-w-xl">
            <div className="text-[#F76F6F] mt-1 shrink-0"><AlertTriangle size={18} /></div>
            <div>
              <h4 className="text-[15px] font-bold text-white">Reset XP & Sleep Statistics</h4>
              <p className="text-[13px] text-[#888888] mt-1 leading-relaxed">
                Sets your level progress and total XP back to zero, and wipes all sleep logs and historic statistics.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveModal('resetStats')}
            className="w-full lg:w-auto h-[44px] px-6 shrink-0 bg-[#F76F6F]/10 hover:bg-[#F76F6F]/20 text-white border border-[#F76F6F]/30 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center cursor-pointer select-none"
          >
            Reset XP & Sleep Stats
          </button>
        </div>

        {/* Clear All Data */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-5 border-b border-[#F76F6F]/10 w-full">
          <div className="flex items-start gap-3.5 flex-1 max-w-xl">
            <div className="text-[#F76F6F] mt-1 shrink-0"><AlertTriangle size={18} /></div>
            <div>
              <h4 className="text-[15px] font-bold text-white">Clear Everything</h4>
              <p className="text-[13px] text-[#888888] mt-1 leading-relaxed">
                Clears all custom timeline elements, schedules category tags, brain logs notes, and interface configuration files. Profile details and onboarding status are fully preserved.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveModal('clear')}
            className="w-full lg:w-auto h-[44px] px-6 shrink-0 bg-[#F76F6F] hover:bg-[#e05e5e] text-[#0A0A0A] rounded-xl text-[13px] font-bold transition-all shadow-[0_4px_16px_rgba(247,111,111,0.2)] flex items-center justify-center cursor-pointer select-none"
          >
            Clear All Data
          </button>
        </div>

        {/* Delete Profile */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-5 w-full">
          <div className="flex items-start gap-3.5 flex-1 max-w-xl">
            <div className="text-[#F76F6F] mt-1 shrink-0"><AlertTriangle size={18} /></div>
            <div>
              <h4 className="text-[15px] font-bold text-white">Delete All Account Data</h4>
              <p className="text-[13px] text-[#888888] mt-1 leading-relaxed">
                Permanently deletes the associated profile, all activity records, and resets the app state back to the onboarding page.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveModal('delete')}
            className="w-full lg:w-auto h-auto min-h-[44px] py-2.5 px-5 shrink-0 bg-[#F76F6F]/10 hover:bg-[#F76F6F]/20 text-[#F76F6F] border border-[#F76F6F]/30 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center cursor-pointer select-none text-center"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* CONFIRMATION OVERLAYS */}
      <ConfirmationModal
        isOpen={activeModal === 'reset'}
        onClose={() => setActiveModal(null)}
        onConfirm={handleResetConfirm}
        confirmWord="RESET"
        title="Reset Levels & Streaks"
        description="This will reset your current character Levels, streaks records, and accumulated XP logs back to initial defaults. Your actual checklist templates and notes will remain intact."
        actionLabel="Verify Reset progress"
      />

      <ConfirmationModal
        isOpen={activeModal === 'resetStats'}
        onClose={() => setActiveModal(null)}
        onConfirm={handleResetStatsConfirm}
        confirmWord="RESET"
        title="Reset XP & Sleep Statistics"
        description="Warning: This action will reset your accumulated XP and level progress to zero, and erase your sleep tracking history logs and debt statistics. This is irreversible."
        actionLabel="Verify Reset Stats"
      />

      <ConfirmationModal
        isOpen={activeModal === 'clear'}
        onClose={() => setActiveModal(null)}
        onConfirm={handleClearConfirm}
        confirmWord="DELETE"
        title="Clear Custom Records"
        description="Warning: This operation will clear your custom timelines, category tags, checklists, and activity history. Your profile display name, avatar, and onboarding completions are fully preserved."
        actionLabel="Clear Custom Data"
      />

      <ConfirmationModal
        isOpen={activeModal === 'delete'}
        onClose={() => setActiveModal(null)}
        onConfirm={handleDeleteConfirm}
        confirmWord="DELETE"
        title="Delete All Account Data"
        description="This action permanently deletes your profile and all associated data. You will be returned to the onboarding page. This is irreversible."
        actionLabel="Delete All Account Data"
      />
    </div>
  );
}
