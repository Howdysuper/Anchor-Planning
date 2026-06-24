import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { Trophy, Copy, Shield, Compass, Flame, Award, Zap, Lock, CheckCircle, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Modal from './ui/Modal';

// Badge achievements criteria definition
const BADGES_CONFIG = [
  {
    id: "first_anchor",
    title: "First Landmark",
    desc: "Complete your first habits check-in on the timeline",
    requirement: "XP reach ≥ 50 XP",
    check: (user: any) => user.xp >= 50,
    icon: Compass,
    color: "#6FBBF7", // Accent Blue
    gradient: "from-[#00c6ff] to-[#0072ff]",
    shadowClass: "shadow-blue-500/30",
    xpReward: 15,
  },
  {
    id: "streak_3",
    title: "Streak Recruit",
    desc: "Maintain a 3-day consecutive circadian habits checked pattern",
    requirement: "Streak Days ≥ 3",
    check: (user: any) => user.streakDays >= 3,
    icon: Flame,
    color: "#F7A06F", // Secondary Orange
    gradient: "from-[#f12711] to-[#f5af19]",
    shadowClass: "shadow-orange-500/30",
    xpReward: 30,
  },
  {
    id: "streak_7",
    title: "Habit Sentinel",
    desc: "Achieve a 7-day consecution streak shield reward",
    requirement: "Streak Days ≥ 7",
    check: (user: any) => user.streakDays >= 7,
    icon: Trophy,
    color: "#F7D96F", // Accent Gold
    gradient: "from-[#f5378e] to-[#f76b1c]",
    shadowClass: "shadow-pink-500/30",
    xpReward: 50,
  },
  {
    id: "level_3",
    title: "Focus Adept",
    desc: "Refine your cognitive baseline level metrics",
    requirement: "Reach Level 3+",
    check: (user: any) => user.level >= 3,
    icon: Award,
    color: "#7C6FF7", // Primary Purple
    gradient: "from-[#7F00FF] to-[#E100FF]",
    shadowClass: "shadow-purple-500/30",
    xpReward: 100,
  },
  {
    id: "high_xp",
    title: "Enlightened One",
    desc: "Earn a high threshold of focus experience points",
    requirement: "Earn 250+ Lifetime XP",
    check: (user: any) => user.xp >= 250,
    icon: Zap,
    color: "#6FF7A0", // Accent Green
    gradient: "from-[#11998e] to-[#38ef7d]",
    shadowClass: "shadow-green-500/30",
    xpReward: 150,
  }
];

// Fake data pattern
const FAKE_USERS = [
  { rank: 1, name: "NightOwl99", streak: 12, xp: 1450, prog: 5 },
  { rank: 2, name: "FocusMaster", streak: 8, xp: 1200, prog: 4 },
  { rank: 3, name: "ZenMode", streak: 7, xp: 950, prog: 4 },
  { rank: 4, name: "Alex.Hacks", streak: 5, xp: 840, prog: 3, isMe: true }, // Should map dynamically
  { rank: 5, name: "EarlyRiser", streak: 14, xp: 820, prog: 5 },
  { rank: 6, name: "Productivity_Bot", streak: 3, xp: 600, prog: 2 },
  { rank: 7, name: "CoffeeFirst", streak: 1, xp: 450, prog: 1 },
];

export default function Leaderboard() {
  const { state } = useApp();
  const { addToast } = useToast();
  
  const [tab, setTab] = useState('Weekly');
  const [isJoined, setIsJoined] = useState(true);

  const handleCopyInvite = () => {
    navigator.clipboard.writeText("https://anchor.app/invite/alex.hacks");
    addToast('Invite link copied!', 'success');
  };

  const users = [...FAKE_USERS];
  // Dynamically set row 4 to current user stats if joined
  if (isJoined) {
    const me = users.find(u => u.isMe);
    if (me) {
      me.name = state.user.name;
      me.streak = state.user.streakDays;
      me.xp = state.user.xp;
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-text-primary tracking-tight leading-tight mb-2">Leaderboard</h1>
          <p className="text-[16px] text-text-muted font-medium">Anonymous ranks. Real progress.</p>
        </div>
      </header>

      {/* Visual Achievements Badges System */}
      <div className="w-full bg-surface rounded-[24px] p-6 border border-border-base shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[18px] font-bold text-text-primary flex items-center gap-2">
            <Sparkles size={18} className="text-[#F7D96F]" />
            Your Milestone Badges
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-text-muted">{BADGES_CONFIG.filter(b => b.check(state.user)).length} / {BADGES_CONFIG.length} Unlocked</span>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'My Anchor Badges',
                    text: `I've unlocked ${BADGES_CONFIG.filter(b => b.check(state.user)).length} achievement badges on Anchor app! Can you beat my ${state.user.streakDays} day streak?`,
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(`I've unlocked ${BADGES_CONFIG.filter(b => b.check(state.user)).length} achievement badges on Anchor app! Can you beat my ${state.user.streakDays} day streak?`);
                  addToast('Export text copied to clipboard!', 'success');
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors text-xs font-bold"
            >
              Share Status
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {BADGES_CONFIG.map((badge) => {
            const isUnlocked = badge.check(state.user);
            const Icon = badge.icon;
            return (
              <div 
                key={badge.id}
                className={`group relative flex flex-col items-center text-center p-5 rounded-[22px] border transition-all duration-300 ${
                  isUnlocked 
                    ? 'bg-surface border-border-base hover:border-primary/40 shadow-sm hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)] hover:-translate-y-1.5'
                    : 'bg-surface-2/30 border-border-base/50 opacity-50 grayscale'
                }`}
              >
                {/* Visual Badge Icon Area */}
                <div 
                  className={`w-16 h-16 rounded-[20px] flex items-center justify-center mb-4 relative overflow-hidden transition-all duration-300 ${
                    isUnlocked 
                      ? `bg-gradient-to-br ${badge.gradient} text-white shadow-lg ${badge.shadowClass} group-hover:scale-110` 
                      : 'bg-surface-2 border border-border-base'
                  }`}
                >
                  <Icon 
                    size={28} 
                    className={isUnlocked ? "text-white filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.2)] animate-pulse-slow" : "text-text-muted"} 
                  />
                  {/* Subtle shine effect line */}
                  {isUnlocked && <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-[shimmer_2s_infinite]" />}
                </div>
                
                <h4 className="text-[14px] font-bold text-text-primary mb-1">{badge.title}</h4>
                <p className="text-[11px] text-text-muted font-medium leading-normal mb-4 flex-1 flex items-center">{badge.desc}</p>
                
                <div className={`mt-auto shrink-0 text-[10px] font-bold px-3 py-1 rounded-full border transition-colors ${
                  isUnlocked 
                    ? 'bg-primary/5 text-primary border-primary/10' 
                    : 'bg-surface-3 text-text-muted border-border-base/40'
                }`}>
                  {isUnlocked ? "Unlocked!" : badge.requirement}
                </div>

                {!isUnlocked && (
                  <div className="absolute top-3 right-3 p-1.5 bg-surface-2 rounded-full border border-border-base">
                    <Lock size={10} className="text-text-muted" />
                  </div>
                )}
                {isUnlocked && (
                  <div className="absolute top-3 right-3 p-1.5 bg-surface-2 rounded-full border border-green-500/10 shadow-sm group-hover:scale-110 transition-transform">
                    <CheckCircle size={10} className="text-green-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6 overflow-x-auto no-scrollbar">
         <div className="flex p-1 bg-surface-2 rounded-xl border border-border-base shrink-0">
           {['Weekly', 'All Time', 'Friends', 'Social Challenges'].map(t => (
             <button
               key={t}
               onClick={() => setTab(t)}
               className={`px-4 sm:px-6 py-2 rounded-lg text-[14px] font-bold transition-all whitespace-nowrap relative ${tab === t ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
             >
               {t}
               {tab === t && <motion.div layoutId="lb-tab" className="absolute inset-0 bg-surface rounded-lg -z-10 shadow-sm border border-border-base" />}
             </button>
           ))}
         </div>

         <div className="flex items-center gap-3 bg-surface-2 py-2.5 px-4 rounded-xl border border-border-base">
           <Shield size={16} className="text-text-muted" />
           <span className="text-[13px] font-medium text-text-primary">Participate in Leaderboard</span>
           <button 
             onClick={() => setIsJoined(!isJoined)}
             className={`w-[44px] h-[24px] rounded-full p-1 transition-colors ml-2 ${isJoined ? 'bg-primary' : 'bg-surface-3 border border-border-base'}`}
           >
             <motion.div animate={{ x: isJoined ? 20 : 0 }} className="w-[16px] h-[16px] bg-white rounded-full" />
           </button>
         </div>
      </div>

      {/* Table */}
      {tab === 'Social Challenges' ? (
        <div className="bg-surface rounded-[24px] p-6 sm:p-8 border border-border-base shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="text-[20px] font-bold text-text-primary">Social Challenges</h3>
              <p className="text-[14px] text-text-muted mt-1 font-medium">Compete with friends in private groups on specific habit streaks.</p>
            </div>
            <button className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-[12px] transition-colors w-full sm:w-auto">
              + Create Group
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-surface-2 p-6 rounded-[16px] border border-border-base hover:border-primary/40 transition-colors">
              <div className="flex justify-between gap-4 mb-4">
                <div className="p-3 bg-primary/10 text-primary rounded-[12px]"><Flame size={20} /></div>
                <span className="text-xs font-bold text-text-muted bg-surface-3 px-2 py-1 rounded-full h-fit">3 Members</span>
              </div>
              <h4 className="text-[16px] font-bold text-text-primary mb-1">Morning Club 5AM</h4>
              <p className="text-[13px] text-text-muted mb-4 font-medium">First one to 30 days of 5AM wakeups wins.</p>
              <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-primary w-[40%]" />
              </div>
              <div className="flex justify-between text-[11px] font-bold text-text-muted">
                <span>You: 12 days</span>
                <span>Leader: 15 days</span>
              </div>
            </div>
            {/* Empty state for adding more */}
            <div className="bg-surface-2/40 p-6 rounded-[16px] border border-dashed border-border-base flex flex-col items-center justify-center text-center hover:bg-surface-2 transition-colors cursor-pointer group min-h-[180px]">
              <div className="p-3 rounded-full bg-surface-3 text-text-muted group-hover:text-text-primary transition-colors mb-3">
                <Sparkles size={20} />
              </div>
              <h4 className="text-[14px] font-bold text-text-muted group-hover:text-text-primary transition-colors">Start a new challenge</h4>
              <p className="text-[12px] text-text-muted mt-1 font-medium">Invite friends to join</p>
            </div>
          </div>
        </div>
      ) : tab === 'Friends' ? (
        <div className="bg-surface rounded-[24px] p-12 border border-border-base flex flex-col items-center justify-center text-center min-h-[400px]">
           <Trophy size={48} className="text-text-muted mb-6 opacity-30" />
           <h3 className="text-[20px] font-bold text-text-primary mb-2">Climb the ranks together</h3>
           <p className="text-[14px] text-text-muted font-medium tracking-wide max-w-[300px] leading-relaxed mb-8">
             Invite your friends to share a private leaderboard and build streaks as a squad.
           </p>
           <button 
             onClick={handleCopyInvite}
             className="h-[52px] px-8 bg-primary hover:bg-primary-hover text-white font-bold rounded-[14px] flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-sm"
           >
             <Copy size={18} />
             Copy Invite Link
           </button>
        </div>
      ) : (
        <div className="bg-surface rounded-[24px] p-4 sm:p-8 border border-border-base shadow-sm overflow-x-auto no-scrollbar">
           <table className="w-full min-w-[600px] text-left border-collapse">
             <thead>
               <tr className="border-b border-border-base">
                 <th className="pb-4 text-[12px] font-bold text-text-muted uppercase tracking-wider pl-4">Rank</th>
                 <th className="pb-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">Username</th>
                 <th className="pb-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">Streak</th>
                 <th className="pb-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">XP This Week</th>
                 <th className="pb-4 text-[12px] font-bold text-text-muted uppercase tracking-wider">Challenge</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-border-base">
               {users.map((u) => {
                 const blurRow = u.isMe && !isJoined;
                 return (
                   <tr key={u.rank} className={`group transition-colors ${u.isMe ? 'bg-primary/5' : 'hover:bg-surface-2'}`}>
                     <td className="py-5 pl-4 px-2 font-mono font-bold text-[15px] text-text-muted opacity-60">#{u.rank}</td>
                     <td className="py-5 px-2">
                       <span className={`font-bold text-[15px] ${u.isMe ? 'text-primary' : 'text-text-primary'} ${blurRow ? 'blur-sm select-none' : ''}`}>
                         {blurRow ? "Hidden User" : u.name}
                       </span>
                       {u.isMe && !isJoined && <span className="ml-3 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">HIDDEN</span>}
                       {u.isMe && isJoined && <span className="ml-3 text-[10px] font-bold text-primary bg-primary/15 px-2 py-1 rounded uppercase tracking-wider">You</span>}
                     </td>
                     <td className="py-5 px-2 font-bold tabular-nums">
                       <span className={`${blurRow ? 'blur-sm select-none' : 'text-secondary'}`}>{blurRow ? '0' : u.streak} <span className="text-[12px] text-text-muted">days</span></span>
                     </td>
                     <td className="py-5 px-2 font-bold tabular-nums">
                       <span className={`${blurRow ? 'blur-sm select-none' : 'text-text-primary'}`}>{blurRow ? '0' : u.xp}</span>
                     </td>
                     <td className="py-5 px-2">
                       <div className={`flex gap-1 ${blurRow ? 'opacity-20 blur-sm' : ''}`}>
                         {[1,2,3,4,5].map(d => (
                           <div key={d} className={`w-6 h-1.5 rounded-full ${d <= u.prog ? 'bg-primary' : 'bg-surface-3'}`} />
                         ))}
                       </div>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
        </div>
      )}
    </div>
  );
}
