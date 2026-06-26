import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import LevelUpCelebration from './LevelUpCelebration';
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
  X,
  ShoppingCart,
  Vault
} from 'lucide-react';
import { logout } from '../lib/firebase';
import { ThemeStatusPill } from './settings/ThemeStatusPill';
import Modal from './ui/Modal';
import { ChatBotWidget } from './ChatBotModal';
import { AnimatePresence, motion } from 'motion/react';
import AvatarWithCosmetic from './ui/AvatarWithCosmetic';
import { EditProfileModal } from './EditProfileModal';

const VaultIcon = (props: any) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="0.9" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    {/* Safe body - Compact square frame shifted up slightly to give more room for text below */}
    <rect x="5.5" y="4.5" width="13" height="13" rx="2" />
    {/* Combination dial - Thinner details */}
    <circle cx="12" cy="11" r="2.5" strokeWidth="0.7" />
    <path d="M12 10v-0.5" strokeWidth="0.7" />
    <path d="M12 12v0.5" strokeWidth="0.7" />
    <path d="M11 11h-0.5" strokeWidth="0.7" />
    <path d="M13 11h0.5" strokeWidth="0.7" />
    {/* Handle on the right */}
    <path d="M16 9.5v3" />
  </svg>
);

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'loadout', label: 'Loadout', icon: Backpack },
  { id: 'tasks', label: 'Tasks', icon: Inbox },
  { id: 'shop', label: 'Vault', icon: VaultIcon },
  { id: 'stats', label: 'Analytics', icon: BarChart3 },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { state, navigate, setBrainDumps } = useApp();
  const { addToast } = useToast();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [captureText, setCaptureText] = useState('');

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<{ level: number; multiplier: number } | null>(null);

  React.useEffect(() => {
    const handleLevelUp = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setLevelUpInfo({
          level: customEvent.detail.level,
          multiplier: customEvent.detail.multiplier
        });
        setShowLevelUp(true);
      }
    };
    window.addEventListener('anchor-level-up', handleLevelUp);
    return () => window.removeEventListener('anchor-level-up', handleLevelUp);
  }, []);

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
                className={`flex flex-col xl:flex-row items-center justify-center xl:justify-start ${item.id === 'shop' ? 'pt-0 pb-1.5' : 'py-2'} xl:py-2 min-h-[50px] xl:min-h-[44px] w-full px-0 xl:px-3.5 rounded-[12px] transition-all border-l-[3px] md:border-l-0 xl:border-l-[3px] group ${item.id === 'shop' ? 'gap-0' : 'gap-0.5'} xl:gap-0 ${
                  isActive 
                    ? 'bg-primary-tint/15 text-primary border-primary font-semibold' 
                    : 'bg-transparent text-text-muted hover:bg-surface-2 hover:text-text-primary border-transparent font-medium'
                }`}
              >
                <Icon size={20} className={`shrink-0 transition-transform ${isActive ? 'scale-105' : 'group-hover:scale-105'} ${item.id === 'shop' ? 'translate-y-0.5' : ''}`} />
                <span className={`xl:ml-[14px] text-[9px] xl:text-[15px] whitespace-nowrap select-none ${item.id === 'shop' ? '-translate-y-2.5 xl:translate-y-0' : ''}`}>{item.label}</span>
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
               <button onClick={() => { setProfileOpen(false); setIsEditProfileOpen(true); }} className="w-full text-left px-4 py-2.5 hover:bg-surface-3 rounded-[8px] text-[14px] font-bold transition-colors">Edit Profile</button>
               <button onClick={() => { setProfileOpen(false); navigate('settings-about'); }} className="w-full text-left px-4 py-2.5 hover:bg-surface-3 rounded-[8px] text-[14px] font-bold transition-colors">About & Help</button>
               <div className="h-px bg-border-base my-1"></div>
               <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 hover:bg-error/10 text-error rounded-[8px] text-[14px] font-bold transition-colors">Log Out</button>
            </div>
          )}

          <div 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center justify-center xl:justify-start gap-3 px-1 py-1 cursor-pointer group rounded-[12px] hover:bg-surface-2 transition-colors xl:-mx-2 xl:pl-2"
          >
            <AvatarWithCosmetic avatarUrl={state.user.avatar} cosmeticId={state.user.activeCosmetic} size="md" />
            <div className="hidden xl:flex flex-col items-start overflow-hidden w-full group relative">
              <div className="flex items-center justify-between gap-1.5 w-full pr-2">
                <span className="font-bold text-[15px] truncate max-w-[100px]">{state.user.name}</span>
                <ThemeStatusPill />
              </div>
              {(() => {
                const currentProgressXp = state.user.levelProgressXp !== undefined ? state.user.levelProgressXp : state.user.xp;
                const multiplier = 1.0 + (state.user.level - 1) * 0.05;
                return (
                  <div className="flex items-center gap-2 mt-0.5" title={`${currentProgressXp} / ${state.user.xpToNextLevel} XP to Level ${state.user.level + 1} • ${multiplier.toFixed(2)}x Multiplier`}>
                     <span className="text-[11px] font-bold bg-surface px-2 py-0.5 rounded-[4px] text-primary uppercase tracking-wider border border-primary/20">LV {state.user.level}</span>
                     <div className="w-[60px] h-[4px] bg-surface-2 rounded-full overflow-hidden flex-1 max-w-[80px]">
                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${Math.min(100, (currentProgressXp / (state.user.xpToNextLevel || 100)) * 100)}%` }}></div>
                     </div>
                     <span className="text-[10px] font-bold bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-500 border border-amber-500/20 whitespace-nowrap">{multiplier.toFixed(2)}x</span>
                  </div>
                );
              })()}
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

      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-border-base h-[84px] px-2 pb-safe grid grid-cols-5 items-center justify-items-center z-40">
        {[
          { id: 'dashboard', label: 'Home', icon: Home },
          { id: 'tasks', label: 'Tasks', icon: Sword },
          { id: 'shop', label: 'Vault', icon: VaultIcon },
          { id: 'stats', label: 'Analytics', icon: BarChart3 },
        ].map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center justify-center ${item.id === 'shop' ? 'gap-0' : 'gap-1'} w-full h-[56px] rounded-[16px] transition-colors ${
                isActive ? 'text-primary bg-primary/10' : 'text-text-muted'
              }`}
            >
              <Icon size={20} className={`${isActive ? 'opacity-100 scale-110 transition-transform' : 'opacity-60'} ${item.id === 'shop' ? 'translate-y-1' : ''}`} />
              <span className={`text-[10px] font-bold truncate max-w-full px-1 ${item.id === 'shop' ? '-translate-y-0.5' : ''}`}>{item.label}</span>
            </button>
          );
        })}
         <button
           onClick={() => navigate('settings')}
           className={`flex flex-col items-center justify-center gap-1 w-full h-[56px] rounded-[16px] transition-colors ${
             activeTab === 'settings' ? 'text-primary bg-primary/10' : 'text-text-muted'
           }`}
        >
           <AvatarWithCosmetic avatarUrl={state.user.avatar} cosmeticId={state.user.activeCosmetic} size="sm" />
           <span className="text-[10px] font-bold truncate px-1">Profile</span>
        </button>
      </nav>

      <LevelUpCelebration 
        isOpen={showLevelUp} 
        onClose={() => setShowLevelUp(false)} 
        level={levelUpInfo?.level || 1} 
        multiplier={levelUpInfo?.multiplier || 1.0} 
      />
    </div>
  );
}
