import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'motion/react';
import { Vault, Star, Sparkles, Paintbrush, Zap, Lock, Check, Compass, Flame, Trophy, Award, CheckCircle, Headphones, Cat, Rabbit, Hash } from 'lucide-react';
import Modal from './ui/Modal';
import AvatarWithCosmetic from './ui/AvatarWithCosmetic';

const VaultIcon = (props: any) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    {/* Outer frame - smaller */}
    <rect x="5" y="6" width="14" height="12" rx="1.5" />
    {/* Inner door - smaller */}
    <rect x="8" y="9" width="8" height="6" rx="0.5" />
    {/* Combination Dial - smaller */}
    <circle cx="12" cy="12" r="1.5" />
    <path d="M12 10.5v0.5" />
    <path d="M12 13v0.5" />
    <path d="M10.5 12h0.5" />
    <path d="M13 12h0.5" />
    {/* Hinges - smaller */}
    <path d="M5 9h1" />
    <path d="M5 15h1" />
  </svg>
);

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

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ElementType;
  color: string;
  type: 'theme' | 'feature' | 'cosmetic' | 'subscription';
  onPurchase: (updateSetting: any, updateUser: any, state: any) => void;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'theme-neon',
    name: 'Neon Grid Theme',
    description: 'A vibrant cyberpunk-inspired UI theme with intense accent colors.',
    price: 1500,
    icon: Paintbrush,
    color: '#F2055C',
    type: 'theme',
    onPurchase: (updateSetting) => {
      updateSetting('appearance.accentColor', '#F2055C');
      updateSetting('appearance.colorMode', 'neon');
    }
  },
  {
    id: 'theme-cosmic',
    name: 'Cosmic Slate',
    description: 'Deep space blues and purples for a majestic, calm aesthetic.',
    price: 1200,
    icon: Paintbrush,
    color: '#8A2BE2',
    type: 'theme',
    onPurchase: (updateSetting) => {
      updateSetting('appearance.accentColor', '#8A2BE2');
      updateSetting('appearance.colorMode', 'cosmic');
    }
  },
  {
    id: 'theme-hacker',
    name: 'Hacker Typography',
    description: 'A terminal-inspired green and black theme with a sleek monospace font.',
    price: 800,
    icon: Paintbrush,
    color: '#00ff00',
    type: 'theme',
    onPurchase: (updateSetting) => {
      updateSetting('appearance.colorMode', 'hacker');
      updateSetting('appearance.fontFamily', 'mono');
      updateSetting('appearance.accentColor', '#00ff00');
    }
  },
  {
    id: 'cosmetic-ring',
    name: 'Mystic Avatar Frame',
    description: 'Show off your dedication with a glowing gold avatar frame.',
    price: 2500,
    icon: Sparkles,
    color: '#FFD700',
    type: 'cosmetic',
    onPurchase: (_, updateUser) => {
      updateUser({ activeCosmetic: 'cosmetic-ring' });
    }
  },
  {
    id: 'cosmetic-headphones',
    name: 'Lo-Fi Headphones',
    description: 'A cozy set of headphones for your avatar.',
    price: 3000,
    icon: Headphones,
    color: '#F2055C',
    type: 'cosmetic',
    onPurchase: (_, updateUser) => {
      updateUser({ activeCosmetic: 'cosmetic-headphones' });
    }
  },
  {
    id: 'cosmetic-cat',
    name: 'Cute Cat Ears',
    description: 'Adorable cat ears to sit atop your avatar.',
    price: 4000,
    icon: Cat,
    color: '#8A2BE2',
    type: 'cosmetic',
    onPurchase: (_, updateUser) => {
      updateUser({ activeCosmetic: 'cosmetic-cat' });
    }
  },
  {
    id: 'cosmetic-bunny',
    name: 'Bunny Ears',
    description: 'Fluffy bunny ears for your profile picture.',
    price: 4000,
    icon: Rabbit,
    color: '#6FF7A0',
    type: 'cosmetic',
    onPurchase: (_, updateUser) => {
      updateUser({ activeCosmetic: 'cosmetic-bunny' });
    }
  },
  {
    id: 'cosmetic-angry',
    name: 'Angry Mark',
    description: 'An expressive popping vein mark for your avatar.',
    price: 2000,
    icon: Hash,
    color: '#FF4500',
    type: 'cosmetic',
    onPurchase: (_, updateUser) => {
      updateUser({ activeCosmetic: 'cosmetic-angry' });
    }
  },
  {
    id: 'theme-forest',
    name: 'Forest Canopy',
    description: 'A soothing green and earthy tone for deep focus.',
    price: 1000,
    icon: Paintbrush,
    color: '#2E8B57',
    type: 'theme',
    onPurchase: (updateSetting) => {
      updateSetting('appearance.accentColor', '#2E8B57');
      updateSetting('appearance.colorMode', 'forest');
    }
  }
];

