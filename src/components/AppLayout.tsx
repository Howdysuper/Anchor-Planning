import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { 
  LayoutDashboard, 
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
  ChevronDown
} from 'lucide-react';
import { logout } from '../lib/firebase';
import { ThemeStatusPill } from './settings/ThemeStatusPill';
import Modal from './ui/Modal';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home / Dashboard', icon: LayoutDashboard },
  { id: 'anchors', label: 'Anchor Points', icon: Anchor },
  { id: 'loadout', label: 'Loadout', icon: Backpack },
  { id: 'braindump', label: 'Brain Dump', icon: Brain },
  { id: 'quests', label: 'Quest Log', icon: Sword },
  { id: 'sleep', label: 'Sleep Intel', icon: Moon },
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
    <div className="flex h-screen w-full bg-[#0A0A0A] text-[#F0F0F0] overflow-hidden font-sans">
      {/* SIDEBAR (Desktop & Tablet) */}
      <aside className="hidden md:flex flex-col bg-[#141414] border-r border-[rgba(255,255,255,0.06)] shrink-0 transition-all duration-300 w-[72px] xl:w-[260px] pt-[28px] pb-6 px-3 xl:px-6">
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
                className={`flex items-center justify-center xl:justify-start min-h-[48px] w-full px-0 xl:px-3.5 rounded-[12px] transition-all border-l-[3px] md:border-l-0 xl:border-l-[3px] group ${
                  isActive 
                    ? 'bg-[rgba(124,111,247,0.15)] text-[#7C6FF7] border-[#7C6FF7] font-semibold' 
                    : 'bg-transparent text-[#888888] hover:bg-[#1E1E1E] hover:text-[#F0F0F0] border-transparent font-medium'
                }`}
              >
                <Icon size={20} className={`shrink-0 transition-transform ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
                <span className="ml-[14px] hidden xl:block text-[15px] whitespace-nowrap select-none">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="mt-auto pt-[16px] border-t border-[rgba(255,255,255,0.06)] relative flex flex-col justify-end">
          
          {/* Profile Popover */}
          {profileOpen && (
            <div className="absolute bottom-full mb-4 left-0 w-[170px] xl:w-full bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)] rounded-[16px] shadow-[0_16px_48px_rgba(0,0,0,0.6)] p-2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
               <button onClick={() => { setProfileOpen(false); navigate('settings'); }} className="w-full text-left px-4 py-2.5 hover:bg-[#2A2A2A] rounded-[8px] text-[14px] font-bold transition-colors">Settings</button>
               <button onClick={() => { setProfileOpen(false); addToast('Profile edit coming soon!', 'info'); }} className="w-full text-left px-4 py-2.5 hover:bg-[#2A2A2A] rounded-[8px] text-[14px] font-bold transition-colors">Edit Profile</button>
               <div className="h-px bg-[rgba(255,255,255,0.06)] my-1"></div>
               <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 hover:bg-[rgba(247,111,111,0.1)] text-[#F76F6F] rounded-[8px] text-[14px] font-bold transition-colors">Log Out</button>
            </div>
          )}

          <div 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center justify-center xl:justify-start gap-3 px-1 py-1 cursor-pointer group rounded-[12px] hover:bg-[#1A1A1A] transition-colors xl:-mx-2 xl:pl-2"
          >
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-[#7C6FF7] to-[#1E1133] border border-[rgba(255,255,255,0.1)] flex items-center justify-center font-bold text-[15px] shadow-[0_0_12px_rgba(124,111,247,0.3)] shrink-0">
              {state.user.avatar}
            </div>
            <div className="hidden xl:flex flex-col items-start overflow-hidden w-full group relative">
              <div className="flex items-center justify-between gap-1.5 w-full pr-2">
                <span className="font-bold text-[15px] truncate max-w-[100px]">{state.user.name}</span>
                <ThemeStatusPill />
              </div>
              <div className="flex items-center gap-2 mt-0.5" title={`${state.user.xp} / ${state.user.xpToNextLevel} XP to Level ${state.user.level + 1}`}>
                 <span className="text-[11px] font-bold bg-[#1A1A1A] px-2 py-0.5 rounded-[4px] text-[#7C6FF7] uppercase tracking-wider border border-[rgba(124,111,247,0.2)]">LV {state.user.level}</span>
                 <div className="w-[60px] h-[4px] bg-[#1E1E1E] rounded-full overflow-hidden">
                    <div className="h-full bg-[#7C6FF7]" style={{ width: `${(state.user.xp / state.user.xpToNextLevel) * 100}%` }}></div>
                 </div>
              </div>
            </div>
            <div className="hidden xl:flex shrink-0 p-1 mr-1 text-[#888888] group-hover:text-[#F0F0F0] transition-colors">
              <ChevronDown size={16} className={`transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative bg-[#0A0A0A]">
        {/* Adjusted padding from 24px/16px to 40px as per Problem 1 */}
        <div className="w-full max-w-[1200px] mx-auto p-6 md:p-10 xl:p-[40px] transition-opacity duration-200">
          {children}
        </div>
      </main>

      {/* FLOATING ACTION BUTTON */}
      <button 
        onClick={() => setShowCaptureModal(true)}
        title="Quick Capture (Cmd+K)"
        className="fixed bottom-24 md:bottom-8 right-6 md:right-8 w-14 h-14 bg-[#7C6FF7] text-[#0A0A0A] rounded-[16px] flex items-center justify-center shadow-[0_8px_32px_rgba(124,111,247,0.4)] hover:scale-105 active:scale-95 transition-transform z-50 border border-[rgba(255,255,255,0.2)]"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Capture Modal */}
      <Modal isOpen={showCaptureModal} onClose={() => setShowCaptureModal(false)}>
         <div className="flex flex-col gap-6">
            <h2 className="text-[20px] font-bold text-[#F0F0F0]">Quick Capture</h2>
            <textarea
              autoFocus
              value={captureText}
              onChange={e => setCaptureText(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-4 text-[#F0F0F0] outline-none min-h-[120px] resize-none focus:border-[#7C6FF7] focus:shadow-[0_0_12px_rgba(124,111,247,0.2)] transition-all text-[16px]"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCapture(); }
              }}
            />
            <button
               onClick={handleCapture}
               className="h-[52px] w-full bg-[#7C6FF7] hover:bg-[#6b5ee6] text-[#0A0A0A] rounded-[14px] font-bold text-[16px] transition-all"
            >
              Capture
            </button>
         </div>
      </Modal>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#141414] border-t border-[rgba(255,255,255,0.06)] h-[84px] px-4 pb-safe flex justify-between items-center z-40">
        {NAV_ITEMS.slice(0, 4).map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1 min-w-[64px] h-[56px] rounded-[16px] transition-colors ${
                isActive ? 'text-[#7C6FF7] bg-[rgba(124,111,247,0.1)]' : 'text-[#888888]'
              }`}
            >
              <Icon size={24} className={isActive ? 'opacity-100 scale-110 transition-transform' : 'opacity-60'} />
              <span className="text-[10px] font-bold">{item.label.split(' / ')[0]}</span>
            </button>
          );
        })}
        <button
           onClick={() => navigate('settings')}
           className={`flex flex-col items-center justify-center gap-1 min-w-[64px] h-[56px] rounded-[16px] transition-colors ${
             activeTab === 'settings' ? 'text-[#7C6FF7] bg-[rgba(124,111,247,0.1)]' : 'text-[#888888]'
           }`}
        >
           <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-[#7C6FF7] to-[#1E1133] border border-[rgba(255,255,255,0.1)] flex items-center justify-center font-bold text-[12px] shadow-sm text-[#F0F0F0]">
             {state.user.avatar}
           </div>
           <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>
    </div>
  );
}
