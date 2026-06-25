import React from 'react';

interface AvatarWithCosmeticProps {
  avatarUrl: string;
  cosmeticId?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function AvatarWithCosmetic({ avatarUrl, cosmeticId, size = 'md', className = '' }: AvatarWithCosmeticProps) {
  const sizeClasses = {
    sm: 'w-[22px] h-[22px] text-[11px]',
    md: 'w-10 h-10 text-[15px]',
    lg: 'w-16 h-16 text-[24px]',
    xl: 'w-24 h-24 text-[32px]'
  };

  const getContainerStyles = () => {
    if (cosmeticId === 'cosmetic-ring') {
      return 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-[2px] shadow-[0_0_15px_rgba(255,215,0,0.4)]';
    }
    return 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-surface3)] border border-border-strong';
  };

  const renderCosmeticAccessory = () => {
    if (!cosmeticId) return null;

    if (cosmeticId === 'cosmetic-headphones') {
      return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20" style={{ transform: 'scale(1.15)' }}>
          <div className="w-[110%] h-[40%] border-[3px] border-zinc-300 border-b-0 rounded-t-full absolute top-[15%]" />
          <div className="absolute left-[-10%] top-[40%] w-[30%] h-[40%] bg-[#F2055C] rounded-lg shadow-[0_0_10px_rgba(242,5,92,0.4)]" />
          <div className="absolute right-[-10%] top-[40%] w-[30%] h-[40%] bg-[#F2055C] rounded-lg shadow-[0_0_10px_rgba(242,5,92,0.4)]" />
        </div>
      );
    }
    
    if (cosmeticId === 'cosmetic-cat') {
      return (
        <div className="absolute top-[-25%] left-0 w-full h-full pointer-events-none z-20 flex justify-between px-[15%]">
          <div className="w-[30%] h-[35%] bg-[#8A2BE2] rotate-[-25deg] origin-bottom-right rounded-t-lg shadow-[0_0_10px_rgba(138,43,226,0.4)] flex items-center justify-center">
             <div className="w-[50%] h-[50%] bg-[#FFB6C1] rounded-t-sm" />
          </div>
          <div className="w-[30%] h-[35%] bg-[#8A2BE2] rotate-[25deg] origin-bottom-left rounded-t-lg shadow-[0_0_10px_rgba(138,43,226,0.4)] flex items-center justify-center">
             <div className="w-[50%] h-[50%] bg-[#FFB6C1] rounded-t-sm" />
          </div>
        </div>
      );
    }

    if (cosmeticId === 'cosmetic-bunny') {
      return (
        <div className="absolute top-[-50%] left-0 w-full h-full pointer-events-none z-20 flex justify-center gap-[10%]">
          <div className="w-[20%] h-[60%] bg-[#6FF7A0] rotate-[-10deg] origin-bottom rounded-t-full shadow-[0_0_10px_rgba(111,247,160,0.4)] flex justify-center pt-1">
             <div className="w-[50%] h-[70%] bg-white/50 rounded-t-full" />
          </div>
          <div className="w-[20%] h-[60%] bg-[#6FF7A0] rotate-[10deg] origin-bottom rounded-t-full shadow-[0_0_10px_rgba(111,247,160,0.4)] flex justify-center pt-1">
             <div className="w-[50%] h-[70%] bg-white/50 rounded-t-full" />
          </div>
        </div>
      );
    }

    if (cosmeticId === 'cosmetic-angry') {
      return (
        <div className="absolute top-[5%] right-[5%] w-[35%] h-[35%] pointer-events-none z-20 text-[#FF4500] rotate-[15deg]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(255,69,0,0.5)]">
            <line x1="4" y1="9" x2="20" y2="9" />
            <line x1="4" y1="15" x2="20" y2="15" />
            <line x1="10" y1="3" x2="8" y2="21" />
            <line x1="16" y1="3" x2="14" y2="21" />
          </svg>
        </div>
      );
    }

    return null;
  };

  const isImage = avatarUrl && (avatarUrl.startsWith('data:') || avatarUrl.includes('/') || avatarUrl.includes('.'));

  return (
    <div className={`relative ${sizeClasses[size]} shrink-0 ${className}`}>
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
