import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Zap, ArrowRight, Star, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LevelUpCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  multiplier: number;
}

export default function LevelUpCelebration({ isOpen, onClose, level, multiplier }: LevelUpCelebrationProps) {
  useEffect(() => {
    if (isOpen) {
      // Direct center burst of confetti
      confetti({
        particleCount: 140,
        spread: 85,
        origin: { y: 0.5 },
        colors: ['#7c6df7', '#f59e0b', '#ec4899', '#3b82f6', '#10b981']
      });

      // Side cannons for continuous celebration
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#7c6df7', '#f59e0b']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#7c6df7', '#f59e0b']
        });

        if (Date.now() < end && isOpen) {
          requestAnimationFrame(frame);
        }
      };

      const timer = setTimeout(() => {
        requestAnimationFrame(frame);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const oldMultiplier = multiplier - 0.05;

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="level-up-modal-overlay" className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* High blurring glassy backing */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[12px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog Body */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[24px] border border-white/15 bg-gradient-to-b from-white/10 to-white/2 p-8 shadow-[0_24px_60px_rgba(124,111,247,0.3)] backdrop-blur-[32px] text-center"
          >
            {/* Spinning Light Rays background */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center overflow-hidden pointer-events-none">
              {/* Outer Ray Layer */}
              <motion.div
                className="absolute w-[600px] h-[600px] rounded-full opacity-40 mix-blend-screen filter blur-md"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, rgba(245,158,11,0.5) 20deg, transparent 50deg, rgba(124,111,247,0.5) 100deg, transparent 130deg, rgba(245,158,11,0.5) 180deg, transparent 210deg, rgba(124,111,247,0.5) 260deg, transparent 290deg, rgba(245,158,11,0.5) 340deg, transparent 360deg)'
                }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
              />
              {/* Inner Reverse Ray Layer */}
              <motion.div
                className="absolute w-[450px] h-[450px] rounded-full opacity-30 mix-blend-screen filter blur-lg"
                style={{
                  background: 'conic-gradient(from 180deg, transparent, rgba(124,111,247,0.4) 30deg, transparent 70deg, rgba(245,158,11,0.4) 120deg, transparent 160deg, rgba(124,111,247,0.4) 210deg, transparent 250deg, rgba(245,158,11,0.4) 300deg, transparent 330deg, rgba(124,111,247,0.4) 360deg)'
                }}
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
              />
              {/* Central Golden/Purple Glow */}
              <div className="absolute w-[200px] h-[200px] bg-gradient-to-r from-primary/30 to-amber-500/30 rounded-full filter blur-[40px] animate-pulse" />
            </div>

            {/* Glowing Corner Accents */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-primary/20 rounded-full filter blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-amber-500/20 rounded-full filter blur-3xl pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center">
              
              {/* Level Badge Card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-[20px] border border-amber-400/40 bg-gradient-to-br from-amber-400/30 to-amber-600/10 shadow-[0_8px_32px_rgba(245,158,11,0.3)]"
              >
                <Trophy size={48} className="text-amber-400 animate-pulse" />
                <motion.div 
                  className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-md"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Star size={12} className="text-white fill-white" />
                </motion.div>
                <div className="absolute bottom-1 right-2 font-mono text-[10px] font-bold text-amber-300">
                  MAX 50
                </div>
              </motion.div>

              {/* Title Header */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex items-center gap-1.5 justify-center text-amber-400 font-bold tracking-wider text-xs uppercase mb-2">
                  <Sparkles size={14} className="animate-bounce" />
                  <span>Level Up Achieved!</span>
                  <Sparkles size={14} className="animate-bounce" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white mb-3">
                  Level {level} Reached
                </h2>
                <p className="text-[15px] text-white/80 leading-relaxed max-w-sm mx-auto mb-6">
                  Congratulations! You have leveled up to <span className="font-bold text-amber-300">Level {level}</span>. Keep up the hard work, your focus is paying off!
                </p>
              </motion.div>

              {/* Multiplier Upgrade Display Card */}
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-sm rounded-[16px] border border-white/10 bg-white/5 p-4 mb-8 backdrop-blur-[8px]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/55 font-bold uppercase tracking-wider">XP Multiplier Upgrade</span>
                  <span className="flex items-center gap-1 text-[11px] font-bold bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">
                    <Zap size={10} className="fill-green-400" />
                    +0.05x Boost
                  </span>
                </div>
                
                <div className="flex items-center justify-center gap-6 mt-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white/60">{oldMultiplier.toFixed(2)}x</div>
                    <div className="text-[10px] text-white/40 uppercase mt-0.5">Previous</div>
                  </div>
                  <div className="text-white/30">
                    <ArrowRight size={20} />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-extrabold text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                      {multiplier.toFixed(2)}x
                    </div>
                    <div className="text-[10px] text-amber-300/80 uppercase mt-0.5 font-bold">New Base Multiplier</div>
                  </div>
                </div>
                <p className="text-[11px] text-white/60 mt-3 text-center">
                  All routine habits, quests, and bedtime checklists now earn <span className="text-amber-300 font-semibold">{multiplier.toFixed(2)}x XP</span>!
                </p>
              </motion.div>

              {/* Action Button */}
              <motion.button
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.45 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="h-[46px] w-full max-w-xs cursor-pointer rounded-[12px] bg-gradient-to-r from-primary to-amber-500 font-bold text-white text-[14px] shadow-[0_4px_20px_rgba(124,111,247,0.3)] transition-all hover:brightness-110 active:brightness-95 flex items-center justify-center gap-2 border border-white/20"
              >
                <span>Let's Keep Going!</span>
                <Flame size={16} className="fill-white" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
