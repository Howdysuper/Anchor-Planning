import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, Anchor, Backpack, Flame, Moon, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';


const TOKENS = {
  bg: '#0A0A0A',
  surface: '#141414',
  surface2: '#1E1E1E',
  primary: '#7C6FF7',
  secondary: '#F7A06F',
  blue: '#6FBBF7',
  green: '#6FF7A0',
  gold: '#F7D96F',
  textPrimary: '#F0F0F0',
  textMuted: '#888888',
  error: '#F76F6F',
  success: '#6FF7A0',
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

const WheelPicker = ({ value, min, max, onChange, label, format = (v: number) => String(v) }: any) => {
  const items = [];
  for (let i = min; i <= max; i++) items.push(i);
  
  return (
    <div className="flex flex-col items-center flex-1">
      <span className="text-xs tracking-widest font-bold uppercase mb-4" style={{ color: TOKENS.textMuted }}>{label}</span>
      <div 
        className="h-[150px] overflow-y-auto snap-y snap-mandatory rounded-2xl w-[120px] relative hide-scrollbar border border-[rgba(255,255,255,0.06)]"
        style={{ backgroundColor: TOKENS.surface2 }}
      >
        <div className="h-[50px]" /> {/* Top padding */}
        {items.map((item) => (
          <div 
            key={item} 
            onClick={() => onChange(item)}
            className="h-[50px] snap-center flex items-center justify-center font-bold text-xl cursor-pointer transition-all px-2 select-none whitespace-nowrap"
            style={{ 
              color: value === item ? TOKENS.textPrimary : TOKENS.textMuted,
              transform: value === item ? 'scale(1.05)' : 'scale(1)',
              opacity: value === item ? 1 : 0.4
            }}
          >
            {format(item)}
          </div>
        ))}
        <div className="h-[50px]" /> {/* Bottom padding */}
        
        {/* Highlight strip centrally fixed */}
        <div className="absolute top-[50px] left-0 w-full h-[50px] border-y border-[rgba(124,111,247,0.3)] pointer-events-none bg-[rgba(124,111,247,0.05)]" />
      </div>
    </div>
  );
};

// --- Stages ---
const Splash = ({ onNext }: { onNext: () => void }) => {
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
      
      <motion.button
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.4, delay: 0.8 }}
         whileHover={{ scale: 1.02 }}
         whileTap={{ scale: 0.98 }}
         onClick={onNext}
         style={{ backgroundColor: TOKENS.primary, color: TOKENS.bg }}
         className="mt-12 w-full h-[56px] rounded-[14px] font-bold text-lg shadow-[0_8px_32px_rgba(124,111,247,0.4)]"
      >
        Get Started →
      </motion.button>
    </div>
  );
};

