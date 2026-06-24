import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { 
  Home, 
  Anchor, 
  Backpack, 
  Brain, 
  Sword, 
  Moon, 
  Trophy, 
  Settings,
  Plus,
  LogOut,
  User as UserIcon,
  ChevronDown,
  BarChart3,
  Inbox,
  MessageSquareText,
  X
} from 'lucide-react';
import { logout } from '../lib/firebase';
import { ThemeStatusPill } from './settings/ThemeStatusPill';
import Modal from './ui/Modal';
import { ChatBotWidget } from './ChatBotModal';
import { AnimatePresence, motion } from 'motion/react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'loadout', label: 'Loadout', icon: Backpack },
  { id: 'quests', label: 'Tasks', icon: Inbox },
  { id: 'stats', label: 'Analytics', icon: BarChart3 },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { state, navigate, setBrainDumps } = useApp();
  const { addToast } = useToast();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [captureText, setCaptureText] = useState('');

  const activeTab = state.currentPage;

  const handleLogout = () => {
    localStorage.removeItem('anchor_app_state');
    logout();
    addToast('Logged out (refresh to reset UI state)', 'error');
  };

  const handleCapture = () => {
    if (!captureText.trim()) return;
    setBrainDumps([{
      id: Date.now(),
      text: captureText,
      time: 'Just now',
      category: 'idea',
      color: 'orange'
    }, ...state.brainDumps]);
    addToast('Captured to Brain Dump', 'success');
    setShowCaptureModal(false);
    setCaptureText('');
  };

  // Keyboard layout for capture and settings
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCaptureModal(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        navigate('settings');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate]);

  return (
    <div className="flex h-screen w-full bg-bg-base text-text-primary overflow-hidden font-sans">
      {/* SIDEBAR (Desktop & Tablet) */}
      <aside className="hidden md:flex flex-col bg-surface border-r border-border-base shrink-0 transition-all duration-300 w-[72px] xl:w-[260px] pt-[28px] pb-6 px-3 xl:px-6">
        {/* Top Header */}
        <div className="flex items-center justify-center xl:justify-start gap-3 mb-[36px] overflow-hidden">
          <div className="shrink-0 flex items-center justify-center">
            <Anchor size={32} color="#7C6FF7" strokeWidth={2.5} />
          </div>
          <h1 className="font-bold text-[22px] tracking-tight hidden xl:block whitespace-nowrap">Anchor</h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-[6px] relative flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex flex-col xl:flex-row items-center justify-center xl:justify-start min-h-[56px] xl:min-h-[48px] w-full px-0 xl:px-3.5 rounded-[12px] transition-all border-l-[3px] md:border-l-0 xl:border-l-[3px] group gap-1 xl:gap-0 ${
                  isActive 
                    ? 'bg-primary-tint/15 text-primary border-primary font-semibold' 
                    : 'bg-transparent text-text-muted hover:bg-surface-2 hover:text-text-primary border-transparent font-medium'
                }`}
              >
                <Icon size={20} className={`shrink-0 transition-transform ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
                <span className="xl:ml-[14px] text-[9px] xl:text-[15px] whitespace-nowrap select-none">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="mt-auto pt-[16px] border-t border-border-base relative flex flex-col justify-end">
          
          {/* Profile Popover */}
          {profileOpen && (
            <div className="absolute bottom-full mb-4 left-0 w-[170px] xl:w-full bg-surface-2 border border-border-strong rounded-[16px] shadow-lg p-2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
               <button onClick={() => { setProfileOpen(false); navigate('settings'); }} className="w-full text-left px-4 py-2.5 hover:bg-surface-3 rounded-[8px] text-[14px] font-bold transition-colors">Settings</button>
               <button onClick={() => { setProfileOpen(false); addToast('Profile edit coming soon!', 'info'); }} className="w-full text-left px-4 py-2.5 hover:bg-surface-3 rounded-[8px] text-[14px] font-bold transition-colors">Edit Profile</button>
               <div className="h-px bg-border-base my-1"></div>
               <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 hover:bg-error/10 text-error rounded-[8px] text-[14px] font-bold transition-colors">Log Out</button>
            </div>
          )}

          <div 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center justify-center xl:justify-start gap-3 px-1 py-1 cursor-pointer group rounded-[12px] hover:bg-surface-2 transition-colors xl:-mx-2 xl:pl-2"
          >
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-[#7C6FF7] to-[#1E1133] border border-border-strong flex items-center justify-center font-bold text-[15px] shadow-[0_0_12px_rgba(124,111,247,0.3)] shrink-0 overflow-hidden">
              {state.user.avatar && (state.user.avatar.startsWith('data:') || state.user.avatar.includes('/') || state.user.avatar.includes('.')) ? (
                <img src={state.user.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" />
              ) : (
                state.user.avatar
              )}
            </div>
            <div className="hidden xl:flex flex-col items-start overflow-hidden w-full group relative">
              <div className="flex items-center justify-between gap-1.5 w-full pr-2">
                <span className="font-bold text-[15px] truncate max-w-[100px]">{state.user.name}</span>
                <ThemeStatusPill />
              </div>
              <div className="flex items-center gap-2 mt-0.5" title={`${state.user.xp} / ${state.user.xpToNextLevel} XP to Level ${state.user.level + 1}`}>
                 <span className="text-[11px] font-bold bg-surface px-2 py-0.5 rounded-[4px] text-primary uppercase tracking-wider border border-primary/20">LV {state.user.level}</span>
                 <div className="w-[60px] h-[4px] bg-surface-2 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(state.user.xp / state.user.xpToNextLevel) * 100}%` }}></div>
                 </div>
              </div>
            </div>
            <div className="hidden xl:flex shrink-0 p-1 mr-1 text-text-muted group-hover:text-text-primary transition-colors">
              <ChevronDown size={16} className={`transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 md:pb-0 relative bg-bg-base">
        {/* Adjusted padding to be ultra-responsive on mobile devices */}
        <div className="w-full max-w-[1200px] mx-auto p-4 sm:p-6 md:p-10 xl:p-[40px] transition-opacity duration-200">
          {children}
        </div>
      </main>

      <ChatBotWidget />

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-border-base h-[84px] px-2 pb-safe grid grid-cols-5 items-center justify-items-center z-40">
        {[
          { id: 'dashboard', label: 'Home', icon: Home },
          { id: 'quests', label: 'Quest Log', icon: Sword },
          { id: 'stats', label: 'Analytics', icon: BarChart3 },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
        ].map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1 w-full h-[56px] rounded-[16px] transition-colors ${
                isActive ? 'text-primary bg-primary/10' : 'text-text-muted'
              }`}
            >
              <Icon size={20} className={isActive ? 'opacity-100 scale-110 transition-transform' : 'opacity-60'} />
              <span className="text-[10px] font-bold truncate max-w-full px-1">{item.label}</span>
            </button>
          );
        })}
        <button
           onClick={() => navigate('settings')}
           className={`flex flex-col items-center justify-center gap-1 w-full h-[56px] rounded-[16px] transition-colors ${
             activeTab === 'settings' ? 'text-primary bg-primary/10' : 'text-text-muted'
           }`}
        >
           <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-[#7C6FF7] to-[#1E1133] border border-border-strong flex items-center justify-center font-bold text-[11px] shadow-sm text-[#F0F0F0] overflow-hidden">
             {state.user.avatar && (state.user.avatar.startsWith('data:') || state.user.avatar.includes('/') || state.user.avatar.includes('.')) ? (
               <img src={state.user.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" />
             ) : (
               state.user.avatar
             )}
           </div>
           <span className="text-[10px] font-bold truncate px-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}
