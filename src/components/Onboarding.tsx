import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, Anchor, Backpack, Flame, Moon, Eye, EyeOff, Check, AlertCircle, Sparkles, Sun, Laptop, User, Camera, Upload, Type, BarChart3, Gift, MessageSquare } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import LoadingScreen from './LoadingScreen';


const TOKENS = {
  bg: 'var(--color-bg)',
  surface: 'var(--color-surface)',
  surface2: 'var(--color-surface2)',
  primary: 'var(--color-primary)',
  secondary: 'var(--color-orange)',
  blue: 'var(--color-blue)',
  green: 'var(--color-success)',
  gold: 'var(--color-gold)',
  textPrimary: 'var(--color-text)',
  textMuted: 'var(--color-text-muted)',
  error: 'var(--color-error)',
  success: 'var(--color-success)',
};

const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    if (message) {
      const t = setTimeout(onClose, 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          style={{ backgroundColor: TOKENS.surface2, borderColor: 'rgba(255,255,255,0.1)' }}
          className="fixed bottom-8 right-8 px-6 py-3 rounded-full border shadow-2xl z-50 flex items-center gap-3"
        >
          <div style={{ backgroundColor: TOKENS.primary }} className="w-2 h-2 rounded-full animate-pulse" />
          <span style={{ color: TOKENS.textPrimary }} className="text-sm font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const OnboardingModal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#121212]/90 border border-[rgba(255,255,255,0.08)] rounded-[24px] max-w-md w-full p-6 shadow-2xl relative">
        <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
        {children}
        <button 
          onClick={onClose}
          className="mt-6 w-full h-11 bg-[#7C6FF7] text-black font-bold rounded-xl text-xs hover:opacity-90 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const TextInput = ({ 
  type = 'text', label, value, onChange, onBlur, error, valid, placeholder 
}: { 
  type?: string; label: string; value: string; 
  onChange: (v: string) => void; onBlur?: () => void; 
  error?: string; valid?: boolean; placeholder?: string 
}) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPwd = type === 'password';
  const displayType = isPwd && showPwd ? 'text' : type;

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="flex flex-col w-full">
        <label style={{ color: TOKENS.textPrimary }} className="text-sm font-medium mb-2 pl-1 select-none">{label}</label>
        <div 
          style={{ 
            backgroundColor: TOKENS.surface2, 
            borderColor: error ? TOKENS.error : valid ? TOKENS.success : 'rgba(255,255,255,0.08)',
            height: 52
          }}
          className="w-full rounded-[12px] border flex items-center px-4 relative transition-colors focus-within:border-opacity-50"
        >
          <input
            type={displayType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            aria-label={label}
            style={{ color: TOKENS.textPrimary }}
            className="w-full h-full bg-transparent outline-none border-none placeholder-[#888888] font-sans text-base"
          />
          {valid && !error && <Check size={18} color={TOKENS.success} className="ml-2 shrink-0 animate-in zoom-in-50" />}
          {isPwd && (
            <button 
              onClick={(e) => { e.preventDefault(); setShowPwd(!showPwd); }}
              className="ml-2 shrink-0 opacity-50 hover:opacity-100 transition-opacity p-2 -mr-2"
            >
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center gap-1.5 mt-2 pl-1">
              <AlertCircle size={14} color={TOKENS.error} />
              <span style={{ color: TOKENS.error }} className="text-xs font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const WheelColumn = ({ items, value, onChange, width, align = 'center' }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<any>(null);

  useEffect(() => {
    if (!isScrolling && containerRef.current) {
      const index = items.findIndex((i: any) => i.value === value);
      if (index !== -1) {
        containerRef.current.scrollTop = index * 44;
      }
    }
  }, [value, isScrolling, items]);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
      if (containerRef.current) {
        const index = Math.round(containerRef.current.scrollTop / 44);
        if (items[index] && items[index].value !== value) {
          onChange(items[index].value);
        }
      }
    }, 100);
  };

  const alignClass = align === 'right' ? 'justify-end pr-4' : align === 'left' ? 'justify-start pl-4' : 'justify-center';

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[220px] overflow-y-auto snap-y snap-mandatory hide-scrollbar relative z-10"
      style={{ width }}
    >
      <div className="h-[88px]" />
      {items.map((item: any) => {
        const isSelected = value === item.value;
        return (
          <div 
            key={item.value} 
            onClick={() => onChange(item.value)}
            className={`h-[44px] snap-center flex items-center ${alignClass} cursor-pointer select-none`}
          >
            <span 
              className="transition-all duration-200"
              style={{ 
                fontSize: isSelected ? '24px' : '20px',
                fontWeight: isSelected ? '500' : '500',
                color: isSelected ? '#FFFFFF' : '#4A4A4A',
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
      <div className="h-[88px]" />
    </div>
  );
};

const TimePickerIOS = ({ hour, minute, onChange }: { hour: number, minute: number, onChange: (h: number, m: number) => void }) => {
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? 'AM' : 'PM';

  const handleHourChange = (newDisplayHour: number) => {
    const isAm = ampm === 'AM';
    let newHour = newDisplayHour === 12 ? (isAm ? 0 : 12) : newDisplayHour + (isAm ? 0 : 12);
    onChange(newHour, minute);
  };

  const handleMinuteChange = (newMin: number) => {
    onChange(hour, newMin);
  };

  const handleAmPmChange = (newAmPm: string) => {
    if (newAmPm === ampm) return;
    let newHour = hour;
    if (newAmPm === 'AM') {
      newHour -= 12;
    } else {
      newHour += 12;
    }
    onChange(newHour, minute);
  };

  const hours = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1) }));
  const minutes = Array.from({ length: 60 }, (_, i) => ({ value: i, label: String(i).padStart(2, '0') }));
  const ampms = [{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }];

  return (
    <div className="relative flex justify-center items-center h-[220px] bg-[#111111] w-full rounded-[32px] overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Horizontal pill highlight */}
      <div className="absolute top-1/2 left-4 right-4 h-[44px] -translate-y-1/2 bg-[#2A2A2C] rounded-xl pointer-events-none z-0" />
      
      <div className="flex z-10 w-full justify-between">
        <WheelColumn items={hours} value={displayHour} onChange={handleHourChange} width="33%" align="right" />
        <WheelColumn items={minutes} value={minute} onChange={handleMinuteChange} width="33%" align="center" />
        <WheelColumn items={ampms} value={ampm} onChange={handleAmPmChange} width="33%" align="left" />
      </div>
    </div>
  );
};

