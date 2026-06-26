import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Trophy, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export default function WelcomeBonusModal() {
  const { state, updateUser } = useApp();
  const showModal = state.user?.onboarded && state.user?.hasClaimedStarterXP === false;

  if (!showModal) return null;

  const handleClaim = () => {
    updateUser({ 
      xp: (state.user.xp || 0) + 100, 
      hasClaimedStarterXP: true 
    });
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-[400px] bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-[32px] p-8 shadow-2xl text-center overflow-hidden"
      >
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] bg-gradient-to-b from-[#7C6FF7]/20 to-transparent opacity-50" />
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#7C6FF7] rounded-full blur-[80px] opacity-20" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ rotate: -15, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-[#7C6FF7] to-[#5C4FE3] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_8px_32px_rgba(124,111,247,0.4)]"
            >
              <Gift size={40} className="text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-2 tracking-tight"
            >
              Welcome to anchor
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-[#888888] font-medium mb-8 leading-relaxed"
            >
              Claim your free 100XP to get started!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <button
                onClick={handleClaim}
                className="w-full h-[56px] bg-[#7C6FF7] hover:bg-[#6A5DE3] text-black font-bold text-lg rounded-2xl transition-all shadow-[0_8px_24px_rgba(124,111,247,0.3)] active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles size={20} />
                Claim 100 XP
              </button>
              
              <div className="flex items-center justify-center gap-2 text-[#888888] text-sm font-medium">
                <Trophy size={14} className="text-[#F7D96F]" />
                Starting Bonus unlocked
              </div>
            </motion.div>
          </div>
      </motion.div>
    </div>
  );
}
