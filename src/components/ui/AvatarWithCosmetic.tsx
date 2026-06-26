import React from 'react';
import { motion } from 'motion/react';

interface AvatarWithCosmeticProps {
  avatarUrl: string;
  cosmeticId?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  forceAnimate?: boolean;
}

export default function AvatarWithCosmetic({ avatarUrl, cosmeticId, size = 'md', className = '', forceAnimate = false }: AvatarWithCosmeticProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isTriggered, setIsTriggered] = React.useState(true);

  React.useEffect(() => {
    setIsTriggered(true);
    const timer = setTimeout(() => {
      setIsTriggered(false);
    }, 2500); // Trigger animation for 2.5 seconds on mount/equip
    return () => clearTimeout(timer);
  }, [cosmeticId]);

  const isAnimateActive = isHovered || isTriggered || forceAnimate;

  const sizeClasses = {
    sm: 'w-[22px] h-[22px] text-[11px]',
    md: 'w-10 h-10 text-[15px]',
    lg: 'w-16 h-16 text-[24px]',
    xl: 'w-24 h-24 text-[32px]'
  };

  const getContainerStyles = () => {
    if (cosmeticId === 'cosmetic-ring') {
      return 'border border-[#FFA500]/40 relative z-10';
    }
    return 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-surface3)] border border-border-strong relative z-10';
  };

  const renderCosmeticAccessory = () => {
    if (!cosmeticId) return null;

    if (cosmeticId === 'cosmetic-headphones') {
      const headphonesAnimation = isAnimateActive
        ? {
            rotate: [0, -8, 8, -8, 8, -5, 5, 0],
            scale: [1.1, 1.22, 1.1, 1.22, 1.1],
            y: [0, -2, 2, -2, 0]
          }
        : { rotate: 0, scale: 1.1, y: 0 };

      const headphonesTransition = isAnimateActive
        ? { repeat: Infinity, duration: 0.8, ease: "easeInOut" }
        : { duration: 0.3 };

      return (
        <motion.div 
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-20" 
          animate={headphonesAnimation}
          transition={headphonesTransition}
          style={{ originY: 0.5 }}
        >
          {/* Headband */}
          <div className="w-[108%] h-[40%] border-[3.5px] border-zinc-400 border-b-0 rounded-t-full absolute top-[15%]" />
          {/* Ear cups */}
          <div className="absolute left-[-12%] top-[38%] w-[28%] h-[44%] bg-[#F2055C] rounded-xl shadow-[0_0_12px_rgba(242,5,92,0.5)] border border-white/20 flex items-center justify-center">
            <div className="w-[40%] h-[60%] bg-zinc-800/80 rounded-md" />
          </div>
          <div className="absolute right-[-12%] top-[38%] w-[28%] h-[44%] bg-[#F2055C] rounded-xl shadow-[0_0_12px_rgba(242,5,92,0.5)] border border-white/20 flex items-center justify-center">
            <div className="w-[40%] h-[60%] bg-zinc-800/80 rounded-md" />
          </div>
        </motion.div>
      );
    }
    
    if (cosmeticId === 'cosmetic-cat') {
      return (
        <div className="absolute top-[-26%] left-0 w-full h-full pointer-events-none z-20 flex justify-between px-[8%]">
          {/* Left Cat Ear */}
          <motion.div 
            className="w-[36%] h-[36%] bg-gradient-to-br from-[#8A2BE2] to-[#4B0082] rounded-tl-[100%] rounded-tr-[35%] rounded-br-[40%] rounded-bl-[40%] shadow-[0_4px_10px_rgba(138,43,226,0.5)] relative flex items-center justify-center border border-white/20"
            style={{ originY: "bottom", originX: "right" }}
            animate={isAnimateActive ? {
              rotate: [-25, -5, -40, -15, -25],
              scaleY: [1, 0.4, 1.2, 0.7, 1],
              x: [0, 2, -3, 1, 0],
            } : { rotate: -25, scaleY: 1, x: 0 }}
            transition={isAnimateActive ? { repeat: Infinity, duration: 1.2, ease: "easeInOut", repeatDelay: 0.15 } : { duration: 0.3 }}
          >
            {/* Inner pink ear with fluffy look */}
            <div className="absolute bottom-[10%] right-[10%] w-[60%] h-[60%] bg-gradient-to-tr from-[#FFB6C1] to-[#FF69B4] rounded-tl-[100%] rounded-br-[30%] rounded-bl-[30%] shadow-inner border-l border-b border-white/30" />
          </motion.div>

          {/* Right Cat Ear */}
          <motion.div 
            className="w-[36%] h-[36%] bg-gradient-to-bl from-[#8A2BE2] to-[#4B0082] rounded-tr-[100%] rounded-tl-[35%] rounded-bl-[40%] rounded-br-[40%] shadow-[0_4px_10px_rgba(138,43,226,0.5)] relative flex items-center justify-center border border-white/20"
            style={{ originY: "bottom", originX: "left" }}
            animate={isAnimateActive ? {
              rotate: [25, 5, 40, 15, 25],
              scaleY: [1, 0.4, 1.2, 0.7, 1],
              x: [0, -2, 3, -1, 0],
            } : { rotate: 25, scaleY: 1, x: 0 }}
            transition={isAnimateActive ? { repeat: Infinity, duration: 1.2, ease: "easeInOut", repeatDelay: 0.15 } : { duration: 0.3 }}
          >
            {/* Inner pink ear with fluffy look */}
            <div className="absolute bottom-[10%] left-[10%] w-[60%] h-[60%] bg-gradient-to-tl from-[#FFB6C1] to-[#FF69B4] rounded-tr-[100%] rounded-bl-[30%] rounded-br-[30%] shadow-inner border-r border-b border-white/30" />
          </motion.div>
        </div>
      );
    }

    if (cosmeticId === 'cosmetic-bunny') {
      return (
        <div className="absolute top-[-52%] left-0 w-full h-full pointer-events-none z-20 flex justify-center gap-[15%]">
          {/* Left Bunny Ear */}
          <motion.div 
            className="w-[24%] h-[60%] bg-gradient-to-b from-[#6FF7A0] to-[#00b894] rounded-t-full shadow-[0_4px_12px_rgba(111,247,160,0.5)] relative flex justify-center overflow-hidden border border-white/20"
            style={{ originY: "bottom" }}
            animate={isAnimateActive ? {
              rotate: [-12, 18, -32, -2, -12],
              scaleY: [1, 0.35, 1.25, 0.75, 1],
            } : { rotate: -12, scaleY: 1 }}
            transition={isAnimateActive ? { repeat: Infinity, duration: 1.4, ease: "easeInOut" } : { duration: 0.3 }}
          >
            {/* Inner Ear */}
            <div className="w-[45%] h-[75%] bg-gradient-to-b from-[#FFB6C1] to-[#FF8093] rounded-t-full mt-[18%] shadow-inner border-t border-white/20" />
          </motion.div>

          {/* Right Bunny Ear */}
          <motion.div 
            className="w-[24%] h-[60%] bg-gradient-to-b from-[#6FF7A0] to-[#00b894] rounded-t-full shadow-[0_4px_12px_rgba(111,247,160,0.5)] relative flex justify-center overflow-hidden border border-white/20"
            style={{ originY: "bottom" }}
            animate={isAnimateActive ? {
              rotate: [12, -18, 32, 2, 12],
              scaleY: [1, 0.35, 1.25, 0.75, 1],
            } : { rotate: 12, scaleY: 1 }}
            transition={isAnimateActive ? { repeat: Infinity, duration: 1.4, ease: "easeInOut" } : { duration: 0.3 }}
          >
            {/* Inner Ear */}
            <div className="w-[45%] h-[75%] bg-gradient-to-b from-[#FFB6C1] to-[#FF8093] rounded-t-full mt-[18%] shadow-inner border-t border-white/20" />
          </motion.div>
        </div>
      );
    }

    if (cosmeticId === 'cosmetic-angry') {
      const angryAnimation = isAnimateActive
        ? {
            scale: [1, 1.3, 0.9, 1.3, 1],
            x: [0, -4, 4, -4, 4, 0],
            y: [0, 2, -2, 2, -2, 0],
            rotate: [0, -8, 8, -8, 8, 0]
          }
        : { scale: 1, x: 0, y: 0, rotate: 0 };

      const angryTransition = isAnimateActive
        ? { repeat: Infinity, duration: 0.5, ease: "easeInOut" }
        : { duration: 0.3 };

      return (
        <>
          {/* Left crescent speed/tension line from image */}
          <motion.div 
            className="absolute inset-[-6px] rounded-full border-[3px] border-red-500 pointer-events-none z-0 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
            style={{
              clipPath: 'polygon(0% 0%, 40% 0%, 40% 100%, 0% 100%)',
            }}
            animate={isAnimateActive ? {
              scale: [1, 1.1, 0.96, 1.1, 1],
              opacity: [0.6, 1, 0.6],
            } : { scale: 1, opacity: 0.7 }}
            transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
          />

          {/* Right crescent speed/tension line from image */}
          <motion.div 
            className="absolute inset-[-10px] rounded-full border-[2px] border-red-600 pointer-events-none z-0 shadow-[0_0_6px_rgba(220,38,38,0.5)]"
            style={{
              clipPath: 'polygon(60% 0%, 100% 0%, 100% 100%, 60% 100%)',
            }}
            animate={isAnimateActive ? {
              scale: [1, 1.05, 0.95, 1.05, 1],
              opacity: [0.5, 0.9, 0.5],
            } : { scale: 1, opacity: 0.5 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.1 }}
          />

          {/* Red anime anger mark sitting at the top right as shown in attachment */}
          <motion.div 
            className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] pointer-events-none z-20"
            animate={angryAnimation}
            transition={angryTransition}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_8px_rgba(255,0,0,0.8)]">
              {/* Backing thick black outline for the four L curves */}
              <path d="M 42 18 Q 42 42 18 42" stroke="#000000" strokeWidth="20" strokeLinecap="round" fill="none" />
              <path d="M 58 18 Q 58 42 82 42" stroke="#000000" strokeWidth="20" strokeLinecap="round" fill="none" />
              <path d="M 42 82 Q 42 58 18 58" stroke="#000000" strokeWidth="20" strokeLinecap="round" fill="none" />
              <path d="M 58 82 Q 58 58 82 58" stroke="#000000" strokeWidth="20" strokeLinecap="round" fill="none" />

              {/* Foreground bright red curves */}
              <path d="M 42 18 Q 42 42 18 42" stroke="#FF0000" strokeWidth="12" strokeLinecap="round" fill="none" />
              <path d="M 58 18 Q 58 42 82 42" stroke="#FF0000" strokeWidth="12" strokeLinecap="round" fill="none" />
              <path d="M 42 82 Q 42 58 18 58" stroke="#FF0000" strokeWidth="12" strokeLinecap="round" fill="none" />
              <path d="M 58 82 Q 58 58 82 58" stroke="#FF0000" strokeWidth="12" strokeLinecap="round" fill="none" />

              {/* Highlighting inner bright layer */}
              <path d="M 42 18 Q 42 42 18 42" stroke="#FF7070" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 58 18 Q 58 42 82 42" stroke="#FF7070" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 42 82 Q 42 58 18 58" stroke="#FF7070" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 58 82 Q 58 58 82 58" stroke="#FF7070" strokeWidth="4" strokeLinecap="round" fill="none" />
            </svg>
          </motion.div>
        </>
      );
    }

    return null;
  };

  const isImage = avatarUrl && (avatarUrl.startsWith('data:') || avatarUrl.includes('/') || avatarUrl.includes('.'));

  return (
    <div 
      className={`relative ${sizeClasses[size]} shrink-0 ${className} select-none`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mystic Avatar Frame Glow Effects */}
      {cosmeticId === 'cosmetic-ring' && (
        <>
          {/* Thick spinning gold frame */}
          <motion.div
            className="absolute inset-[-8px] rounded-full pointer-events-none z-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-[4px] shadow-[0_0_15px_rgba(245,158,11,0.6)]"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          >
            {/* Inner dark circle to create a clean border ring */}
            <div className="w-full h-full rounded-full bg-bg-base" />
          </motion.div>
          {/* Extra outer shining glow */}
          <motion.div
            className="absolute inset-[-12px] rounded-full pointer-events-none z-0"
            style={{
              border: '2px solid rgba(245, 158, 11, 0.4)',
              boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)',
            }}
            animate={{
              scale: [0.96, 1.04, 0.96],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
        </>
      )}

      <div className={`w-full h-full rounded-full flex items-center justify-center font-bold overflow-visible text-[#F0F0F0] transition-all duration-300 ${getContainerStyles()}`}>
        <div className="w-full h-full rounded-full bg-bg-base flex items-center justify-center overflow-hidden z-10 relative">
          {isImage ? (
            <img src={avatarUrl} className="w-full h-full object-cover rounded-full" alt="avatar" />
          ) : (
            avatarUrl
          )}
        </div>
      </div>
      {renderCosmeticAccessory()}
    </div>
  );
}