// --- Stages ---
const Splash = ({ onNext, onLoginClick }: { onNext: () => void, onLoginClick: () => void }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden z-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center relative z-20"
      >
        <div className="flex items-center gap-4">
          <motion.div
             animate={{ scale: [1, 1.05, 1], filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'] }}
             transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
             style={{ backgroundColor: TOKENS.primary, color: TOKENS.bg }}
             className="w-16 h-16 rounded-[20px] flex items-center justify-center shadow-[0_8px_32px_rgba(124,111,247,0.4)]"
          >
            <BrainCircuit size={36} strokeWidth={2.5} />
          </motion.div>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 text-3xl font-bold text-center tracking-tight"
      >
        Welcome to Anchor
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{ color: TOKENS.textMuted }}
        className="mt-3 text-lg font-medium text-center max-w-[300px]"
      >
        Your day. Your rules.
      </motion.p>
      
      <div className="w-full flex flex-col items-center mt-12 gap-4">
        <motion.button
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4, delay: 0.8 }}
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
           onClick={onNext}
           style={{ backgroundColor: TOKENS.primary, color: TOKENS.bg }}
           className="w-full h-[56px] rounded-[14px] font-bold text-lg shadow-[0_8px_32px_rgba(124,111,247,0.4)]"
        >
          Get Started →
        </motion.button>

        <motion.button
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.4, delay: 1.0 }}
           onClick={onLoginClick}
           className="text-sm font-bold text-[#7C6FF7] hover:underline bg-transparent border-none cursor-pointer py-1"
        >
          Already have an account? Log In
        </motion.button>
      </div>
    </div>
  );
};