const AuthStage = ({ onNext, setToast }: { onNext: () => void, setToast: (v: string) => void }) => {
  const { updateUser } = useApp();
  const [tab, setTab] = useState<'signup'|'login'>('signup');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);

  const [form, setForm] = useState({ name: '', username: '', password: '', confirm: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isUsernameValid = (e: string) => /^[a-zA-Z0-9_]{3,15}$/.test(e);
  const isPwdValid = (p: string) => p.length >= 8;
  const isNameValid = (n: string) => n.length >= 2;
  const isConfValid = (c: string) => c === form.password && c.length > 0;

  const errors = {
    name: touched.name && !isNameValid(form.name) ? 'Name must be at least 2 characters.' : '',
    username: touched.username && !isUsernameValid(form.username) ? 'Username 3-15 chars (letters, numbers, _).' : '',
    password: touched.password && !isPwdValid(form.password) ? 'Password must be at least 8 characters.' : '',
    confirm: touched.confirm && !isConfValid(form.confirm) ? 'Passwords do not match.' : ''
  };

  const isSignUpValid = isNameValid(form.name) && isUsernameValid(form.username) && isPwdValid(form.password) && isConfValid(form.confirm);
  const isLoginValid = isUsernameValid(form.username) && isPwdValid(form.password);

  const handleSubmit = async () => {
    if (tab === 'signup' && !isSignUpValid) { setShake(s => s + 1); return; }
    if (tab === 'login' && !isLoginValid) { setShake(s => s + 1); return; }

    setLoading(true);
    setTimeout(() => {
      // Allow them to use username as in-app presence
      updateUser({ name: form.username });
      onNext();
      setLoading(false);
    }, 700);
  };

  const handleSocialClick = async (providerName: string) => {
    setLoading(true);
    if (providerName === 'Google') {
      import('../lib/firebase').then(async ({ loginWithGoogle }) => {
        try {
          await loginWithGoogle();
          onNext(); // Move to next step
        } catch (error) {
          setToast("Google login failed");
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
    <div className="w-full h-full flex flex-col pb-8 pt-4 justify-center overflow-y-auto hide-scrollbar z-10 relative">
      
      {/* Tabs */}
      <div className="flex bg-[#1E1E1E] rounded-full p-1 border border-[rgba(255,255,255,0.06)] shadow-xl mb-8 relative self-center shrink-0">
        <div 
          className="absolute h-10 rounded-full transition-transform duration-300" 
          style={{ 
            backgroundColor: TOKENS.surface,
            border: '1px solid rgba(255,255,255,0.1)',
            width: tab === 'signup' ? 96 : 84,
            transform: tab === 'signup' ? 'translateX(0)' : 'translateX(96px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}
        />
        <button 
          onClick={() => setTab('signup')}
          className="w-24 h-10 relative z-10 text-sm font-bold transition-colors"
          style={{ color: tab === 'signup' ? TOKENS.textPrimary : TOKENS.textMuted }}
        >
          Sign Up
          {tab === 'signup' && <motion.div layoutId="auth-tab" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-[#7C6FF7]" />}
        </button>
        <button 
          onClick={() => setTab('login')}
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
          initial={{ opacity: 0, x: tab === 'signup' ? -20 : 20 }}
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
            <TextInput 
              label="Username" 
              type="text"
              value={form.username} 
              onChange={(v) => setForm({ ...form, username: v })} 
              onBlur={() => setTouched({ ...touched, username: true })}
              error={errors.username} 
              valid={isUsernameValid(form.username)}
              placeholder="alex_123"
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
              <SocialBtn provider="Apple" onClick={() => handleSocialClick('Apple')} />
            </div>

            <div className="w-full mt-8 text-center px-4">
              <p className="text-xs text-[#888888] leading-relaxed">
                By continuing you agree to our <span className="text-[#7C6FF7] cursor-pointer hover:underline font-medium">Terms</span> & <span className="text-[#7C6FF7] cursor-pointer hover:underline font-medium">Privacy Policy</span>
              </p>
            </div>

            <div className="w-full mt-8 pb-4 shrink-0">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={tab === 'signup' ? !isSignUpValid : !isLoginValid || loading}
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

          </motion.div>
        </motion.div>
      </AnimatePresence>
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
      {provider === 'Apple' && (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 2.04C14.638 2.04 16.5 3.869 16.5 6.467c0 2.658-1.968 4.364-4.593 4.364-2.671 0-4.568-1.802-4.568-4.43C7.339 3.899 9.307 2.04 12 2.04m-3.585 9.4c1.996 0 3.863.896 4.887.896 1.054 0 3.447-1.12 5.865-1.12 1.488 0 4.254.607 5.927 3.068-5.32 2.92-4.469 10.56 1.066 12.825-1.258 3.69-3.955 7.822-7.854 7.822-1.91 0-3.32-1.251-5.63-1.251-2.25 0-4.043 1.25-5.748 1.25-3.87 0-7.399-4.884-8.868-8.91C-3.4 17.585.8 8.01 6.514 8.01c2.197 0 4.14 1.348 5.756 1.348" />
        </svg>
      )}
      <span>Continue with {provider}</span>
    </motion.button>
  );
};

const IntroStage = ({ onNext }: { onNext: () => void }) => {
  const [slide, setSlide] = useState(0);
  
  const CARDS = [
    { icon: <Anchor size={40} color={TOKENS.primary} />, color: TOKENS.primary, title: "Build your flow", sub: "Add your fixed anchors and let the system schedule the buffer." },
    { icon: <Backpack size={40} color={TOKENS.blue} />, color: TOKENS.blue, title: "Your loadouts", sub: "Checklists before you leave—not after." },
    { icon: <Flame size={40} color={TOKENS.secondary} />, color: TOKENS.secondary, title: "Quests & XP", sub: "Earn points. Build streaks. Stay consistent." },
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
                 Set up profile →
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
  const [data, setData] = useState({
    wakeHour: 6, wakeMin: 30,
    sleepHour: 22, sleepMin: 30,
    weekendWakeHour: 8, weekendWakeMin: 0,
    weekendSleepHour: 23, weekendSleepMin: 30,
    activities: [] as string[],
    challenge: '',
    leaderboard: false,
    username: ''
  });

  const [scheduleTab, setScheduleTab] = useState<'weekday' | 'weekend'>('weekday');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('anchor_personalization');
    if (saved) {
      try { setData(JSON.parse(saved)); } catch (e) {}
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

  const isReady = data.activities.length > 0 && data.challenge !== '';

  const submit = () => {
    setLoading(true);
    setTimeout(() => {
      onFinish();
    }, 1500); 
  };
  
  const formatHour = (v: number) => {
    const normalized = ((v % 24) + 24) % 24;
    if (normalized === 0) return '12:00 AM';
    if (normalized === 12) return '12:00 PM';
    if (normalized > 12) return `${normalized - 12}:00 PM`;
    return `${normalized}:00 AM`;
  };

  return (
    <div className="w-full h-full flex flex-col pt-6 pb-4 overflow-y-auto hide-scrollbar z-10 relative">
      
      <div className="text-center mb-8 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Configure Anchor</h1>
        <p className="text-sm font-medium" style={{ color: TOKENS.textMuted }}>Takes about 90 seconds</p>
      </div>

      <div className="space-y-10 shrink-0">
        
        {/* Section A - Schedule */}
        <div>
          <div className="flex items-center gap-2 mb-4 bg-[#1E1E1E] p-1 rounded-xl w-fit border border-[rgba(255,255,255,0.06)] transform-gpu">
            <button 
              onClick={() => setScheduleTab('weekday')}
              className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all relative z-10"
              style={{ color: scheduleTab === 'weekday' ? TOKENS.textPrimary : TOKENS.textMuted }}
            >
              Weekdays
              {scheduleTab === 'weekday' && <motion.div layoutId="sched-tab" className="absolute inset-0 bg-[#333] rounded-lg -z-10 shadow-sm border border-[rgba(255,255,255,0.08)]" />}
            </button>
            <button 
              onClick={() => setScheduleTab('weekend')}
              className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all relative z-10"
              style={{ color: scheduleTab === 'weekend' ? TOKENS.textPrimary : TOKENS.textMuted }}
            >
              Weekends
              {scheduleTab === 'weekend' && <motion.div layoutId="sched-tab" className="absolute inset-0 bg-[#333] rounded-lg -z-10 shadow-sm border border-[rgba(255,255,255,0.08)]" />}
            </button>
          </div>
          
          <div className="flex justify-between items-center bg-[#141414] p-6 rounded-3xl border border-[rgba(255,255,255,0.06)] shadow-xl w-full relative overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div 
                key={scheduleTab}
                initial={{ opacity: 0, x: scheduleTab === 'weekday' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: scheduleTab === 'weekday' ? 20 : -20 }}
                transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 25 }}
                className="flex w-full justify-between items-center gap-4"
              >
                 <WheelPicker 
                   label="Wake Up" 
                   min={0} max={23} 
                   value={scheduleTab === 'weekday' ? data.wakeHour : data.weekendWakeHour} 
                   onChange={(v: number) => setData(scheduleTab === 'weekday' ? { ...data, wakeHour: v } : { ...data, weekendWakeHour: v })} 
                   format={formatHour}
                 />
                 <div className="w-[1px] h-32 bg-[rgba(255,255,255,0.08)] shrink-0" />
                 <WheelPicker 
                   label="Sleep" 
                   min={0} max={23} 
                   value={scheduleTab === 'weekday' ? data.sleepHour : data.weekendSleepHour} 
                   onChange={(v: number) => setData(scheduleTab === 'weekday' ? { ...data, sleepHour: v } : { ...data, weekendSleepHour: v })} 
                   format={formatHour}
                 />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Section B - Activities */}
        <div>
          <h3 className="text-base font-bold mb-4">What's part of your regular week?</h3>
          <div className="flex flex-wrap gap-2">
            {ACTIVITIES.map(act => {
              const isSel = data.activities.includes(act);
              return (
                <div 
                  key={act}
                  onClick={() => handleToggleActivity(act)}
                  className="px-4 py-2.5 rounded-full text-sm font-bold cursor-pointer transition-all border select-none"
                  style={{ 
                    backgroundColor: isSel ? TOKENS.primary : TOKENS.surface2,
                    color: isSel ? TOKENS.textPrimary : TOKENS.textMuted,
                    borderColor: isSel ? TOKENS.primary : 'rgba(255,255,255,0.06)',
                  }}
                >
                  {act}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section C - Challenge */}
        <div>
          <h3 className="text-base font-bold mb-4">What do you struggle with most?</h3>
          <div className="flex flex-col gap-3">
            {CHALLENGES.map(c => {
              const isSel = data.challenge === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setData({ ...data, challenge: c.id })}
                  className="h-16 rounded-[16px] flex items-center px-4 cursor-pointer transition-all border-l-4 border-r border-y select-none"
                  style={{
                    backgroundColor: isSel ? 'rgba(124,111,247,0.1)' : TOKENS.surface2,
                    borderLeftColor: isSel ? TOKENS.primary : 'rgba(255,255,255,0.06)',
                    borderRightColor: 'rgba(255,255,255,0.06)',
                    borderTopColor: 'rgba(255,255,255,0.06)',
                    borderBottomColor: 'rgba(255,255,255,0.06)'
                  }}
                >
                  <span className="text-2xl mr-4">{c.icon}</span>
                  <span className="font-medium text-[15px]">{c.label}</span>
                  {isSel && <Check className="ml-auto" color={TOKENS.primary} size={20} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 sticky bottom-0 z-20 pb-4 bg-[#0A0A0A] pt-4 shrink-0 shadow-[0_-24px_32px_#0A0A0A]">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          onClick={isReady ? submit : undefined}
          style={{ 
            backgroundColor: isReady ? TOKENS.primary : TOKENS.surface2, 
            color: isReady ? TOKENS.bg : TOKENS.textMuted,
            boxShadow: isReady ? '0 8px 32px rgba(124,111,247,0.4)' : 'none'
          }}
          className="w-full h-[56px] rounded-[14px] font-bold text-center flex items-center justify-center text-lg transition-all"
        >
          {loading ? (
            <div className="w-5 h-5 rounded-full border-2 border-[#0A0A0A] border-t-transparent animate-spin"/>
          ) : (
            "Build my Anchor →"
          )}
        </motion.button>
      </div>

    </div>
  );
};


// --- Main Component ---
export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  const direction = useRef(1);
  const handleNext = (nextStep: number) => {
    direction.current = nextStep > step ? 1 : -1;
    setStep(nextStep);
  };

  const handleFinish = () => {
    setIsFinishing(true);
    localStorage.setItem('anchor_onboarded', 'true');
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
    { text: "Turn your routines into an optimized flow." },
    { text: "Make Anchor perfectly suited to your life." }
  ];

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

      <div className="w-full h-screen flex flex-col md:flex-row bg-[#0A0A0A] overflow-hidden text-[#F0F0F0] font-sans">
        
        {/* LEFT HALF (DESKTOP) */}
        <div className="hidden md:flex flex-col w-1/2 h-full bg-[#141414] border-r border-[rgba(255,255,255,0.06)] relative p-12 lg:p-24 justify-between shrink-0">
           <div className="flex items-center gap-3 relative z-10">
             <Anchor size={36} color={TOKENS.primary} strokeWidth={2.5} />
             <span className="font-bold text-3xl tracking-tight">Anchor</span>
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
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ 
                    width: s === step ? 32 : 12, 
                    backgroundColor: s <= step ? TOKENS.primary : TOKENS.surface2 
                  }}
                />
             ))}
           </div>
           
           {/* Decorative Background Blob */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7C6FF7] rounded-full blur-[120px] opacity-[0.04] pointer-events-none" />
        </div>

        {/* RIGHT HALF (FORM) */}
        <div className="w-full md:w-1/2 h-full relative flex flex-col items-center justify-center bg-[#0A0A0A]">
            
          {/* Progress Bar (Top) */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-[#1E1E1E] z-50 overflow-hidden">
             <motion.div
                initial={{ width: `${((step - 1) / 4) * 100}%` }}
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full bg-[#7C6FF7]"
                style={{ boxShadow: `0 0 8px ${TOKENS.primary}` }}
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
                        <Splash onNext={() => handleNext(2)} />
                     </motion.div>
                  )}
                  {step === 2 && (
                     <motion.div key="2" custom={direction.current} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="w-full h-full absolute inset-0">
                        <AuthStage onNext={() => handleNext(3)} setToast={setToastMessage} />
                     </motion.div>
                  )}
                  {step === 3 && (
                     <motion.div key="3" custom={direction.current} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="w-full h-full absolute inset-0">
                        <IntroStage onNext={() => handleNext(4)} />
                     </motion.div>
                  )}
                  {step === 4 && (
                     <motion.div key="4" custom={direction.current} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="w-full h-full absolute inset-0">
                        <PersonalizationStage onFinish={handleFinish} />
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
                className="absolute inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]"
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
