import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Pencil, Filter, Mic, MicOff, Sparkles } from 'lucide-react';
import Modal from './ui/Modal';

const FILTERS = ['All', 'Task', 'Idea', 'People', 'Grab'];
const COLORS: Record<string, string> = {
  idea: '#F7A06F',
  task: '#6FBBF7',
  person: '#7C6FF7',
  grab: '#6FF7A0'
};

export default function BrainDump() {
  const { state, setBrainDumps } = useApp();
  const { addToast } = useToast();
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDump, setNewDump] = useState({ text: '', category: 'idea' });
  const [editDump, setEditDump] = useState<{ id: number; text: string; category: string } | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);
  const [isPromptLoading, setIsPromptLoading] = useState(false);

  const dumps = state.brainDumps.filter(d => filter === 'All' || d.category.toLowerCase().includes(filter.toLowerCase()));

  // Speech Recognition Setup
  const [recognition, setRecognition] = useState<any>(null);
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          currentTranscript += transcript;
        }
        setNewDump(prev => ({ ...prev, text: prev.text + (prev.text.endsWith(' ') ? '' : ' ') + currentTranscript }));
      };
      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
      rec.onend = () => {
        setIsRecording(false);
      };
      setRecognition(rec);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      addToast('Speech recognition not supported in this browser.', 'error');
      return;
    }
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const fetchAiPrompt = async () => {
    const recentHabits = state.anchors.filter(a => a.status === 'done').map(a => a.title).slice(0, 10);
    if (recentHabits.length === 0) {
      addToast("Complete some habits first to generate a personalized prompt!", "info");
      return;
    }
    setIsPromptLoading(true);
    try {
      const res = await fetch("/api/reflective-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recentHabits })
      });
      if (res.ok) {
        const data = await res.json();
        setAiPrompt(data.prompt);
      }
    } catch(e) {
      console.error(e);
      addToast("Failed to fetch AI prompt", "error");
    } finally {
      setIsPromptLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setBrainDumps(state.brainDumps.filter(d => d.id !== id));
    addToast('Brain dump discarded', 'info');
  };

  const handleSave = () => {
    if (!newDump.text.trim()) return;
    const item = {
      id: Date.now(),
      text: newDump.text,
      time: 'Just now',
      category: newDump.category,
      color: Object.keys(COLORS).find(k => newDump.category.includes(k)) || 'task'
    };
    setBrainDumps([item, ...state.brainDumps]);
    addToast('Captured to Brain Dump', 'success');
    setIsModalOpen(false);
    setNewDump({ text: '', category: 'idea' });
  };

  const handleUpdate = () => {
    if (!editDump || !editDump.text.trim()) return;
    setBrainDumps(state.brainDumps.map(d => d.id === editDump.id ? {
      ...d,
      text: editDump.text.trim(),
      category: editDump.category,
      color: Object.keys(COLORS).find(k => editDump.category.includes(k)) || 'task'
    } : d));
    addToast('Brain dump updated!', 'success');
    setEditDump(null);
  };

  return (
    <div className="pb-12">
      {/* Filters */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[18px] font-bold text-[#F0F0F0]">Quick Notes</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-[36px] px-4 bg-[rgba(124,111,247,0.1)] hover:bg-[rgba(124,111,247,0.2)] text-[#7C6FF7] border border-[rgba(124,111,247,0.2)] rounded-[10px] font-bold text-[13px] transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          New Note
        </button>
      </div>
      
      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
         {FILTERS.map((f) => (
           <button
             key={f}
             onClick={() => setFilter(f)}
             className={`px-4 py-2 rounded-full text-[14px] font-bold transition-all whitespace-nowrap border ${
               filter === f 
                 ? 'bg-[#E5E5E5] text-[#0A0A0A] border-[#E5E5E5]'
                 : 'bg-[#141414] text-[#888888] border-[rgba(255,255,255,0.06)] hover:bg-[#1E1E1E]'
             }`}
           >
             {f}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence>
          {dumps.map((dump) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={dump.id}
              className="bg-[#141414] rounded-[20px] p-5 border border-[rgba(255,255,255,0.06)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] group hover:bg-[#1A1A1A] transition-colors relative min-h-[80px]"
            >
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setEditDump({ id: dump.id, text: dump.text, category: dump.category })}
                  className="p-1.5 text-[#888888] hover:text-[#F0F0F0] hover:bg-[#252525] rounded-md transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(dump.id)} className="p-1.5 text-[#888888] hover:text-[#F76F6F] hover:bg-[rgba(247,111,111,0.1)] rounded-md transition-colors"><X size={14} /></button>
              </div>
              <p className="text-[14px] text-[#F0F0F0] leading-[1.5] break-words pr-12">{dump.text}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[12px] text-[#888888] font-medium">{dump.time}</span>
                <div className="flex items-center gap-1.5 bg-[#0A0A0A] px-2 py-1 rounded-full border border-[rgba(255,255,255,0.04)]">
                   <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: Object.entries(COLORS).find(([k]) => dump.category.includes(k))?.[1] || COLORS.task }} />
                   <span className="text-[10px] font-bold text-[#888888] uppercase">{dump.category}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
         <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-bold text-[#F0F0F0]">Quick Capture</h2>
              <div className="flex gap-2">
                <button 
                  onClick={toggleRecording} 
                  className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${isRecording ? 'bg-[rgba(247,111,111,0.1)] text-[#F76F6F] animate-pulse' : 'bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#888888]'}`}
                  title="Voice to text"
                >
                  {isRecording ? <Mic size={16} /> : <MicOff size={16} />}
                </button>
                <button 
                  onClick={fetchAiPrompt} 
                  disabled={isPromptLoading}
                  className="px-3 py-1.5 flex items-center gap-2 rounded-lg text-[12px] font-bold bg-[rgba(124,111,247,0.1)] text-[#7C6FF7] border border-[rgba(124,111,247,0.2)] hover:bg-[rgba(124,111,247,0.2)] transition-colors"
                >
                  <Sparkles size={14} />
                  {isPromptLoading ? "Generating..." : "Weekly AI Prompt"}
                </button>
              </div>
            </div>

            {aiPrompt && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-[12px] bg-[rgba(124,111,247,0.05)] border border-[rgba(124,111,247,0.2)]">
                <p className="text-[14px] text-[#E0E0E0] italic font-serif">"{aiPrompt}"</p>
                <button onClick={() => { setNewDump(prev => ({ ...prev, text: `${aiPrompt}\n\n` })); setAiPrompt(null); }} className="mt-3 text-[12px] font-bold text-[#7C6FF7] hover:underline">Use this prompt</button>
              </motion.div>
            )}

            <textarea
              autoFocus
              value={newDump.text}
              onChange={e => setNewDump({...newDump, text: e.target.value})}
              placeholder="Quickly dump an idea, task, or distracting thought... You can type or use the mic."
              className="w-full bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-4 text-[#F0F0F0] outline-none min-h-[120px] resize-none focus:border-[#7C6FF7] focus:shadow-[0_0_12px_rgba(124,111,247,0.2)] transition-all text-base"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); }
              }}
            />
            <div className="flex gap-2">
              {['task', 'idea', 'person', 'grab item'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setNewDump({...newDump, category: cat})}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase transition-all ${
                    newDump.category === cat ? 'bg-[rgba(124,111,247,0.15)] text-[#7C6FF7] border border-[rgba(124,111,247,0.3)]' : 'bg-[#1E1E1E] text-[#888888] border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
               onClick={handleSave}
               className="h-[52px] w-full bg-[#7C6FF7] hover:bg-[#6b5ee6] text-[#0A0A0A] rounded-[14px] font-bold text-[16px] transition-all"
            >
              Capture to Brain Dump
            </button>
         </div>
      </Modal>

      <Modal isOpen={editDump !== null} onClose={() => setEditDump(null)}>
         {editDump && (
           <div className="flex flex-col gap-6">
              <h2 className="text-[20px] font-bold text-[#F0F0F0]">Edit Capture</h2>
              <textarea
                autoFocus
                value={editDump.text}
                onChange={e => setEditDump({...editDump, text: e.target.value})}
                placeholder="Quickly dump an idea, task, or distracting thought..."
                className="w-full bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-4 text-[#F0F0F0] outline-none min-h-[120px] resize-none focus:border-[#7C6FF7] focus:shadow-[0_0_12px_rgba(124,111,247,0.2)] transition-all text-base"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleUpdate(); }
                }}
              />
              <div className="flex gap-2 flex-wrap">
                {['task', 'idea', 'person', 'grab item'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setEditDump({...editDump, category: cat})}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase transition-all ${
                      editDump.category === cat ? 'bg-[rgba(124,111,247,0.15)] text-[#7C6FF7] border border-[rgba(124,111,247,0.3)]' : 'bg-[#1E1E1E] text-[#888888] border border-transparent'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button
                 onClick={handleUpdate}
                 className="h-[52px] w-full bg-[#7C6FF7] hover:bg-[#6b5ee6] text-[#0A0A0A] rounded-[14px] font-bold text-[16px] transition-all shadow-[0_0_14px_rgba(124,111,247,0.2)]"
              >
                Save Changes
              </button>
           </div>
         )}
      </Modal>

    </div>
  );
}