const AuthStage = ({ onNext, setToast, initialTab = 'signup' }: { onNext: () => void, setToast: (v: string) => void, initialTab?: 'signup'|'login' }) => {
  const { updateUser } = useApp();
  const [tab, setTab] = useState<'signup'|'login'>(initialTab as any);
  const [isTOSOpen, setIsTOSOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'number'|'code'>('number');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isEmailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isPwdValid = (p: string) => p.length >= 8;
  const isNameValid = (n: string) => n.length >= 2;
  const isConfValid = (c: string) => c === form.password && c.length > 0;

  const errors = {
    name: touched.name && !isNameValid(form.name) ? 'Name must be at least 2 characters.' : '',
    email: touched.email && !isEmailValid(form.email) ? 'Please enter a valid email address.' : '',
    password: touched.password && !isPwdValid(form.password) ? 'Password must be at least 8 characters.' : '',
    confirm: touched.confirm && !isConfValid(form.confirm) ? 'Passwords do not match.' : ''
  };

  const isSignUpValid = isNameValid(form.name) && isEmailValid(form.email) && isPwdValid(form.password) && isConfValid(form.confirm);
  const isLoginValid = isEmailValid(form.email) && isPwdValid(form.password);

  const handleSubmit = async () => {
    if (tab === 'signup' && !isSignUpValid) { setShake(s => s + 1); return; }
    if (tab === 'login' && !isLoginValid) { setShake(s => s + 1); return; }

    setLoading(true);
    try {
      const { registerEmail, loginEmail, setupRecaptcha, loginWithPhone } = await import('../lib/firebase');
      if (tab === 'signup') {
        const cred = await registerEmail(form.email, form.password);
        updateUser({ name: form.name, email: form.email });
        onNext();
      } else if (tab === 'login') {
        await loginEmail(form.email, form.password);
        onNext();
      } else if (tab === 'phone') {
        if (phoneStep === 'number') {
          const appVerifier = setupRecaptcha('recaptcha-container');
          const confResult = await loginWithPhone(phoneNumber, appVerifier);
          setConfirmationResult(confResult);
          setPhoneStep('code');
        } else {
          const cred = await confirmationResult.confirm(verificationCode);
          if (cred.user) {
            updateUser({ name: cred.user.displayName || 'User', email: cred.user.email || undefined, avatar: cred.user.displayName?.[0] || 'U' });
          }
          onNext();
        }
      }
    } catch (e: any) {
      setToast(e.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = async (providerName: string) => {
    setLoading(true);
    if (providerName === 'Google') {
      import('../lib/firebase').then(async ({ loginWithGoogle }) => {
        try {
          const cred = await loginWithGoogle();
          if (cred.user) {
            updateUser({ name: cred.user.displayName || 'User', email: cred.user.email || undefined, avatar: cred.user.displayName?.[0] || 'U' });
          }
          onNext(); // Move to next step
        } catch (error: any) {
          setToast(error.message || "Google login failed");
        }
        setLoading(false);
      });
      return;
    }
    setTimeout(() => {
      onNext();
      setLoading(false);
    }, 700);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto hide-scrollbar z-10 relative scroll-smooth">
      <div className="w-full my-auto flex flex-col py-8 shrink-0">
        
        {/* Tabs */}
        <div className="flex bg-[#1E1E1E] rounded-full p-1 border border-[rgba(255,255,255,0.06)] shadow-xl mb-8 relative self-center shrink-0">
          <div 
            className="absolute h-10 rounded-full transition-all duration-300" 
            style={{ 
              backgroundColor: TOKENS.surface,
              border: '1px solid rgba(255,255,255,0.1)',
              width: tab === 'signup' ? 96 : 84,
              transform: tab === 'signup' ? 'translateX(0)' : 'translateX(96px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}
          />
          <button 
            onClick={() => { setTab('signup'); setPhoneStep('number'); }}
            className="w-24 h-10 relative z-10 text-sm font-bold transition-colors"
            style={{ color: tab === 'signup' ? TOKENS.textPrimary : TOKENS.textMuted }}
          >
            Sign Up
            {tab === 'signup' && <motion.div layoutId="auth-tab" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-[#7C6FF7]" />}
          </button>
          <button 
            onClick={() => { setTab('login'); setPhoneStep('number'); }}
            className="w-[84px] h-10 relative z-10 text-sm font-bold transition-colors"
            style={{ color: tab === 'login' ? TOKENS.textPrimary : TOKENS.textMuted }}
          >
            Log In
            {tab === 'login' && <motion.div layoutId="auth-tab" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-[#7C6FF7]" />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={tab}
            initial={{ opacity: 0, x: tab === 'signup' ? -20 : (tab === 'login' ? 0 : 20) }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: tab === 'signup' ? 20 : -20 }}
            transition={{ duration: 0.15 }}
            className="w-full shrink-0"
          >
            <motion.div 
              animate={{ x: shake > 0 ? [-5, 5, -5, 5, 0] : 0 }} 
              transition={{ duration: 0.2 }}
              className="w-full flex flex-col items-center"
            >
              {tab === 'signup' && (
                <TextInput 
                  label="Display Name" 
                  value={form.name} 
                  onChange={(v) => setForm({ ...form, name: v })} 
                  onBlur={() => setTouched({ ...touched, name: true })}
                  error={errors.name} 
                  valid={isNameValid(form.name)}
                  placeholder="Alex"
                />
              )}
              {(tab === 'signup' || tab === 'login') && (
                <>
                  <TextInput 
                    label="Email" 
                    type="email"
                    value={form.email} 
                    onChange={(v) => setForm({ ...form, email: v })} 
                    onBlur={() => setTouched({ ...touched, email: true })}
                    error={errors.email} 
                    valid={isEmailValid(form.email)}
                    placeholder="alex@example.com"
                  />
                  <TextInput 
                    label="Password" 
                    type="password"
                    value={form.password} 
                    onChange={(v) => setForm({ ...form, password: v })} 
                    onBlur={() => setTouched({ ...touched, password: true })}
                    error={errors.password} 
                    valid={isPwdValid(form.password)}
                    placeholder="Min. 8 characters"
                  />
                </>
              )}
              {tab === 'signup' && (
                <TextInput 
                  label="Confirm Password" 
                  type="password"
                  value={form.confirm} 
                  onChange={(v) => setForm({ ...form, confirm: v })} 
                  onBlur={() => setTouched({ ...touched, confirm: true })}
                  error={errors.confirm} 
                  valid={isConfValid(form.confirm)}
                  placeholder="Match your password"
                />
              )}
              
              {tab === 'login' && (
                <div className="w-full flex justify-end mt-2">
                  <span className="text-sm font-bold cursor-pointer hover:underline" style={{ color: TOKENS.primary }}>Forgot password?</span>
                </div>
              )}

              <div className="flex items-center w-full my-6">
                <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
                <span className="px-4 text-xs font-bold uppercase tracking-widest text-[#888888]">or continue with</span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
              </div>

              <div className="w-full flex flex-col gap-3">
                <SocialBtn provider="Google" onClick={() => handleSocialClick('Google')} />
              </div>

              <div className="w-full mt-8 text-center px-4">
                <p className="text-xs text-[#888888] leading-relaxed select-none">
                  By continuing you agree to our <span onClick={() => setIsTOSOpen(true)} className="text-[#7C6FF7] cursor-pointer hover:underline font-medium">Terms</span> & <span onClick={() => setIsPrivacyOpen(true)} className="text-[#7C6FF7] cursor-pointer hover:underline font-medium">Privacy Policy</span>
                </p>
              </div>

              <div className="w-full mt-8 pb-4 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={tab === 'signup' ? !isSignUpValid : (tab === 'login' ? !isLoginValid : false) || loading}
                  className="w-full h-[52px] rounded-[14px] font-bold text-center flex items-center justify-center relative overflow-hidden disabled:opacity-50 transition-opacity"
                  style={{ backgroundColor: TOKENS.primary, color: TOKENS.bg }}
                >
                  {loading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-[#0A0A0A] border-t-transparent animate-spin"/>
                  ) : (
                    tab === 'signup' ? 'Create my Account' : 'Log In'
                  )}
                </motion.button>
              </div>

              {/* Terms of Service Modal */}
              <OnboardingModal isOpen={isTOSOpen} onClose={() => setIsTOSOpen(false)} title="Terms of Service Agreement">
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 text-zinc-300 text-[12px] leading-relaxed">
                  <p>By using Anchor, you agree to follow and be bound by these Terms of Service.</p>
                  <p className="font-bold text-white mt-1">1. Use of the Service</p>
                  <p>Anchor provides daily routine checklists and sleep tracking algorithms for personal productivity and habit building.</p>
                  <p className="font-bold text-white mt-1">2. Local Storage and Syncing</p>
                  <p>All data is saved locally on your device or synchronized securely via our database to ensure reliable offline-first functionality.</p>
                </div>
              </OnboardingModal>

              {/* Privacy Policy Modal */}
              <OnboardingModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} title="Data Privacy Policy">
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 text-zinc-300 text-[12px] leading-relaxed">
                  <p>Your privacy is extremely important to us. We collect initials, custom display names, habit logs, and sleep entries.</p>
                  <p className="font-bold text-white mt-1">1. Data Safety</p>
                  <p>We do not sell, trade, or share your tracking metrics with any advertisers or third-party analytical trackers.</p>
                  <p className="font-bold text-white mt-1">2. Data Security</p>
                  <p>All profile configurations synchronized via our database are encrypted and stored in fully isolated cloud vaults.</p>
                </div>
              </OnboardingModal>

            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const SocialBtn = ({ provider, onClick }: { provider: string, onClick: () => void }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.01, filter: 'brightness(1.1)' }}
      whileTap={{ scale: 0.98, opacity: 0.85 }}
      onClick={onClick}
      className="w-full h-[52px] rounded-[14px] flex items-center justify-center gap-3 border font-bold cursor-pointer select-none text-sm transition-all"
      style={{ backgroundColor: TOKENS.surface2, borderColor: 'rgba(255,255,255,0.08)', color: TOKENS.textPrimary }}
    >
      {provider === 'Google' && (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )}
      {provider === 'Phone' && (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      )}
      {provider === 'Apple' && (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 2.04C14.638 2.04 16.5 3.869 16.5 6.467c0 2.658-1.968 4.364-4.593 4.364-2.671 0-4.568-1.802-4.568-4.43C7.339 3.899 9.307 2.04 12 2.04m-3.585 9.4c1.996 0 3.863.896 4.887.896 1.054 0 3.447-1.12 5.865-1.12 1.488 0 4.254.607 5.927 3.068-5.32 2.92-4.469 10.56 1.066 12.825-1.258 3.69-3.955 7.822-7.854 7.822-1.91 0-3.32-1.251-5.63-1.251-2.25 0-4.043 1.25-5.748 1.25-3.87 0-7.399-4.884-8.868-8.91C-3.4 17.585.8 8.01 6.514 8.01c2.197 0 4.14 1.348 5.756 1.348" />
        </svg>
      )}
      <span>Continue with {provider}</span>
    </motion.button>
  );
};const IntroStage = ({ onNext }: { onNext: () => void }) => {
  const [slide, setSlide] = useState(0);
  
  const CARDS = [
    { 
      icon: <Flame size={40} color={TOKENS.secondary} />, 
      color: TOKENS.secondary, 
      title: "Quests & XP", 
      sub: "Complete daily quests to build streaks, earn XP, and form lasting healthy habits." 
    },
    { 
      icon: <Backpack size={40} color={TOKENS.blue} />, 
      color: TOKENS.blue, 
      title: "Your Loadouts", 
      sub: "Create smart checklist templates for your daily routines before leaving, not after." 
    },
    { 
      icon: <Moon size={40} color={TOKENS.primary} />, 
      color: TOKENS.primary, 
      title: "Circadian Sleep Tracker", 
      sub: "Log your sleep times easily, improve sleep hygiene, and lock in your bedtime windows." 
    },
    { 
      icon: <BarChart3 size={40} color={TOKENS.green} />, 
      color: TOKENS.green, 
      title: "Sleep & Habit Analytics", 
      sub: "Visualize your progress with nightly sleep recovery trends and deep routine stability scores." 
    },
    { 
      icon: <Gift size={40} color={TOKENS.gold} />, 
      color: TOKENS.gold, 
      title: "Level Rewards", 
      sub: "Redeem your hard-earned XP to unlock premium aesthetic level rewards and custom badges." 
    },
    { 
      icon: <MessageSquare size={40} color={TOKENS.primary} />, 
      color: TOKENS.primary, 
      title: "AI Anchor Assistant", 
      sub: "Chat with a server-side Gemini powered coach to analyze habits, adjust sleep, and get tailored tips." 
    }
  ];

  useEffect(() => {
    if (slide < CARDS.length - 1) {
      const t = setInterval(() => setSlide(s => s + 1), 4000);
      return () => clearInterval(t);
    }
  }, [slide, CARDS.length]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center md:pb-8 z-10 md:pt-16">
      
      <div className="flex-1 w-full flex items-center justify-center relative min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, info) => {
              if (info.offset.x < -30 && slide < CARDS.length - 1) setSlide(s => s + 1);
              if (info.offset.x > 30 && slide > 0) setSlide(s => s - 1);
            }}
            className="w-full text-center flex flex-col items-center absolute cursor-grab active:cursor-grabbing"
          >
            <div 
              className="w-24 h-24 rounded-[32px] flex items-center justify-center shadow-2xl mb-8"
              style={{ backgroundColor: TOKENS.surface2, border: `1px solid ${CARDS[slide].color}30` }}
            >
              {CARDS[slide].icon}
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">{CARDS[slide].title}</h2>
            <p className="text-base font-medium leading-relaxed px-4 max-w-[280px] mx-auto" style={{ color: TOKENS.textMuted }}>{CARDS[slide].sub}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full flex flex-col items-center mt-auto pb-4 shrink-0">
        <div className="flex gap-2 mb-10">
          {CARDS.map((_, i) => (
            <div 
              key={i}
              className={`h-2 rounded-full transition-all duration-300`}
              style={{ 
                width: slide === i ? 24 : 8,
                backgroundColor: slide === i ? TOKENS.primary : TOKENS.surface2
              }}
            />
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          {slide === CARDS.length - 1 ? (
             <motion.div key="btn" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }} className="w-full">
               <motion.button
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={onNext}
                 className="w-full h-[56px] rounded-[14px] font-bold text-center flex items-center justify-center text-lg shadow-[0_8px_32px_rgba(124,111,247,0.4)]"
                 style={{ backgroundColor: TOKENS.primary, color: TOKENS.bg }}
               >
                 Get Started →
               </motion.button>
             </motion.div>
          ) : (
              <div key="pad" className="w-full h-[56px]" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PersonalizationStage = ({ onFinish }: { onFinish: () => void }) => {
  const [step, setStep] = useState(1);
  const { state, updateUser } = useApp();
  const { settings, updateSetting } = useSettings();
  const [data, setData] = useState({
    wakeHour: 6,
    wakeMin: 30,
    sleepHour: 22,
    sleepMin: 30,
    activities: [] as string[],
    challenges: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const [customInitials, setCustomInitials] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300, facingMode: 'user' },
        audio: false
      });
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err: any) {
      console.error(err);
      setCameraError('Could not access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 300;
      canvas.height = video.videoHeight || 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const size = Math.min(canvas.width, canvas.height);
        const xOffset = (canvas.width - size) / 2;
        const yOffset = (canvas.height - size) / 2;
        
        canvas.width = size;
        canvas.height = size;
        
        ctx.drawImage(
          video,
          xOffset, yOffset, size, size,
          0, 0, size, size
        );
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        updateSetting('profile.avatarType', 'image');
        updateSetting('profile.avatarImage', dataUrl);
        updateUser({ avatar: dataUrl });
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        updateSetting('profile.avatarType', 'image');
        updateSetting('profile.avatarImage', base64);
        updateUser({ avatar: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, cameraActive]);

  useEffect(() => {
    if (state.user.avatar && state.user.avatar.length <= 2 && !state.user.avatar.startsWith('data:') && !state.user.avatar.includes('/') && !state.user.avatar.includes('.')) {
      setCustomInitials(state.user.avatar);
    }
  }, [state.user.avatar]);

  useEffect(() => {
    const saved = localStorage.getItem('anchor_personalization');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        setData(prev => ({ ...prev, ...parsed, activities: parsed.activities || [], challenges: parsed.challenges || (parsed.challenge ? [parsed.challenge] : []) })); 
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('anchor_personalization', JSON.stringify(data));
  }, [data]);

  const ACTIVITIES = ["School", "Work", "Sports", "Gym", "Chores", "Side Projects", "Gaming", "Family Time"];
  
  const CHALLENGES = [
    { id: 'sleep', icon: '😴', label: "I'm always tired" },
    { id: 'time', icon: '⏰', label: "Not enough hours" },
    { id: 'memory', icon: '🧠', label: "I forget things" },
    { id: 'focus', icon: '📱', label: "Distracted easily" },
  ];

  const handleToggleActivity = (act: string) => {
    if (data.activities.includes(act)) {
      setData(d => ({ ...d, activities: d.activities.filter(a => a !== act) }));
    } else {
      setData(d => ({ ...d, activities: [...d.activities, act] }));
    }
  };

  const handleToggleChallenge = (cId: string) => {
    if (data.challenges.includes(cId)) {
      setData(d => ({ ...d, challenges: d.challenges.filter(c => c !== cId) }));
    } else {
      setData(d => ({ ...d, challenges: [...d.challenges, cId] }));
    }
  };

  const submit = () => {
    setLoading(true);
    setTimeout(() => {
      onFinish();
    }, 1500); 
  };
  
  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    const minStr = String(m).padStart(2, '0');
    return `${hour12}:${minStr} ${period}`;
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="w-full h-full flex flex-col pt-6 pb-4 overflow-y-auto hide-scrollbar z-10 relative">
      <div className="text-center mb-8 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Configure Anchor</h1>
        {step < 7 && <p className="text-sm font-medium text-text-muted">Step {step} of 6</p>}
      </div>

      <div className="flex-1 flex flex-col shrink-0">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1">
              <h3 className="text-xl font-bold mb-8 text-center">What time do you usually wake up?</h3>
              <div className="flex justify-center items-center w-full mx-auto max-w-[320px]">
                <TimePickerIOS 
                  hour={data.wakeHour} 
                  minute={data.wakeMin} 
                  onChange={(h: number, m: number) => setData({ ...data, wakeHour: h, wakeMin: m })} 
                />
              </div>
              <div className="mt-auto pt-8">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={nextStep} className="w-full h-[56px] rounded-[14px] font-bold text-lg bg-primary text-white hover:opacity-90 transition-opacity">Next</motion.button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1">
              <h3 className="text-xl font-bold mb-8 text-center">What time do you usually sleep?</h3>
              <div className="flex justify-center items-center w-full mx-auto max-w-[320px]">
                <TimePickerIOS 
                  hour={data.sleepHour} 
                  minute={data.sleepMin} 
                  onChange={(h: number, m: number) => setData({ ...data, sleepHour: h, sleepMin: m })} 
                />
              </div>
              <div className="mt-auto pt-8 flex gap-3">
                <button onClick={prevStep} className="px-6 h-[56px] rounded-[14px] font-bold border border-border-strong text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors">Back</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={nextStep} className="flex-1 h-[56px] rounded-[14px] font-bold text-lg bg-primary text-white hover:opacity-90 transition-opacity">Next</motion.button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1">
              <h3 className="text-xl font-bold mb-8 text-center">What's part of your regular week?</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {ACTIVITIES.map(act => {
                  const isSel = data.activities.includes(act);
                  return (
                    <div 
                      key={act}
                      onClick={() => handleToggleActivity(act)}
                      className={`px-5 py-3 rounded-full text-sm font-bold cursor-pointer transition-all border select-none shadow-sm ${
                        isSel 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-surface-2 text-text-muted border-border-base hover:bg-surface-3'
                      }`}
                    >
                      {act}
                    </div>
                  );
                })}
              </div>
              <div className="mt-auto pt-8 flex gap-3">
                <button onClick={prevStep} className="px-6 h-[56px] rounded-[14px] font-bold border border-border-strong text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors">Back</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={nextStep} disabled={data.activities.length === 0} className="flex-1 h-[56px] rounded-[14px] font-bold text-lg bg-primary text-white disabled:opacity-50 hover:opacity-90 transition-opacity">Next</motion.button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1">
              <h3 className="text-xl font-bold mb-2 text-center">What do you struggle with the most?</h3>
              <p className="text-sm text-center mb-8 text-text-muted">Select all that apply</p>
              <div className="flex flex-col gap-3">
                {CHALLENGES.map(c => {
                  const isSel = data.challenges.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleToggleChallenge(c.id)}
                      className={`h-[72px] rounded-[16px] flex items-center px-5 cursor-pointer transition-all border select-none shadow-sm ${
                        isSel 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'bg-surface-2 border-border-base text-text-primary hover:bg-surface-3'
                      }`}
                    >
                      <span className="text-3xl mr-5">{c.icon}</span>
                      <span className="font-bold text-[16px]">{c.label}</span>
                      {isSel && <Check className="ml-auto text-primary" size={24} />}
                    </div>
                  );
                })}
              </div>
              <div className="mt-auto pt-8 flex gap-3">
                <button onClick={prevStep} className="px-6 h-[56px] rounded-[14px] font-bold border border-border-strong text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors">Back</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={nextStep} disabled={data.challenges.length === 0} className="flex-1 h-[56px] rounded-[14px] font-bold text-lg bg-primary text-white disabled:opacity-50 hover:opacity-90 transition-opacity">Next</motion.button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1 pb-4">
              <h3 className="text-xl font-bold mb-1 text-center">Customize Your Identity</h3>
              <p className="text-xs text-center mb-5 text-text-muted">Type custom initials, choose an emoji mascot, upload a photo, or take a picture!</p>
              
              <div className="flex flex-col items-center gap-4 mb-4 overflow-y-auto max-h-[420px] pr-1 scrollbar-thin">
                {/* Live Preview Circle */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7C6FF7] to-[#1E1133] border-2 border-primary flex items-center justify-center font-bold text-3xl shadow-[0_0_20px_rgba(124,111,247,0.35)] overflow-hidden shrink-0 text-white">
                    {state.user.avatar && (state.user.avatar.startsWith('data:') || state.user.avatar.includes('/') || state.user.avatar.includes('.')) ? (
                      <img src={state.user.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" />
                    ) : (
                      state.user.avatar || 'S'
                    )}
                  </div>
                </div>

                {/* CAMERA STREAM VIEW */}
                {cameraActive ? (
                  <div className="w-full bg-surface border border-border-strong rounded-2xl p-3 flex flex-col items-center gap-3">
                    <div className="w-full aspect-square max-w-[200px] overflow-hidden rounded-xl border border-dashed border-primary/40 relative bg-bg-base">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover transform -scale-x-100" 
                      />
                    </div>
                    {cameraError ? (
                      <p className="text-xs text-error text-center font-semibold">{cameraError}</p>
                    ) : (
                      <p className="text-[11px] text-text-muted text-center">Position your face in the camera view</p>
                    )}
                    <div className="flex w-full gap-2">
                      <button 
                        type="button" 
                        onClick={capturePhoto} 
                        className="flex-1 py-2 bg-primary text-white hover:opacity-90 rounded-[10px] text-xs font-bold transition-all"
                      >
                        Capture Photo
                      </button>
                      <button 
                        type="button" 
                        onClick={stopCamera} 
                        className="px-3 py-2 bg-surface-2 border border-border-base text-text-primary hover:bg-surface-3 rounded-[10px] text-xs font-bold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-4">
                    {/* CAMERA & FILE UPLOAD ACTION BAR */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="py-3 bg-surface-2 hover:bg-surface-3 border border-border-base rounded-[14px] text-xs font-bold text-text-primary flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Camera size={15} className="text-primary" />
                        Take Picture
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-3 bg-surface-2 hover:bg-surface-3 border border-border-base rounded-[14px] text-xs font-bold text-text-primary flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Upload size={15} className="text-blue-500" />
                        Upload Image
                      </button>

                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </div>

                    {/* CUSTOM INITIALS INPUT */}
                    <div className="bg-surface p-3 rounded-[20px] border border-border-base flex items-center gap-3">
                      <div className="p-2 bg-surface-2 rounded-lg text-primary">
                        <Type size={16} />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Custom Initials (Max 3 Chars)</label>
                        <input
                          type="text"
                          maxLength={3}
                          value={customInitials}
                          placeholder="e.g. JDO"
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                            setCustomInitials(val);
                            if (val) {
                              updateSetting('profile.avatarType', 'letter');
                              updateSetting('profile.avatarImage', null);
                              updateUser({ avatar: val });
                            }
                          }}
                          className="bg-transparent border-0 outline-none p-0 text-text-primary font-bold text-sm w-full mt-0.5 placeholder-text-muted/30"
                        />
                      </div>
                    </div>

                    {/* EMOJI MASCOT SELECTOR */}
                    <div className="w-full">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-2 px-1 text-center">Select Mascot</label>
                      <div className="grid grid-cols-6 gap-2 bg-surface p-2.5 rounded-[20px] border border-border-base">
                        {['⚡', '🧬', '👾', '🚀', '🔮', '🍀', '🍕', '🐱', '🐶', '🦊', '🐼', '🤖'].map((av) => (
                          <button
                            key={av}
                            type="button"
                            onClick={() => {
                              updateSetting('profile.avatarType', 'mascot');
                              updateSetting('profile.avatarImage', null);
                              updateUser({ avatar: av });
                            }}
                            className={`h-10 rounded-[10px] text-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                              state.user.avatar === av 
                                ? 'bg-primary/20 border-2 border-primary' 
                                : 'bg-surface-2 border border-border-base hover:bg-surface-3'
                            }`}
                          >
                            {av}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ACTIONS ROW */}
                    <div className="flex gap-2 w-full pt-1">
                      <button 
                        type="button"
                        onClick={() => {
                          const list = ['⚡', '🧬', '👾', '🚀', '🔮', '🍀', '🍕', '🐱', '🐶', '🦊', '🐼', '🤖'];
                          const rand = list[Math.floor(Math.random() * list.length)];
                          updateSetting('profile.avatarType', 'mascot');
                          updateSetting('profile.avatarImage', null);
                          updateUser({ avatar: rand });
                        }}
                        className="flex-1 py-2.5 bg-surface-2 hover:bg-surface-3 border border-border-base rounded-[12px] font-bold text-[11px] text-primary flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Sparkles size={12} />
                        Random Mascot
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          const initial = state.user.name ? state.user.name[0].toUpperCase() : 'S';
                          updateSetting('profile.avatarType', 'letter');
                          updateSetting('profile.avatarImage', null);
                          updateUser({ avatar: initial });
                          setCustomInitials(initial);
                        }}
                        className="flex-1 py-2.5 bg-surface-2 hover:bg-surface-3 border border-border-base rounded-[12px] font-bold text-[11px] text-text-muted hover:text-text-primary transition-all"
                      >
                        Reset to Initials
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-3 flex gap-3 shrink-0">
                <button onClick={prevStep} className="px-6 h-[56px] rounded-[14px] font-bold border border-border-strong text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors">Back</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={nextStep} className="flex-1 h-[56px] rounded-[14px] font-bold text-lg bg-primary text-white hover:opacity-90 transition-opacity">Next</motion.button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1">
              <h3 className="text-xl font-bold mb-2 text-center">Choose Visual Theme</h3>
              <p className="text-sm text-center mb-6 text-text-muted">Select how the app should appear on your screens</p>
              
              <div className="flex flex-col gap-3 mb-6">
                {[
                  { id: 'dark', label: 'Dark Mode', desc: 'Sleek, futuristic, and easy on the eyes', icon: <Moon size={22} className="text-primary" /> },
                  { id: 'light', label: 'Light Mode', desc: 'Crisp, high-contrast, and ultra-clean', icon: <Sun size={22} className="text-yellow-500" /> },
                  { id: 'auto', label: 'Match Browser', desc: 'Synchronizes in real-time with system settings', icon: <Laptop size={22} className="text-blue-500" /> }
                ].map((mode) => {
                  const isSel = settings.appearance.colorMode === mode.id;
                  return (
                    <div
                      key={mode.id}
                      onClick={() => {
                        updateSetting('appearance.colorMode', mode.id);
                      }}
                      className={`p-4 rounded-[16px] flex items-center gap-4 cursor-pointer transition-all border select-none shadow-sm ${
                        isSel 
                          ? 'bg-primary/10 border-primary' 
                          : 'bg-surface-2 border-border-base hover:bg-surface-3'
                      }`}
                    >
                      <div className="p-3 bg-surface rounded-[12px] border border-border-base shrink-0">
                        {mode.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-bold text-[15px] text-text-primary">{mode.label}</h4>
                        <p className="text-[12px] text-text-muted mt-0.5">{mode.desc}</p>
                      </div>
                      {isSel && <Check className="text-primary shrink-0" size={22} />}
                    </div>
                  );
                })}
              </div>

              <div className="mt-auto pt-4 flex gap-3">
                <button onClick={prevStep} className="px-6 h-[56px] rounded-[14px] font-bold border border-border-strong text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors">Back</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={nextStep} className="flex-1 h-[56px] rounded-[14px] font-bold text-lg bg-primary text-white hover:opacity-90 transition-opacity">Next</motion.button>
              </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1">
              <h3 className="text-xl font-bold mb-8 text-center">Is this information correct?</h3>
              
              <div className="bg-surface rounded-2xl p-6 border border-border-base shadow-xl mb-8 space-y-6 text-left">
                <div className="flex justify-between items-center pb-4 border-b border-border-base">
                  <span className="text-text-muted font-bold text-sm uppercase tracking-wide">Wake Up</span>
                  <span className="font-bold text-lg text-text-primary">{formatTime(data.wakeHour, data.wakeMin)}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border-base">
                  <span className="text-text-muted font-bold text-sm uppercase tracking-wide">Sleep</span>
                  <span className="font-bold text-lg text-text-primary">{formatTime(data.sleepHour, data.sleepMin)}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border-base">
                  <span className="text-text-muted font-bold text-sm uppercase tracking-wide">Avatar & Theme</span>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C6FF7] to-[#1E1133] border border-primary flex items-center justify-center text-sm font-bold shadow-[0_0_8px_rgba(124,111,247,0.3)] overflow-hidden shrink-0 text-white">
                      {state.user.avatar && (state.user.avatar.startsWith('data:') || state.user.avatar.includes('/') || state.user.avatar.includes('.')) ? (
                        <img src={state.user.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" />
                      ) : (
                        state.user.avatar || 'S'
                      )}
                    </span>
                    <span className="px-3 py-1 bg-surface-2 border border-border-base text-text-primary rounded-full text-xs font-semibold capitalize">
                      {settings.appearance.colorMode === 'auto' ? 'Match System' : settings.appearance.colorMode}
                    </span>
                  </div>
                </div>
                <div className="pb-4 border-b border-border-base">
                  <span className="text-text-muted font-bold text-sm uppercase tracking-wide block mb-3">Your Week</span>
                  <div className="flex flex-wrap gap-2">
                    {data.activities.map(act => (
                      <span key={act} className="px-3 py-1 bg-surface-2 border border-border-base text-text-primary rounded-full text-sm font-medium">{act}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-text-muted font-bold text-sm uppercase tracking-wide block mb-3">Challenges</span>
                  <div className="flex flex-wrap gap-2">
                    {data.challenges.map(cId => {
                      const chal = CHALLENGES.find(c => c.id === cId);
                      return chal ? <span key={cId} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium">{chal.icon} {chal.label}</span> : null;
                    })}
                  </div>
                </div>
              </div>

              {!confirmed ? (
                <div className="mt-auto flex gap-4">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(1)} className="flex-1 h-[56px] rounded-[14px] font-bold text-lg border border-border-strong text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors">No, edit</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setConfirmed(true)} className="flex-1 h-[56px] rounded-[14px] font-bold text-lg bg-[#6FF7A0] hover:bg-[#5ae68a] text-[#141414] transition-all">Yes, looks good</motion.button>
                </div>
              ) : (
                <div className="mt-auto">
                  <motion.button
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     whileHover={{ scale: 1.01 }}
                     whileTap={{ scale: 0.97 }}
                     onClick={submit}
                     className="w-full h-[56px] rounded-[14px] font-bold text-center flex items-center justify-center text-lg bg-primary text-white hover:opacity-90 shadow-lg transition-all"
                  >
                    {loading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"/>
                    ) : (
                      "Build my Anchor →"
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};


// --- Main Component ---
export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [authTab, setAuthTab] = useState<'signup'|'login'>('signup');
  const [toastMessage, setToastMessage] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const [isConnectingDb, setIsConnectingDb] = useState(false);

  const { updateUser } = useApp();
  const { user } = useAuth();
  const direction = useRef(1);
  
  const handleNext = (nextStep: number) => {
    direction.current = nextStep > step ? 1 : -1;
    if (nextStep === 2 && step === 1) {
      setIsConnectingDb(true);
      setTimeout(() => {
        setIsConnectingDb(false);
        setStep(2);
      }, 2500); // 2.5s for database connection loading simulation
    } else {
      setStep(nextStep);
    }
  };

  const handleFinish = () => {
    setIsFinishing(true);
    updateUser({ onboarded: true });
    localStorage.setItem('anchor_onboarded', 'true');
    if (user) {
      localStorage.setItem(`anchor_onboarded_${user.uid}`, 'true');
    }
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 40 : -40, opacity: 0 })
  };

  // Content for left side based on step
  const LEFT_CONTENT = [
    { text: "Your day. Your rules." },
    { text: "Save your progress and build your daily streaks." },
    { text: "Make Anchor perfectly suited to your life." },
    { text: "Turn your routines into an optimized flow." }
  ];

  if (isConnectingDb) {
    return <LoadingScreen />;
  }

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes xpBurst {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100px) scale(0); opacity: 0; }
        }
        .particle {
          position: absolute; left: 50%; top: 50%;
          width: 8px; height: 8px; border-radius: 50%;
          background: ${TOKENS.gold};
          animation: xpBurst 1s ease-out forwards;
        }
      `}</style>

      <div className="w-full h-screen flex flex-col md:flex-row bg-bg-base overflow-hidden text-text-primary font-sans">
        
        {/* LEFT HALF (DESKTOP) */}
        <div className="hidden md:flex flex-col w-1/2 h-full bg-surface border-r border-border-base relative p-12 lg:p-24 justify-between shrink-0">
           <div className="flex items-center gap-3 relative z-10">
             <Anchor size={36} className="text-primary" strokeWidth={2.5} />
             <span className="font-bold text-3xl tracking-tight text-text-primary">Anchor</span>
           </div>

           <div className="relative z-10 max-w-[480px]">
             <AnimatePresence mode="wait">
                <motion.h2
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="text-[40px] lg:text-[56px] font-bold leading-[1.1] tracking-tight"
                >
                  {LEFT_CONTENT[step - 1].text}
                </motion.h2>
             </AnimatePresence>
           </div>

           {/* Step Indicator */}
           <div className="flex gap-3 relative z-10">
             {[1,2,3,4].map((s) => (
                <div 
                  key={s} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    s === step ? 'w-8' : 'w-3'
                  } ${
                    s <= step ? 'bg-primary' : 'bg-surface-2'
                  }`}
                />
             ))}
           </div>
           
           {/* Decorative Background Blob */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary rounded-full blur-[120px] opacity-[0.04] pointer-events-none" />
        </div>

        {/* RIGHT HALF (FORM) */}
        <div className="w-full md:w-1/2 h-full relative flex flex-col items-center justify-center bg-bg-base">
            
          {/* Progress Bar (Top) */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-surface-2 z-50 overflow-hidden">
             <motion.div
                initial={{ width: `${((step - 1) / 4) * 100}%` }}
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full bg-primary shadow-[0_0_8px_var(--color-primary)]"
             />
          </div>

          <div className="w-full h-full max-w-[420px] mx-auto flex flex-col relative px-6 md:px-0">
             
             {/* Mobile Logo Header */}
             <div className="md:hidden flex items-center justify-center gap-2 pt-12 pb-6 shrink-0 z-20">
                <BrainCircuit size={28} color={TOKENS.primary} />
                <span className="font-bold text-2xl tracking-tight">Anchor</span>
             </div>

             {/* Stages Area */}
             <div className="flex-1 relative w-full h-full overflow-hidden">
               <AnimatePresence mode="popLayout" custom={direction.current}>
                  {step === 1 && (
                     <motion.div key="1" custom={direction.current} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="w-full h-full absolute inset-0">
                        <Splash 
                          onNext={() => {
                            setAuthTab('signup');
                            handleNext(2);
                          }} 
                          onLoginClick={() => {
                            setAuthTab('login');
                            handleNext(2);
                          }}
                        />
                     </motion.div>
                  )}
                  {step === 2 && (
                     <motion.div key="2" custom={direction.current} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="w-full h-full absolute inset-0">
                        <AuthStage onNext={() => handleNext(3)} setToast={setToastMessage} initialTab={authTab} />
                     </motion.div>
                  )}
                  {step === 3 && (
                     <motion.div key="3" custom={direction.current} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="w-full h-full absolute inset-0">
                        <PersonalizationStage onFinish={() => handleNext(4)} />
                     </motion.div>
                  )}
                  {step === 4 && (
                     <motion.div key="4" custom={direction.current} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="w-full h-full absolute inset-0">
                        <IntroStage onNext={handleFinish} />
                     </motion.div>
                  )}
               </AnimatePresence>
             </div>
          </div>
          
          {/* Celebration Overlay */}
          <AnimatePresence>
            {isFinishing && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-bg-base"
              >
                <div style={{ backgroundColor: TOKENS.primary }} className="w-24 h-24 rounded-[32px] flex items-center justify-center shadow-[0_0_64px_rgba(124,111,247,0.8)] relative">
                  <Anchor size={48} color={TOKENS.bg} className="relative z-10" />
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="particle" 
                      style={{ 
                        transform: `rotate(${i * 30}deg) translateY(-60px)`, 
                        animationDelay: `${Math.random() * 0.2}s` 
                      }} 
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      </div>
    </>
  );
}
