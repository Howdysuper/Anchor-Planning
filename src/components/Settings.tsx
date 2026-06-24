import React, { useState } from 'react';
import { 
  User, Bell, Anchor, Moon, Trophy, Palette, Shield, Focus, 
  Database, Plug, HelpCircle, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import sub sections
import {
  ProfileSettings,
  NotificationSettings,
  ScheduleSettings,
  SleepSettings,
  GamificationSettings,
  AppearanceSettings,
  PrivacySettings,
  FocusSettings,
  DataSettings,
  ConnectionsSettings,
  AboutSettings,
  DangerZoneSettings
} from './settings/Sections';

const CATEGORIES = [
  { id: 'profile', label: 'Profile & Account', icon: User, color: 'text-[#888888]' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-[#888888]' },
  { id: 'schedule', label: 'Anchor & Schedule', icon: Anchor, color: 'text-[#888888]' },
  { id: 'sleep', label: 'Sleep Intel', icon: Moon, color: 'text-[#888888]' },
  { id: 'gamification', label: 'Gamification & XP', icon: Trophy, color: 'text-[#888888]' },
  { id: 'appearance', label: 'Appearance', icon: Palette, color: 'text-[#888888]' },
  { id: 'privacy', label: 'Privacy & Leaderboard', icon: Shield, color: 'text-[#888888]' },
  { id: 'focus', label: 'Focus & Blocking', icon: Focus, color: 'text-[#888888]' },
  { id: 'data', label: 'Data & Storage', icon: Database, color: 'text-[#888888]' },
  { id: 'connections', label: 'Connections', icon: Plug, color: 'text-[#888888]' },
  { id: 'about', label: 'About & Help', icon: HelpCircle, color: 'text-[#888888]' },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, color: 'text-[#F76F6F]' },
];

export default function Settings() {
  const [activeCategory, setActiveCategory] = useState('profile');

  const renderActiveSection = () => {
    switch (activeCategory) {
      case 'profile': return <ProfileSettings />;
      case 'notifications': return <NotificationSettings />;
      case 'schedule': return <ScheduleSettings />;
      case 'sleep': return <SleepSettings />;
      case 'gamification': return <GamificationSettings />;
      case 'appearance': return <AppearanceSettings />;
      case 'privacy': return <PrivacySettings />;
      case 'focus': return <FocusSettings />;
      case 'data': return <DataSettings />;
      case 'connections': return <ConnectionsSettings />;
      case 'about': return <AboutSettings />;
      case 'danger': return <DangerZoneSettings />;
      default: return <ProfileSettings />;
    }
  };

  return (
    <div className="flex h-full w-full bg-surface rounded-[24px] overflow-hidden border border-border-base shadow-2xl min-h-[640px]">
      
      {/* LEFT COLUMN: SETTINGS CATEGORY SIDEBAR */}
      <aside className="hidden md:flex flex-col w-[240px] xl:w-[260px] bg-surface border-r border-border-base shrink-0 py-6 px-3">
        <h3 className="text-[18px] font-bold text-text-primary px-3 mb-6">Settings</h3>
        
        <nav className="flex flex-col gap-1 overflow-y-auto scrollbar-none select-none">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;
            
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-3 h-[42px] px-3.5 rounded-[12px] border-l-[3.5px] transition-all text-left truncate cursor-pointer ${
                  isActive
                    ? 'bg-primary/10 text-primary border-primary font-bold'
                    : `bg-transparent hover:bg-surface-2 ${cat.id === 'danger' ? 'text-[#F76F6F]/80 hover:text-[#F76F6F]' : 'text-text-muted hover:text-text-primary'} border-transparent font-semibold`
                }`}
              >
                <Icon size={16} className={`${isActive ? 'text-primary' : ''}`} />
                <span className="text-[13.5px] leading-none whitespace-nowrap">{cat.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* RIGHT PANEL: MAIN SETTINGS LAYOUT CONTAINER */}
      <main className="flex-1 overflow-y-auto bg-bg-base p-6 sm:p-10 md:px-12 select-text h-full">
        {/* Mobile luxury horizontal scrolling category ribbon */}
        <div className="flex md:hidden mb-6 overflow-x-auto scrollbar-none gap-2 pb-2 -mx-1 px-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 h-10 px-4 rounded-full border transition-all shrink-0 select-none cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white border-primary font-bold'
                    : `bg-surface border-border-base ${cat.id === 'danger' ? 'text-[#F76F6F]' : 'text-text-muted hover:text-text-primary'} font-semibold`
                }`}
              >
                <Icon size={14} />
                <span className="text-[13px] whitespace-nowrap">{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="max-w-[720px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="pb-16"
            >
              {renderActiveSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
