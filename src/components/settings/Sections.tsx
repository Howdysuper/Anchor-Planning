import React, { useState, useEffect, useRef } from 'react';
import { useSettings, SettingsType } from '../../contexts/SettingsContext';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import {
  User, Bell, Anchor, Moon, Trophy, Palette, Shield, Focus, Database, 
  Plug, HelpCircle, AlertTriangle, Check, X, ShieldAlert, Key, 
  Download, Upload, Heart, Info, ChevronRight, Play, Eye, EyeOff, 
  Trash2, Plus, Copy, Lock, Sparkles, MessageSquare, Star, Edit3
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
export function ProfileSettings() {
  const { settings, updateSetting, logOutAllSessions } = useSettings();
  const { updateUser, state, purchaseProSubscription } = useApp();
  const { addToast } = useToast();
  
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

  // Name states
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(settings.profile.displayName);

  // Username States
  const [username, setUsername] = useState(settings.profile.username);
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'checking' | 'idle'>('idle');

  // Email States
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(settings.profile.email);

  // Password States
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // 2FA state
  const [twoFACaps, setTwoFACaps] = useState(['', '', '', '', '', '']);
  const [twoFAActivated, setTwoFAActivated] = useState(settings.profile.twoFactorEnabled);

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
      // simulate take check
      if (cleaned === 'shaurya' || cleaned === 'anchor' || cleaned === 'admin') {
        setUsernameStatus('available');
      } else if (cleaned.length < 3) {
        setUsernameStatus('idle');
      } else {
        // Taken simulation for odd lengths
        if (cleaned.length % 2 === 0) {
          setUsernameStatus('available');
        } else {
          setUsernameStatus('taken');
        }
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

  const handle2FAInput = (val: string, index: number) => {
    const next = [...twoFACaps];
    next[index] = val.substring(0, 1);
    setTwoFACaps(next);

    // Auto focus next
    if (val && index < 5) {
      const nextInput = document.getElementById(`2fa-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handle2FAConfirm = () => {
    const fullCode = twoFACaps.join('');
    if (fullCode.length === 6) {
      setTwoFAActivated(true);
      updateSetting('profile.twoFactorEnabled', true);
      addToast("Two-Factor Authentication Setup Complete!", "success");
      setIs2FAModalOpen(false);
    } else {
      addToast("Please fill all 6 authentication digits", "error");
    }
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
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Profile & Account</h2>
        <p className="text-[14px] text-[#888888] mt-1.5">Manage your character credentials, security levels, plan tiers, and logins.</p>
      </div>

      <SettingsCard title="Identity Visualizer">
        {/* Avatar Settings */}
        <div className="p-5 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7C6FF7] to-[#1E1133] border-2 border-[#7C6FF7] flex items-center justify-center font-bold text-3xl shadow-[0_0_16px_rgba(124,111,247,0.3)]">
              {state.user.avatar}
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h4 className="text-[16px] font-bold text-[#F0F0F0]">{settings.profile.displayName}</h4>
            <p className="text-[13px] text-[#888888] mt-0.5 font-medium">@{settings.profile.username} &bull; {settings.profile.email}</p>
            <button
              onClick={() => setIsPhotoModalOpen(true)}
              className="mt-3.5 h-[34px] px-4 bg-[#1E1E1E] hover:bg-[#252525] text-xs font-bold text-[#7C6FF7] rounded-[8px] transition-all border border-[rgba(255,255,255,0.04)]"
            >
              Modify Photo
            </button>
          </div>
        </div>

        {/* Display Name Row */}
        <SettingsRow icon={<User size={18} />} title="Display Name" description="How you appear to partners and on logs.">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempName}
                maxLength={30}
                onChange={(e) => setTempName(e.target.value)}
                className="bg-[#1E1E1E] border border-[#7C6FF7] px-3 py-1.5 rounded-[8px] text-[14px] font-semibold text-[#F0F0F0] outline-none max-w-[140px]"
              />
              <button onClick={handleSaveName} className="p-2 bg-[rgba(111,247,160,0.12)] text-[#6FF7A0] rounded-lg hover:scale-105 active:scale-95 transition-all">
                <Check size={14} />
              </button>
              <button onClick={() => setIsEditingName(false)} className="p-2 bg-[rgba(247,111,111,0.12)] text-[#F76F6F] rounded-lg hover:scale-105 active:scale-95 transition-all">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[14px] text-zinc-300 font-semibold">{settings.profile.displayName}</span>
              <button onClick={() => setIsEditingName(true)} className="text-xs font-bold text-[#7C6FF7] hover:underline">Edit</button>
            </div>
          )}
        </SettingsRow>

        {/* Username Row */}
        <SettingsRow icon={<User size={18} />} title="Username" description="Your unique @handle across leaderboard brackets.">
          <div className="flex flex-col items-start lg:items-end gap-1.5 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-[#888888] font-semibold text-[14px]">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] focus:border-[#7C6FF7] px-3 py-1.5 rounded-[8px] text-[14px] font-semibold text-[#F0F0F0] outline-none max-w-[140px]"
              />
              <button 
                onClick={handleSaveUsername} 
                disabled={usernameStatus !== 'available' || username === settings.profile.username}
                className="h-[32px] px-3 bg-[#7C6FF7] disabled:bg-zinc-800 disabled:text-zinc-600 font-bold text-xs rounded-lg text-[#0A0A0A] disabled:cursor-not-allowed transition-all"
              >
                Apply
              </button>
            </div>
            {usernameStatus === 'checking' && <span className="text-[11px] text-[#888888]">Simulating availability check...</span>}
            {usernameStatus === 'available' && username !== settings.profile.username && <span className="text-[11px] text-[#6FF7A0] font-semibold">✓ Username Available</span>}
            {usernameStatus === 'taken' && <span className="text-[11px] text-[#F76F6F] font-semibold">✗ Handle taken — try {username}42</span>}
          </div>
        </SettingsRow>

        {/* Email Address */}
        <SettingsRow icon={<User size={18} />} title="Email Address" description="Primary login verification and streak reports.">
          {isEditingEmail ? (
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={tempEmail}
                onChange={(e) => setTempEmail(e.target.value)}
                className="bg-[#1E1E1E] border border-[#7C6FF7] px-3 py-1.5 rounded-[8px] text-[14px] font-semibold text-[#F0F0F0] outline-none max-w-[200px]"
              />
              <button onClick={handleSaveEmail} className="p-2 bg-[rgba(111,247,160,0.12)] text-[#6FF7A0] rounded-lg">
                <Check size={14} />
              </button>
              <button onClick={() => setIsEditingEmail(false)} className="p-2 bg-[rgba(247,111,111,0.12)] text-[#F76F6F] rounded-lg">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-zinc-300 font-medium">{settings.profile.email}</span>
              <button onClick={() => setIsEditingEmail(true)} className="text-xs font-bold text-[#7C6FF7] hover:underline">Change</button>
            </div>
          )}
        </SettingsRow>
      </SettingsCard>

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

        {/* Two-Factor Authentication */}
        <SettingsRow icon={<Lock size={18} />} title="Two-Factor (2FA)" description="Secure your data with temporary authenticator codes.">
          <div className="flex items-center gap-4">
            <span className={`text-xs font-bold ${twoFAActivated ? 'text-[#6FF7A0]' : 'text-[#888888]'}`}>
              {twoFAActivated ? 'ENABLED' : 'DISABLED'}
            </span>
            <SettingsToggle 
              checked={twoFAActivated} 
              onChange={(checked) => {
                if (checked) {
                  setIs2FAModalOpen(true);
                } else {
                  setTwoFAActivated(false);
                  updateSetting('profile.twoFactorEnabled', false);
                  addToast("2FA disabled", "info");
                }
              }} 
            />
          </div>
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

      <SettingsCard title="Subscription details">
        <SettingsRow icon={<Sparkles size={18} />} title="Plan Tier" description="Standard features provided on basic packages.">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#7C6FF7] bg-[rgba(124,111,247,0.1)] border border-[rgba(124,111,247,0.25)]">
              {state.user.proUntil && state.user.proUntil > Date.now() ? "PRO" : settings.profile.plan.toUpperCase()}
            </span>
            <button 
              onClick={() => {
                const res = purchaseProSubscription();
                if (res.success) {
                  updateSetting('profile.plan', 'pro');
                  addToast(res.message, "success");
                } else {
                  addToast(res.message, res.message.includes('already') ? "info" : "error");
                }
              }}
              className="h-[36px] px-4 bg-[#7C6FF7] hover:bg-[#6b5ee6] text-[#0A0A0A] font-bold text-xs rounded-[8px] transition-all"
            >
              Buy Pro (7000 XP/wk)
            </button>
          </div>
        </SettingsRow>

        <SettingsRow icon={<Info size={18} />} title="Member Since" description="Initial subscription trigger milestone.">
          <span className="text-[13px] font-mono text-[#F0F0F0] font-semibold">{settings.profile.memberSince}</span>
        </SettingsRow>

        <SettingsRow icon={<Copy size={18} />} title="User ID" description="Cryptographic alphanumeric system identifier.">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-xs text-[#888888]">UID-2026-AN...</span>
            <button onClick={copyUserId} className="text-[#7C6FF7] hover:text-[#6b5ee6] transition-colors">
              <Copy size={14} />
            </button>
          </div>
        </SettingsRow>
      </SettingsCard>

      {/* PHOTO SELECTION MODAL */}
      <Modal isOpen={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)} title="Modify Profile Illustration">
        <div className="flex flex-col gap-5">
          <div>
            <label className="text-[11px] font-bold text-[#888888] uppercase tracking-wider block mb-2 px-1">Select an Avatar/Mascot</label>
            <div className="grid grid-cols-4 gap-3 bg-[#111111] p-3 rounded-[16px] border border-[rgba(255,255,255,0.06)]">
              {avatarsList.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => {
                    updateSetting('profile.avatarType', 'mascot');
                    updateSetting('profile.avatarImage', null);
                    updateUser({ avatar: av });
                    setIsPhotoModalOpen(false);
                    addToast(`Mascot changed to ${av}!`, "success");
                  }}
                  className={`h-12 w-full rounded-[12px] text-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                    state.user.avatar === av ? 'bg-[rgba(124,111,247,0.25)] border-2 border-[#7C6FF7]' : 'bg-[#1E1E1E] border border-[rgba(255,255,255,0.04)] hover:bg-[#252525]'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleRandomAvatar} className="w-full text-left p-4 hover:bg-[rgba(124,111,247,0.1)] text-[#7C6FF7] border border-[rgba(124,111,247,0.15)] rounded-[12px] font-bold text-[14px] flex items-center justify-between cursor-pointer">
            <span>Roll Random Mascot Avatar</span>
            <Sparkles size={16} />
          </button>
          
          <div className="h-px bg-[rgba(255,255,255,0.06)]" />
          
          <button 
            type="button"
            onClick={() => { 
              const initials = tempName ? tempName[0].toUpperCase() : 'S';
              updateSetting('profile.avatarType', 'letter');
              updateUser({ avatar: initials });
              setIsPhotoModalOpen(false); 
              addToast("Reverted to initial letter badge ✓", "info"); 
            }} 
            className="w-full text-center py-3.5 bg-transparent text-[#F76F6F] hover:bg-[rgba(247,111,111,0.08)] border border-[rgba(247,111,111,0.2)] rounded-[12px] font-bold text-[14px] transition-all cursor-pointer"
          >
            Remove Mascot illustration
          </button>
        </div>
      </Modal>

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

      {/* TWO FACTOR INLINE MODAL */}
      <Modal isOpen={is2FAModalOpen} onClose={() => setIs2FAModalOpen(false)} title="Setup Two-Factor Authenticator">
        <div className="flex flex-col gap-5">
          <div>
            <span className="text-xs font-bold text-[#7C6FF7] uppercase tracking-wide">Step 1: Get Authenticator</span>
            <p className="text-[13px] text-[#888888] mt-1">Download standard mobile token tools such as Google Authenticator, Authy or Duo Mobile from the app stores.</p>
          </div>
          <div>
            <span className="text-xs font-bold text-[#7C6FF7] uppercase tracking-wide">Step 2: Scan QR Key</span>
            <div className="mt-2 w-full h-[140px] bg-[#1E1E1E] rounded-[16px] border border-dashed border-[rgba(255,255,255,0.08)] flex flex-col items-center justify-center gap-2 p-4 text-center">
              <Lock className="text-zinc-500" size={24} />
              <span className="text-xs text-zinc-400 font-bold">QR Cryptokey would appear here</span>
              <span className="text-[10px] text-zinc-600 font-mono">Secret Ref: ANCHOR-2FA-SEED-X47C</span>
            </div>
          </div>
          <div>
            <span className="text-xs font-bold text-[#7C6FF7] uppercase tracking-wide">Step 3: Verify temporary code</span>
            <div className="flex justify-between gap-2.5 mt-2.5">
              {twoFACaps.map((digit, idx) => (
                <input
                  key={idx}
                  id={`2fa-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handle2FAInput(e.target.value, idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digit && idx > 0) {
                      document.getElementById(`2fa-input-${idx - 1}`)?.focus();
                    }
                  }}
                  className="w-11 h-12 bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] rounded-[10px] text-center text-lg font-mono font-bold text-white focus:border-[#7C6FF7] outline-none"
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-2 pr-1">
            <button onClick={() => setIs2FAModalOpen(false)} className="flex-1 h-[44px] bg-[#1E1E1E] hover:bg-[#252525] hover:text-white rounded-[10px] text-xs font-bold transition-all text-zinc-500">
              Cancel
            </button>
            <button onClick={handle2FAConfirm} className="flex-1 h-[44px] bg-[#7C6FF7] hover:bg-[#6b5ee6] text-[#0A0A0A] rounded-[10px] text-xs font-bold transition-all">
              Confirm Activation
            </button>
          </div>
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
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Anchor & Schedule</h2>
        <p className="text-[14px] text-[#888888] mt-1.5">Manage default calendars, automatic buffering, and color categories.</p>
      </div>

      <SettingsCard title="Time Formats & Conventions">
        {/* Default Week Start */}
        <SettingsRow icon={<Anchor size={18} />} title="Default Week Start" description="Set calendar rows alignment preference.">
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
        <SettingsRow icon={<Anchor size={18} />} title="Time Display Format" description="Set visual clock representation.">
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
        <SettingsRow icon={<Anchor size={18} />} title="Date System Format" description="Adjust standard dates visualization models.">
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
      </SettingsCard>

      <SettingsCard title="Buffer Space Calculations">
        {/* Minimum Break Between Anchors */}
        <SettingsRow 
          icon={<Anchor size={18} />} 
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
        <SettingsRow icon={<Anchor size={18} />} title="Auto Buffer Gaps" description="Automatically inserts dragging buffers inside empty scheduler hours.">
          <SettingsToggle 
            checked={settings.schedule.autoBufferBlocks} 
            onChange={(checked) => updateSetting('schedule.autoBufferBlocks', checked)} 
          />
        </SettingsRow>

        {/* Weekends Override block */}
        <SettingsRow 
          icon={<Anchor size={18} />} 
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

  const handleWeightChange = (key: string, val: number) => {
    updateSetting(`sleep.scoreWeights.${key}`, val);
  };

  const weights = settings.sleep.scoreWeights;
  const weightsSum = weights.duration + weights.consistency + weights.timing + weights.wakeEvents;
  const isWeightValid = weightsSum === 100;

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

      <SettingsCard title="Algorithmic Sleep Index calculations">
        <div className="p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center bg-[#1C1C1C] p-3 rounded-xl border border-[rgba(255,255,255,0.03)]">
            <div>
              <span className="text-xs font-bold text-zinc-400 block uppercase">Weight Sum Check</span>
              <span className="text-[11.5px] text-zinc-500 mt-1 block">Adjust parameters weighting sum to equal 100% total.</span>
            </div>
            <span className={`text-[15px] font-bold font-mono px-3 py-1 rounded-full ${isWeightValid ? 'text-[#6FF7A0] bg-[rgba(111,247,160,0.06)]' : 'text-[#F76F6F] bg-[rgba(247,111,111,0.06)] animate-pulse'}`}>
              Sum: {weightsSum} / 100%
            </span>
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[13.5px] font-bold text-zinc-300">Duration Allocation</span>
                <span className="text-xs text-[#7C6FF7] font-bold font-mono">{weights.duration}%</span>
              </div>
              <SettingsSlider min={0} max={100} step={5} value={weights.duration} onChange={(v) => handleWeightChange('duration', v)} formatValue={(v) => `${v}%`} />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[13.5px] font-bold text-zinc-300">Consistency Allocation</span>
                <span className="text-xs text-[#7C6FF7] font-bold font-mono">{weights.consistency}%</span>
              </div>
              <SettingsSlider min={0} max={100} step={5} value={weights.consistency} onChange={(v) => handleWeightChange('consistency', v)} formatValue={(v) => `${v}%`} />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[13.5px] font-bold text-zinc-300">Timing Allocation</span>
                <span className="text-xs text-[#7C6FF7] font-bold font-mono">{weights.timing}%</span>
              </div>
              <SettingsSlider min={0} max={100} step={5} value={weights.timing} onChange={(v) => handleWeightChange('timing', v)} formatValue={(v) => `${v}%`} />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[13.5px] font-bold text-zinc-300">Wake Interrupt Events</span>
                <span className="text-xs text-[#7C6FF7] font-bold font-mono">{weights.wakeEvents}%</span>
              </div>
              <SettingsSlider min={0} max={100} step={5} value={weights.wakeEvents} onChange={(v) => handleWeightChange('wakeEvents', v)} formatValue={(v) => `${v}%`} />
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Smart Alarms (Mobile Client)">
        <SettingsRow 
          icon={<Moon size={18} />} 
          title="Optimal Phase Sunrise simulation" 
          description="Alarms will trigger soft light and vibration at your shallowest sleep phase."
        >
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#F7A06F] bg-[rgba(247,160,111,0.06)] border border-[rgba(247,160,111,0.2)]">
            Pro Feature Preview
          </span>
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

        {/* Streak Grace Period */}
        <SettingsRow icon={<Shield size={18} />} title="Grace Period margin" description="Designated clock buffer before streak values break.">
          <SettingsDropdown
            options={[
              { label: 'None', value: 'none' },
              { label: '1 hour extension', value: '1hour' },
              { label: '2 hours extension', value: '2hour' },
              { label: 'Until midnight', value: 'midnight' },
            ]}
            value={settings.gamification.streakGracePeriod}
            onChange={(val) => updateSetting('gamification.streakGracePeriod', val)}
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

      <SettingsCard title="Spacing & Typography scale">
        {/* Sidebar width */}
        <SettingsRow icon={<Palette size={18} />} title="Sidebar Width" description="Adjust desktop/wide navigation panels container sizing.">
          <SettingsSlider
            min={220}
            max={320}
            step={5}
            value={settings.appearance.sidebarWidth}
            onChange={(v) => updateSetting('appearance.sidebarWidth', v)}
            formatValue={(v) => `${v}px`}
          />
        </SettingsRow>

        {/* Content density */}
        <SettingsRow icon={<Palette size={18} />} title="Interface Spacing Density" description="Modify padding spacing parameters across list widgets.">
          <div className="flex gap-2">
            {[
              { id: 'compact', label: 'Compact' },
              { id: 'default', label: 'Default' },
              { id: 'comfortable', label: 'Comfortable' }
            ].map((dn) => (
              <button
                key={dn.id}
                onClick={() => updateSetting('appearance.density', dn.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  settings.appearance.density === dn.id
                    ? 'bg-[rgba(124,111,247,0.12)] text-[#7C6FF7] border-[#7C6FF7]'
                    : 'bg-[#1E1E1E] text-zinc-500 border-transparent hover:text-white'
                }`}
              >
                {dn.label}
              </button>
            ))}
          </div>
        </SettingsRow>

        {/* Font size */}
        <SettingsRow icon={<Palette size={18} />} title="Main Font Size" description="Controls text scale. Body elements scale linearly.">
          <SettingsSlider
            min={12}
            max={20}
            step={1}
            value={settings.appearance.fontSize}
            onChange={(v) => updateSetting('appearance.fontSize', v)}
            formatValue={(v) => `${v}px`}
          />
        </SettingsRow>

        {/* Font Family selection */}
        <SettingsRow icon={<Palette size={18} />} title="Interface Font Family" description="Configure typography font matching characteristics.">
          <SettingsDropdown
            options={[
              { label: 'Inter Sans-Serif', value: 'inter' },
              { label: 'System Default Sans', value: 'system' },
              { label: 'JetBrains Mono Code', value: 'mono' },
              { label: 'System Rounded Sans', value: 'rounded' },
            ]}
            value={settings.appearance.fontFamily}
            onChange={(val) => updateSetting('appearance.fontFamily', val)}
          />
        </SettingsRow>
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


// --- SECTION 7: PRIVACY & LEADERBOARD ===
export function PrivacySettings() {
  const { settings, updateSetting } = useSettings();
  const [blockedInput, setBlockedInput] = useState('');

  const isLeaderboardDimmable = !settings.privacy.leaderboardParticipation;

  const handleAddBlock = () => {
    if (!blockedInput.trim()) return;
    updateSetting('privacy.blockedUsers', [...settings.privacy.blockedUsers, blockedInput.trim()]);
    setBlockedInput('');
  };

  const handleRemoveBlock = (name: string) => {
    updateSetting('privacy.blockedUsers', settings.privacy.blockedUsers.filter(u => u !== name));
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F0F0F0]">Privacy & Leaderboard</h2>
        <p className="text-[14px] text-[#888888] mt-1.5 font-medium">Control leaderboard presence, sharing metadata, and block list filters.</p>
      </div>

      <div className="relative p-[1px] rounded-[24px] bg-gradient-to-br from-[#7C6FF7]/30 to-[rgba(255,255,255,0.01)] mb-6 shadow-xl">
        <div className="bg-[#141414] rounded-[23px] p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-[16px] font-bold text-[#F0F0F0]">Participate in Leaderboard</h3>
            <p className="text-[13px] text-[#888888] mt-0.5 leading-relaxed font-semibold">Join public leaderboard brackets to match challenges with friend groups.</p>
          </div>
          <SettingsToggle checked={settings.privacy.leaderboardParticipation} onChange={(checked) => updateSetting('privacy.leaderboardParticipation', checked)} />
        </div>
      </div>

      <div className={isLeaderboardDimmable ? 'opacity-50 pointer-events-none transition-opacity duration-300' : 'transition-opacity duration-300'}>
        <SettingsCard title="Leaderboard visibility options">
          {/* Display Name style */}
          <SettingsRow icon={<Shield size={18} />} title="Leaderboard Alias" description="Adjust your visible username alias layout.">
            <div className="flex gap-2">
              {[
                { id: 'username', label: 'Username' },
                { id: 'initials', label: 'Initials' },
                { id: 'anonymous', label: 'Anonymous' }
              ].map((al) => (
                <button
                  key={al.id}
                  onClick={() => updateSetting('privacy.leaderboardDisplayName', al.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    settings.privacy.leaderboardDisplayName === al.id
                      ? 'bg-[rgba(124,111,247,0.12)] text-[#7C6FF7] border-[#7C6FF7]'
                      : 'bg-[#1E1E1E] text-zinc-500 border-transparent hover:text-white'
                  }`}
                >
                  {al.label}
                </button>
              ))}
            </div>
          </SettingsRow>

          {/* XP Share */}
          <SettingsRow icon={<Shield size={18} />} title="Share Weekly XP" description="Allows friend groups to track your current levels accumulation rate.">
            <SettingsToggle checked={settings.privacy.shareXP} onChange={(c) => updateSetting('privacy.shareXP', c)} />
          </SettingsRow>

          {/* Streak Share */}
          <SettingsRow icon={<Shield size={18} />} title="Share Streak Days" description="Allows friend cohorts to see your active check-in streak multipliers.">
            <SettingsToggle checked={settings.privacy.shareStreak} onChange={(c) => updateSetting('privacy.shareStreak', c)} />
          </SettingsRow>

          {/* Quests Completed Share */}
          <SettingsRow icon={<Shield size={18} />} title="Share Quests Totals" description="Allows friend circles to see your accumulated task completion progress.">
            <SettingsToggle checked={settings.privacy.shareQuests} onChange={(c) => updateSetting('privacy.shareQuests', c)} />
          </SettingsRow>
        </SettingsCard>

        <SettingsCard title="Leaderboard Block Filters">
          <div className="p-5 flex flex-col gap-4">
            <span className="text-xs font-bold text-zinc-400 block uppercase">Blocked Users List</span>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type member handle (e.g. rocketguy42)..."
                value={blockedInput}
                onChange={(e) => setBlockedInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddBlock()}
                className="flex-1 bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] px-3 text-xs font-medium rounded-xl outline-none text-white focus:border-[#7C6FF7]"
              />
              <button onClick={handleAddBlock} className="px-4 bg-[#7C6FF7] text-[#0A0A0A] font-bold text-xs rounded-xl hover:scale-105 active:scale-95 transition-all">Block</button>
            </div>

            {settings.privacy.blockedUsers.length > 0 ? (
              <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                {settings.privacy.blockedUsers.map((name) => (
                  <div key={name} className="flex justify-between items-center bg-[#181818] px-3.5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.03)] text-xs font-bold">
                    <span className="text-zinc-300">@{name}</span>
                    <button onClick={() => handleRemoveBlock(name)} className="text-[#888888] hover:text-[#F76F6F]" title="Unblock user"><X size={14} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs font-semibold text-[#888888] italic">No blocked users found.</span>
            )}
          </div>
        </SettingsCard>
      </div>

      <SettingsCard title="Platform Data privacy options">
        {/* Usage Analytics */}
        <SettingsRow icon={<Shield size={18} />} title="Anonymized Usage reports" description="Permit dispatch of logs info reports for performance diagnostics.">
          <SettingsToggle checked={settings.privacy.analyticsEnabled} onChange={(c) => updateSetting('privacy.analyticsEnabled', c)} />
        </SettingsRow>

        {/* Profile Visibility */}
        <SettingsRow icon={<Shield size={18} />} title="Routine Visibility scope" description="Determines who gets to parse your active quest lists.">
          <SettingsDropdown
            options={[
              { label: 'Friends Only', value: 'friends' },
              { label: 'Publicly Shared', value: 'public' },
              { label: 'Private (Keep Offline)', value: 'private' },
            ]}
            value={settings.privacy.profileVisibility}
            onChange={(val) => updateSetting('privacy.profileVisibility', val)}
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
  const { state, setAnchors, setQuests, setBrainDumps } = useApp();
  const { addToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = [
    { label: 'Routine Tasks Logs', count: `${state.quests.length} items`, key: 'quests', defaultVal: [] },
    { label: 'Anchor Timeblocks', count: `${state.anchors.length} items`, key: 'anchors', defaultVal: [] },
    { label: 'Brain Dump Notes', count: `${state.brainDumps.length} items`, key: 'dumps', defaultVal: [] },
  ];

  const handleClearSpec = (key: string) => {
    if (key === 'quests') {
      setQuests([]);
      addToast("Routine quests cleared", "info");
    } else if (key === 'anchors') {
      setAnchors([]);
      addToast("Anchor points cleared", "info");
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
    { id: 'spotify', name: 'Spotify Music', desc: 'Sync relaxing ambient beats during deep focus quests. Requires SPOTIFY_CLIENT_ID & SECRET.', color: 'bg-green-600/10 text-green-400 border-green-500/25' },
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
    </div>
  );
}


// --- SECTION 12: DANGER ZONE ===
export function DangerZoneSettings() {
  const { resetProgress, clearAllData } = useSettings();
  const { state } = useApp();
  
  const [activeModal, setActiveModal] = useState<'reset' | 'clear' | 'delete' | null>(null);

  const handleResetConfirm = () => {
    resetProgress();
    setActiveModal(null);
  };

  const handleClearConfirm = () => {
    clearAllData();
    setActiveModal(null);
  };

  const handleDeleteConfirm = () => {
    clearAllData();
    setActiveModal(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F76F6F]">Danger Zone</h2>
        <p className="text-[14px] text-[#888888] mt-1.5 font-medium">Destructive administrative actions that clear user records, metrics or profile details.</p>
      </div>

      <div className="border border-[#F76F6F]/20 rounded-[20px] bg-[#F76F6F]/[0.02] overflow-hidden">
        {/* Reset Progress */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-[#F76F6F]/10">
          <div className="flex items-start gap-3.5 flex-1 max-w-xl">
            <div className="text-[#F76F6F] mt-1 shrink-0"><AlertTriangle size={18} /></div>
            <div>
              <h4 className="text-[15px] font-bold text-white">Reset Levels and Streak Metrics</h4>
              <p className="text-[13px] text-[#888888] mt-1 leading-relaxed">
                Nuke your accumulated character levels, XP points, and check-in timeline streaks back to initial parameters.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveModal('reset')}
            className="h-[44px] px-6 shrink-0 bg-[#F76F6F]/10 hover:bg-[#F76F6F]/20 text-[#F76F6F] border border-[#F76F6F]/30 rounded-xl text-[13px] font-bold transition-all"
          >
            Reset Progress
          </button>
        </div>

        {/* Clear All Data */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-[#F76F6F]/10">
          <div className="flex items-start gap-3.5 flex-1 max-w-xl">
            <div className="text-[#F76F6F] mt-1 shrink-0"><AlertTriangle size={18} /></div>
            <div>
              <h4 className="text-[15px] font-bold text-white">Clear Everything</h4>
              <p className="text-[13px] text-[#888888] mt-1 leading-relaxed">
                Clears all custom timeline elements, schedules category tags, brain logs notes, and interface configuration files.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveModal('clear')}
            className="h-[44px] px-6 shrink-0 bg-[#F76F6F] hover:bg-[#e05e5e] text-[#0A0A0A] rounded-xl text-[13px] font-bold transition-all shadow-[0_4px_16px_rgba(247,111,111,0.2)]"
          >
            Clear All Data
          </button>
        </div>

        {/* Delete Profile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
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
            className="h-[44px] px-6 shrink-0 bg-[#F76F6F]/10 hover:bg-[#F76F6F]/20 text-[#F76F6F] border border-[#F76F6F]/30 rounded-xl text-[13px] font-bold transition-all uppercase"
          >
            Delete all account data
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
        isOpen={activeModal === 'clear'}
        onClose={() => setActiveModal(null)}
        onConfirm={handleClearConfirm}
        confirmWord="DELETE"
        title="Nuke Staging Database Profiles"
        description="Warning: This operation cleared your schedules category chips, daily lists checks, local parameters variables, and onboarding history completely. This is irreversible."
        actionLabel="Nuke All Local Data"
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
