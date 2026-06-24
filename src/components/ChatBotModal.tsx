import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, Sparkles, User, ArrowRight, MessageSquareText } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { logout } from '../lib/firebase';
import { formatDueDisplay } from '../lib/questUtils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  action?: {
    type: string;
    payload: string;
    label: string;
  };
}

export function ChatBotWidget() {
  const { navigate, state, updateSleep, updateState, setQuests, setAnchors } = useApp();
  const { clearAllData } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: "Hi! I'm your Anchor AI Assistant. Need help managing your tasks, finding something, or checking your stats?"
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Where do I manage my tasks?",
    "How do I add a new habit?",
    "Take me to my sleep stats"
  ]);
  const [liveSuggestions, setLiveSuggestions] = useState<string[]>([]);
  
  const drawerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const lastMessageCountRef = useRef(messages.length);

  // Unread indicator logic
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      if (!isOpen && messages[messages.length - 1].role === 'assistant') {
        setHasUnread(true);
      }
      lastMessageCountRef.current = messages.length;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        // Only close if we're not clicking the FAB button (which toggles it)
        const isFabClick = (e.target as HTMLElement).closest('button[title="Ask Anchor AI"]');
        if (!isFabClick) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced input for live suggestions
  useEffect(() => {
    const fetchLiveSuggestions = async () => {
      if (!input.trim() || input.length < 3) {
        setLiveSuggestions([]);
        return;
      }
      try {
        const res = await fetch('/api/chat/autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input })
        });
        if (res.ok) {
          const data = await res.json();
          setLiveSuggestions(data.suggestions || []);
        }
      } catch (e) {
        console.error("Autocomplete error", e);
      }
    };

    const timer = setTimeout(fetchLiveSuggestions, 500);
    return () => clearTimeout(timer);
  }, [input]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    setInput('');
    setLiveSuggestions([]);
    
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Create a simplified history for context
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, state })
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Execute actions automatically
        if (data.executeActions && Array.isArray(data.executeActions)) {
          let newQuests = [...state.quests];
          let newAnchors = [...state.anchors];
          let updatedState = false;

          for (const action of data.executeActions) {
            if (action.type === 'checkin_sleep') {
              localStorage.setItem('anchor_sleep_start', Date.now().toString());
            } else if (action.type === 'wakeup') {
              const sleepStart = localStorage.getItem('anchor_sleep_start');
              if (sleepStart) {
                const durationMs = Date.now() - parseInt(sleepStart);
                const hours = durationMs / (1000 * 60 * 60);
                const newScore = Math.min(100, Math.max(0, Math.round((hours / 8) * 100)));
                const debt = (8 - hours);
                updateSleep({
                  score: newScore,
                  debtHours: parseFloat((state.sleep.debtHours + debt).toFixed(1)),
                  history: [...state.sleep.history.slice(1), newScore]
                });
                localStorage.removeItem('anchor_sleep_start');
              }
            } else if (action.type === 'navigate') {
              if (action.payload?.pageId) navigate(action.payload.pageId);
            } else if (action.type === 'update_state') {
              if (action.payload?.state) updateState(action.payload.state);
            } else if (action.type === 'clear_data') {
              clearAllData();
            } else if (action.type === 'logout') {
              logout();
            } else if (action.type === 'create_quest') {
              const newQuest = action.payload?.quest || {};
              const dueRawVal = newQuest.dueRaw || new Date().toISOString().split('T')[0];
              const dueTimeVal = newQuest.dueTime || '';
              const formattedDue = formatDueDisplay(dueRawVal, dueTimeVal);
              newQuests.push({
                id: Date.now() + Math.random(),
                title: newQuest.title || 'New Quest',
                description: newQuest.description || '',
                due: formattedDue,
                dueRaw: dueRawVal,
                dueTime: dueTimeVal,
                xp: newQuest.xp || 15,
                category: 'General',
                done: false,
                createdAt: Date.now(),
                streak: 1
              });
              updatedState = true;
            } else if (action.type === 'create_anchor') {
              const newAnchor = action.payload?.anchor || {};
              newAnchors.push({
                id: Date.now() + Math.random(),
                time: newAnchor.time || '12:00 PM',
                title: newAnchor.title || 'New Routine',
                subtitle: newAnchor.subtitle || 'Generated by AI',
                xp: newAnchor.xp || 15,
                status: 'upcoming',
                type: 'auto',
                category: newAnchor.category || 'General',
                note: ''
              });
              updatedState = true;
            }
          }

          if (updatedState) {
            updateState({ quests: newQuests, anchors: newAnchors });
          }
        }

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.reply,
          action: data.suggestedAction
        }]);
        if (data.suggestedQuestions && data.suggestedQuestions.length > 0) {
          setSuggestions(data.suggestedQuestions);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I ran into an error." }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, network error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            title="Ask Anchor AI"
            className="fixed bottom-24 md:bottom-8 right-6 md:right-8 w-14 h-14 bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9] text-[#0A0A0A] shadow-[0_8px_32px_rgba(56,189,248,0.4)] border-[rgba(255,255,255,0.2)] rounded-[16px] flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-[110] border"
          >
            <MessageSquareText size={26} strokeWidth={2.5} />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-[#1A1A1A]"></span>
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] pointer-events-none p-4 sm:p-6 flex justify-end items-end">
            <motion.div 
              ref={drawerRef}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full sm:w-[420px] h-full max-h-full bg-[rgba(255,255,255,0.08)] backdrop-blur-[48px] border border-[rgba(255,255,255,0.2)] rounded-[28px] shadow-[0_24px_64px_rgba(56,189,248,0.15)] flex flex-col pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[rgba(255,255,255,0.06)] bg-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#38BDF8]/40 to-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] shadow-[0_0_20px_rgba(56,189,248,0.25)]">
                    <Sparkles size={20} className="drop-shadow-md" />
                  </div>
                  <div>
                    <h3 className="text-[#F0F0F0] font-bold text-[16px] tracking-wide">Anchor AI</h3>
                    <p className="text-[#888888] text-[12px]">Your personal assistant</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white hover:text-white p-2.5 bg-[#333] hover:bg-[#444] rounded-full transition-all shadow-md border border-[rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 group">
                  <X size={22} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-transparent no-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#38BDF8]/20 border border-[#38BDF8]/30 flex flex-shrink-0 items-center justify-center text-[#38BDF8] mt-1">
                  <Bot size={15} />
                </div>
              )}
              
              <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3.5 text-[14px] leading-relaxed shadow-sm backdrop-blur-xl ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-[#38BDF8]/30 to-[#38BDF8]/10 border border-[#38BDF8]/40 text-[#F0F0F0] rounded-[18px] rounded-tr-[4px]' 
                    : 'bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] text-[#F0F0F0] rounded-[18px] rounded-tl-[4px]'
                }`}>
                  {msg.content}
                </div>
                
                {msg.action && (
                  <button
                    onClick={() => {
                      if (msg.action?.type === 'navigate') {
                        navigate(msg.action.payload);
                        setIsOpen(false);
                      }
                    }}
                    className="flex items-center gap-2 bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25 text-[#38BDF8] border border-[#38BDF8]/30 px-4 py-2 rounded-full text-[13px] font-bold transition-colors backdrop-blur-md"
                  >
                    {msg.action.label} <ArrowRight size={14} />
                  </button>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#333] to-[#222] border border-[rgba(255,255,255,0.1)] flex flex-shrink-0 items-center justify-center text-[#F0F0F0] mt-1">
                  <User size={15} />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#38BDF8]/20 border border-[#38BDF8]/30 flex flex-shrink-0 items-center justify-center text-[#38BDF8] mt-1">
                <Sparkles size={15} className="animate-pulse" />
              </div>
              <div className="bg-[rgba(255,255,255,0.05)] text-[#38BDF8] p-3.5 rounded-[18px] rounded-tl-[4px] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl flex items-center gap-1.5 h-[46px]">
                <span className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries / Auto-complete */}
        <div className="px-5 py-3 border-t border-[rgba(255,255,255,0.04)] bg-transparent flex gap-2 overflow-x-auto no-scrollbar">
          {(liveSuggestions.length > 0 ? liveSuggestions : suggestions).map((sugg, i) => (
            <button
              key={i}
              onClick={() => handleSend(sugg)}
              className="flex-shrink-0 px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.15)] hover:border-[#38BDF8]/40 text-[#E0E0E0] hover:text-[#38BDF8] text-[13px] rounded-full border border-[rgba(255,255,255,0.15)] transition-all whitespace-nowrap backdrop-blur-xl"
            >
              {sugg}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-5 pt-2 bg-transparent pb-safe">
          <div className="flex items-end gap-2 bg-[rgba(255,255,255,0.05)] backdrop-blur-2xl border border-[rgba(255,255,255,0.15)] rounded-[20px] p-2 focus-within:border-[#38BDF8]/60 focus-within:shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent border-none outline-none text-[#F0F0F0] text-[14px] resize-none max-h-[120px] min-h-[24px] p-2.5 placeholder-[#666] no-scrollbar"
              rows={1}
              style={{
                height: input ? Math.min(120, input.split('\n').length * 24 + 16) + 'px' : '44px'
              }}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded-full flex-shrink-0 transition-all ${
                !input.trim() || isLoading
                  ? 'bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.3)]'
                  : 'bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9] text-[#0A0A0A] shadow-[0_4px_16px_rgba(56,189,248,0.4)] hover:scale-105'
              }`}
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
        </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
