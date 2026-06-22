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
          <h1 className="text-[32px] font-bold text-[#F0F0F0] tracking-tight leading-tight mb-2">Leaderboard</h1>
          <p className="text-[16px] text-[#888888] font-medium">Anonymous ranks. Real progress.</p>
        </div>
      </header>

      {/* Weekly Challenge Banner */}
      <div className="w-full bg-gradient-to-r from-[#1A1133] to-[#141414] rounded-[24px] p-8 border border-[rgba(124,111,247,0.2)] shadow-[0_8px_32px_rgba(124,111,247,0.15)] mb-8 relative overflow-hidden">
         <div className="absolute right-0 top-0 w-64 h-64 bg-[#7C6FF7] rounded-full blur-[100px] opacity-[0.1] pointer-events-none"></div>
         <span className="bg-[rgba(124,111,247,0.2)] text-[#7C6FF7] text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 inline-block">Weekly Challenge</span>
         <h2 className="text-[24px] font-bold text-[#F0F0F0] mb-6">Eat breakfast 5 days this week</h2>
         
         <div className="space-y-3">
           <div className="flex justify-between items-end">
             <span className="text-[13px] font-bold text-[#888888]">Your Progress</span>
             <span className="text-[14px] font-bold text-[#F0F0F0]">3 / 5 Days</span>
           </div>
           <div className="h-2 w-full bg-[#1E1E1E] rounded-full overflow-hidden">
             <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} className="h-full bg-[#7C6FF7]" />
           </div>
         </div>
      </div>

      {/* Visual Achievements Badges System */}
      <div className="w-full bg-[#141414] rounded-[24px] p-6 border border-[rgba(255,255,255,0.06)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[18px] font-bold text-[#F0F0F0] flex items-center gap-2">
            <Sparkles size={18} className="text-[#F7D96F]" />
            Your Milestone Badges
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-[#888888]">{BADGES_CONFIG.filter(b => b.check(state.user)).length} / {BADGES_CONFIG.length} Unlocked</span>
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
              className="px-3 py-1.5 rounded-lg bg-[rgba(124,111,247,0.1)] text-[#7C6FF7] border border-[rgba(124,111,247,0.2)] hover:bg-[rgba(124,111,247,0.2)] transition-colors text-xs font-bold"
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
                className={`relative flex flex-col items-center text-center p-5 rounded-[18px] border transition-all duration-300 ${
                  isUnlocked 
                    ? 'bg-gradient-to-br from-[#1E1E1E] to-[#141414] border-[rgba(255,255,255,0.1)] hover:border-[#7C6FF7]/50 shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:-translate-y-1'
                    : 'bg-[#0A0A0A] border-[rgba(255,255,255,0.03)] opacity-60 grayscale'
                }`}
              >
                {/* Visual Badge Icon Area */}
                <div 
                  className="w-16 h-16 rounded-[16px] flex items-center justify-center mb-3 shadow-inner relative overflow-hidden"
                  style={{ 
                    backgroundColor: isUnlocked ? `${badge.color}20` : '#141414',
                    border: `1px solid ${isUnlocked ? `${badge.color}40` : 'rgba(255,255,255,0.05)'}`
                  }}
                >
                  <Icon 
                    size={28} 
                    className={isUnlocked ? "drop-shadow-[0_0_12px_currentColor]" : "text-[#555]"} 
                    color={isUnlocked ? badge.color : undefined} 
                  />
                  {/* Subtle shine effect line */}
                  {isUnlocked && <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent -skew-x-12 animate-[shimmer_2s_infinite]" />}
                </div>
                
                <h4 className="text-[13px] font-bold text-[#F0F0F0] mb-1">{badge.title}</h4>
                <p className="text-[10px] text-[#888888] font-medium leading-tight mb-3 flex-1 flex items-center">{badge.desc}</p>
                
                <div className={`mt-auto shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  isUnlocked ? 'bg-[#7C6FF7]/10 text-[#7C6FF7]' : 'bg-[#1A1A1A] text-[#555]'
                }`}>
                  {isUnlocked ? "Unlocked!" : badge.requirement}
                </div>

                {!isUnlocked && (
                  <div className="absolute top-2 right-2 p-1.5 bg-[#141414] rounded-full border border-[rgba(255,255,255,0.05)]">
                    <Lock size={10} className="text-[#555]" />
                  </div>
                )}
                {isUnlocked && (
                  <div className="absolute top-2 right-2 p-1.5 bg-[#141414] rounded-full border border-[rgba(111,247,160,0.2)]">
                    <CheckCircle size={10} className="text-[#6FF7A0]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6 overflow-x-auto">
         <div className="flex p-1 bg-[#1A1A1A] rounded-xl border border-[rgba(255,255,255,0.06)] shrink-0">
           {['Weekly', 'All Time', 'Friends', 'Social Challenges'].map(t => (
             <button
               key={t}
               onClick={() => setTab(t)}
               className={`px-4 sm:px-6 py-2 rounded-lg text-[14px] font-bold transition-all whitespace-nowrap relative ${tab === t ? 'text-[#F0F0F0]' : 'text-[#888888] hover:text-[#bbb]'}`}
             >
               {t}
               {tab === t && <motion.div layoutId="lb-tab" className="absolute inset-0 bg-[#333] rounded-lg -z-10 shadow-sm border border-[rgba(255,255,255,0.08)]" />}
             </button>
           ))}
         </div>

         <div className="flex items-center gap-3 bg-[#1A1A1A] py-2.5 px-4 rounded-xl border border-[rgba(255,255,255,0.06)]">
           <Shield size={16} className="text-[#888888]" />
           <span className="text-[13px] font-medium text-[#F0F0F0]">Participate in Leaderboard</span>
           <button 
             onClick={() => setIsJoined(!isJoined)}
             className={`w-[44px] h-[24px] rounded-full p-1 transition-colors ml-2 ${isJoined ? 'bg-[#7C6FF7]' : 'bg-[#333]'}`}
           >
             <motion.div animate={{ x: isJoined ? 20 : 0 }} className="w-[16px] h-[16px] bg-white rounded-full" />
           </button>
         </div>
      </div>

      {/* Table */}
      {tab === 'Social Challenges' ? (
        <div className="bg-[#141414] rounded-[24px] p-6 sm:p-8 border border-[rgba(255,255,255,0.06)] shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="text-[20px] font-bold text-[#F0F0F0]">Social Challenges</h3>
              <p className="text-[14px] text-[#888888] mt-1">Compete with friends in private groups on specific habit streaks.</p>
            </div>
            <button className="px-5 py-2.5 bg-[#7C6FF7] hover:bg-[#685EE0] text-white text-sm font-bold rounded-[12px] transition-colors w-full sm:w-auto">
              + Create Group
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#1A1A1A] p-6 rounded-[16px] border border-[rgba(255,255,255,0.05)] hover:border-[#7C6FF7]/30 transition-colors">
              <div className="flex justify-between gap-4 mb-4">
                <div className="p-3 bg-[#7C6FF7]/10 text-[#7C6FF7] rounded-[12px]"><Flame size={20} /></div>
                <span className="text-xs font-bold text-[#888888] bg-[#222] px-2 py-1 rounded-full h-fit">3 Members</span>
              </div>
              <h4 className="text-[16px] font-bold text-[#F0F0F0] mb-1">Morning Club 5AM</h4>
              <p className="text-[13px] text-[#888888] mb-4">First one to 30 days of 5AM wakeups wins.</p>
              <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden mb-2">
                <div className="h-full bg-[#F7A06F] w-[40%]" />
              </div>
              <div className="flex justify-between text-[11px] font-bold text-[#888888]">
                <span>You: 12 days</span>
                <span>Leader: 15 days</span>
              </div>
            </div>
            {/* Empty state for adding more */}
            <div className="bg-[rgba(255,255,255,0.02)] p-6 rounded-[16px] border border-dashed border-[rgba(255,255,255,0.1)] flex flex-col items-center justify-center text-center hover:bg-[rgba(255,255,255,0.04)] transition-colors cursor-pointer group min-h-[180px]">
              <div className="p-3 rounded-full bg-[rgba(255,255,255,0.05)] text-[#555] group-hover:text-[#F0F0F0] transition-colors mb-3">
                <Sparkles size={20} />
              </div>
              <h4 className="text-[14px] font-bold text-[#888888] group-hover:text-[#F0F0F0] transition-colors">Start a new challenge</h4>
              <p className="text-[12px] text-[#555] mt-1">Invite friends to join</p>
            </div>
          </div>
        </div>
      ) : tab === 'Friends' ? (
        <div className="bg-[#141414] rounded-[24px] p-12 border border-[rgba(255,255,255,0.06)] flex flex-col items-center justify-center text-center min-h-[400px]">
           <Trophy size={48} className="text-[#E5E5E5] mb-6 opacity-20" />
           <h3 className="text-[20px] font-bold text-[#F0F0F0] mb-2">Climb the ranks together</h3>
           <p className="text-[14px] text-[#888888] font-medium tracking-wide max-w-[300px] leading-relaxed mb-8">
             Invite your friends to share a private leaderboard and build streaks as a squad.
           </p>
           <button 
             onClick={handleCopyInvite}
             className="h-[52px] px-8 bg-[#E5E5E5] text-[#0A0A0A] font-bold rounded-[14px] flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
           >
             <Copy size={18} />
             Copy Invite Link
           </button>
        </div>
      ) : (
        <div className="bg-[#141414] rounded-[24px] p-4 sm:p-8 border border-[rgba(255,255,255,0.06)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] overflow-x-auto">
           <table className="w-full min-w-[600px] text-left border-collapse">
             <thead>
               <tr className="border-b border-[rgba(255,255,255,0.06)]">
                 <th className="pb-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider pl-4">Rank</th>
                 <th className="pb-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Username</th>
                 <th className="pb-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Streak</th>
                 <th className="pb-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">XP This Week</th>
                 <th className="pb-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Challenge</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
               {users.map((u) => {
                 const blurRow = u.isMe && !isJoined;
                 return (
                   <tr key={u.rank} className={`group transition-colors ${u.isMe ? 'bg-[rgba(124,111,247,0.05)]' : 'hover:bg-[#1A1A1A]'}`}>
                     <td className="py-5 pl-4 px-2 font-mono font-bold text-[15px] opacity-60">#{u.rank}</td>
                     <td className="py-5 px-2">
                       <span className={`font-bold text-[15px] ${u.isMe ? 'text-[#7C6FF7]' : 'text-[#F0F0F0]'} ${blurRow ? 'blur-sm select-none' : ''}`}>
                         {blurRow ? "Hidden User" : u.name}
                       </span>
                       {u.isMe && !isJoined && <span className="ml-3 text-[10px] font-bold text-[#F76F6F] bg-[rgba(247,111,111,0.1)] px-2 py-1 rounded">HIDDEN</span>}
                       {u.isMe && isJoined && <span className="ml-3 text-[10px] font-bold text-[#7C6FF7] bg-[rgba(124,111,247,0.15)] px-2 py-1 rounded uppercase tracking-wider">You</span>}
                     </td>
                     <td className="py-5 px-2 font-bold tabular-nums">
                       <span className={`${blurRow ? 'blur-sm select-none' : 'text-[#F7A06F]'}`}>{blurRow ? '0' : u.streak} <span className="text-[12px] text-[#888888]">days</span></span>
                     </td>
                     <td className="py-5 px-2 font-bold tabular-nums">
                       <span className={`${blurRow ? 'blur-sm select-none' : 'text-[#F0F0F0]'}`}>{blurRow ? '0' : u.xp}</span>
                     </td>
                     <td className="py-5 px-2">
                       <div className={`flex gap-1 ${blurRow ? 'opacity-20 blur-sm' : ''}`}>
                         {[1,2,3,4,5].map(d => (
                           <div key={d} className={`w-6 h-1.5 rounded-full ${d <= u.prog ? 'bg-[#7C6FF7]' : 'bg-[#1E1E1E]'}`} />
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