const ThemePreview = ({ color }: { color: string }) => (
  <div className="w-24 h-16 rounded-xl bg-[#1A1A1A] flex flex-col p-2 border border-[#333] shadow-lg relative z-10 hover:scale-110 transition-transform">
    {/* Header */}
    <div className="flex items-center justify-between mb-1.5 gap-1">
      <div className="w-1/2 h-1.5 rounded-full bg-[#444]" />
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
    </div>
    {/* Content Box */}
    <div className="w-full h-4 rounded-md mb-1.5 opacity-80" style={{ backgroundColor: color }} />
    <div className="flex gap-1 mt-auto">
      <div className="w-1/3 h-2 rounded-sm bg-[#333]" />
      <div className="w-1/4 h-2 rounded-sm bg-[#333]" />
    </div>
  </div>
);

interface ShopItemCardProps {
  key?: string;
  item: ShopItem;
  isPurchased: boolean;
  isItemActive: (item: ShopItem) => boolean;
  currentXP: number;
  handleUnequip: (item: ShopItem) => void;
  handleEquip: (item: ShopItem) => void;
  setSelectedItem: React.Dispatch<React.SetStateAction<ShopItem | null>>;
  avatarUrl: string;
}

function ShopItemCard({
  item,
  isPurchased,
  isItemActive,
  currentXP,
  handleUnequip,
  handleEquip,
  setSelectedItem,
  avatarUrl
}: ShopItemCardProps) {
  const [isCardHovered, setIsCardHovered] = useState(false);
  const Icon = item.icon;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      className="bg-surface border border-border-base rounded-[24px] overflow-hidden flex flex-col shadow-sm relative group"
    >
      <div 
        className="h-36 w-full flex items-center justify-center relative overflow-hidden transition-colors"
        style={{ backgroundColor: `${item.color}15` }}
      >
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at center, ${item.color} 0%, transparent 70%)` }} />
        
        {item.type === 'theme' ? (
          <ThemePreview color={item.color} />
        ) : item.type === 'cosmetic' ? (
          <div className="relative z-10 transition-transform group-hover:scale-110 duration-300">
            <AvatarWithCosmetic avatarUrl={avatarUrl} cosmeticId={item.id} size="lg" forceAnimate={isCardHovered} />
          </div>
        ) : (
          <Icon size={48} color={item.color} className="relative z-10 transition-transform group-hover:scale-110 duration-300" />
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-[18px] font-bold text-text-primary">{item.name}</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-surface-2 text-text-muted border border-border-base">
            {item.type}
          </span>
        </div>
        <p className="text-[14px] text-text-muted mb-6 leading-relaxed flex-1">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          {!isPurchased && (
            <div className="flex items-center gap-1.5 text-[15px] font-bold text-primary">
              <Star size={16} className="fill-primary" />
              {item.price.toLocaleString()} XP
            </div>
          )}
          {isPurchased && (
            <div className="flex items-center gap-1.5 text-[14px] font-bold text-[#6FF7A0]">
              <Check size={16} />
              Owned
            </div>
          )}
          
          {isPurchased ? (
            isItemActive(item) ? (
              <button 
                onClick={() => handleUnequip(item)}
                className="px-5 py-2 bg-surface-2 hover:bg-surface-3 border border-border-base text-text-primary rounded-full text-[13px] font-bold transition-all"
              >
                Unequip
              </button>
            ) : (
              <button 
                onClick={() => handleEquip(item)}
                className="px-5 py-2 bg-primary text-bg-base hover:opacity-90 shadow-md border border-transparent rounded-full text-[13px] font-bold transition-all"
              >
                Equip
              </button>
            )
          ) : (
            <button 
              onClick={() => setSelectedItem(item)}
              disabled={currentXP < item.price}
              className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all flex items-center gap-2 ${
                currentXP >= item.price
                  ? 'bg-primary text-bg-base hover:opacity-90 shadow-md'
                  : 'bg-surface-2 text-text-muted cursor-not-allowed border border-border-base'
              }`}
            >
              {currentXP < item.price && <Lock size={14} />}
              Buy
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Shop() {
  const { state, updateUser } = useApp();
  const { settings, updateSetting } = useSettings();
  const { addToast } = useToast();
  
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [vaultTab, setVaultTab] = useState<'themes' | 'cosmetics'>('themes');

  const purchasedItems = state.user.purchasedItems || [];
  const currentXP = state.user.xp;

  const handlePurchase = () => {
    if (!selectedItem) return;

    if (currentXP < selectedItem.price) {
      addToast("Not enough XP! Complete more tasks.", "error");
      return;
    }

    if (purchasedItems.includes(selectedItem.id) && selectedItem.type !== 'subscription') {
      addToast("You already own this item!", "info");
      return;
    }

    // Deduct XP
    updateUser({ 
      xp: currentXP - selectedItem.price,
      purchasedItems: [...purchasedItems, selectedItem.id]
    });

    // Execute item effect
    selectedItem.onPurchase(updateSetting, updateUser, state);

    addToast(`Successfully purchased ${selectedItem.name}!`, "success");
    setSelectedItem(null);
  };

  const handleEquip = (item: ShopItem) => {
    if (item.type === 'theme' || item.type === 'cosmetic') {
      item.onPurchase(updateSetting, updateUser, state);
      addToast(`${item.name} equipped!`, "success");
    } else {
      addToast(`${item.name} is already active!`, "info");
    }
  };

  const handleUnequip = (item: ShopItem) => {
    if (item.id === 'theme-hacker') {
      updateSetting('appearance.fontFamily', 'inter');
      updateSetting('appearance.colorMode', 'dark');
      updateSetting('appearance.accentColor', '#7C6FF7');
      addToast(`${item.name} unequipped!`, "info");
    } else if (item.type === 'theme') {
      updateSetting('appearance.colorMode', 'dark');
      updateSetting('appearance.accentColor', '#7C6FF7');
      addToast(`${item.name} unequipped!`, "info");
    } else if (item.type === 'cosmetic') {
      updateUser({ activeCosmetic: null });
      addToast(`${item.name} unequipped!`, "info");
    }
  };

  const isItemActive = (item: ShopItem) => {
    if (item.id === 'theme-neon') return settings.appearance.colorMode === 'neon';
    if (item.id === 'theme-cosmic') return settings.appearance.colorMode === 'cosmic';
    if (item.id === 'theme-forest') return settings.appearance.colorMode === 'forest';
    if (item.id === 'theme-hacker') return settings.appearance.colorMode === 'hacker';
    if (item.type === 'cosmetic') return state.user.activeCosmetic === item.id;
    return false;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto h-full flex flex-col pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">
            The Vault
          </h2>
          <p className="text-[15px] text-text-muted mt-2 max-w-2xl">
            Trade your hard-earned XP for aesthetic upgrades, powerful UI themes, and exclusive perks to customize your experience.
          </p>
        </div>
        
        <div className="bg-surface-2 border border-border-base rounded-[16px] p-4 flex items-center gap-4 shrink-0 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Star className="text-primary fill-primary" size={24} />
          </div>
          <div>
            <p className="text-[12px] text-text-muted font-bold uppercase tracking-wider">Available XP</p>
            <p className="text-2xl font-bold text-text-primary">{currentXP.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Visual Achievements Badges System */}
      <div className="w-full bg-surface rounded-[24px] p-6 border border-border-base shadow-sm mb-10">
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

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[20px] font-bold text-text-primary">Vault Upgrades</h3>
        <div className="flex bg-surface-2 p-1 rounded-[12px] border border-border-base relative">
          <motion.div 
            className="absolute top-1 bottom-1 left-1 bg-surface shadow-sm border border-border-strong rounded-[10px]"
            initial={false}
            animate={{
              width: vaultTab === 'themes' ? 'calc(50% - 4px)' : 'calc(50% - 4px)',
              x: vaultTab === 'themes' ? 0 : '100%',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
          <button 
            onClick={() => setVaultTab('themes')}
            className={`relative z-10 px-4 py-1.5 text-[13px] font-bold rounded-[10px] transition-colors w-[100px] ${
              vaultTab === 'themes' ? 'text-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Themes
          </button>
          <button 
            onClick={() => setVaultTab('cosmetics')}
            className={`relative z-10 px-4 py-1.5 text-[13px] font-bold rounded-[10px] transition-colors w-[100px] ${
              vaultTab === 'cosmetics' ? 'text-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Cosmetics
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SHOP_ITEMS.filter(item => item.type === (vaultTab === 'themes' ? 'theme' : 'cosmetic')).map((item) => {
          const isPurchased = purchasedItems.includes(item.id) && item.type !== 'subscription';
          
          return (
            <ShopItemCard
              key={item.id}
              item={item}
              isPurchased={isPurchased}
              isItemActive={isItemActive}
              currentXP={currentXP}
              handleUnequip={handleUnequip}
              handleEquip={handleEquip}
              setSelectedItem={setSelectedItem}
              avatarUrl={state.user.avatar}
            />
          );
        })}
      </div>

      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="Confirm Purchase">
        {selectedItem && (
          <div className="flex flex-col items-center p-4">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: `${selectedItem.color}15` }}
            >
              <selectedItem.icon size={40} color={selectedItem.color} />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2 text-center">{selectedItem.name}</h3>
            <p className="text-[14px] text-text-muted text-center mb-8 max-w-sm">
              Are you sure you want to spend <span className="font-bold text-primary">{selectedItem.price} XP</span> on this {selectedItem.type}?
            </p>
            
            <div className="flex flex-col w-full gap-3">
              <button 
                onClick={handlePurchase}
                className="w-full py-3.5 bg-primary text-bg-base rounded-full font-bold text-[15px] hover:opacity-90 transition-opacity"
              >
                Confirm Purchase
              </button>
              <button 
                onClick={() => setSelectedItem(null)}
                className="w-full py-3.5 bg-surface-2 text-text-primary border border-border-base rounded-full font-bold text-[15px] hover:bg-surface-3 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
