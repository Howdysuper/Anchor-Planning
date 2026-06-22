import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { useToast } from "../contexts/ToastContext";
import { motion } from "motion/react";
import { Moon, Edit2, Info } from "lucide-react";
import Modal from "./ui/Modal";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

export default function SleepIntel() {
  const { state, updateSleep } = useApp();
  const { addToast } = useToast();

  const chartData = state.sleep.history.map((score, i) => {
    const dayName = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i];
    const habitCompletion =
      score >= 80 ? 95 : score >= 70 ? 82 : score >= 60 ? 68 : 45;
    return {
      name: dayName,
      Score: score,
      Habits: habitCompletion,
    };
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    wake: state.sleep.wakeTime,
    bed: state.sleep.bedtime,
  });

  const handleSave = () => {
    updateSleep({ wakeTime: editData.wake, bedtime: editData.bed });
    addToast("Sleep schedule updated", "success");
    setIsEditModalOpen(false);
  };

  const getAIRecommendation = () => {
    let message = `Based on your ${state.anchors.length} scheduled anchors and a sleep score of ${state.sleep.score}%, we recommend starting your routine at `;
    
    const match = state.sleep.bedtime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return { text: "Based on your schedule, maintain your current wind-down.", time: state.sleep.bedtime };

    let hours = parseInt(match[1]);
    let mins = parseInt(match[2]);
    const ampm = match[3].toUpperCase();

    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    const deficitChunks = Math.max(0, Math.round((100 - state.sleep.score) / 10));
    let offsetMins = -(deficitChunks * 20);

    let explanation = "";
    if (offsetMins === 0) {
      explanation = " to maintain your strong sleep metrics!";
    } else {
      explanation = ` (${Math.abs(offsetMins)} mins early) to recover your sleep battery and maximize tomorrow's focus.`;
    }

    let newTotalMins = (hours * 60) + mins + offsetMins;
    if (newTotalMins < 0) newTotalMins += 24 * 60;
    
    let newHours = Math.floor(newTotalMins / 60) % 24;
    let newMins = newTotalMins % 60;

    const newAmpm = newHours >= 12 ? "PM" : "AM";
    if (newHours > 12) newHours -= 12;
    if (newHours === 0) newHours = 12;

    const timeStr = `${newHours}:${newMins.toString().padStart(2, '0')} ${newAmpm}`;
    return { text: message, time: timeStr, explanation };
  };

  const aiRec = getAIRecommendation();

  const getDayColor = (score: number) => {
    if (score >= 75) return "#6FF7A0";
    if (score >= 60) return "#F7A06F";
    return "#F76F6F";
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-[#F0F0F0] tracking-tight leading-tight mb-2">
            Sleep Intel
          </h1>
          <p className="text-[16px] text-[#888888] font-medium">
            Tracking recovery and wind-down.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Main Battery */}
        <div className="bg-[#141414] rounded-[24px] p-8 border border-[rgba(255,255,255,0.06)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center text-center">
          <h2 className="text-[14px] font-bold text-[#888888] uppercase tracking-widest mb-6">
            Current Sleep Battery
          </h2>

          <div className="relative w-[280px] h-[280px] flex items-center justify-center mb-8">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#1E1E1E"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#7C6FF7"
                strokeWidth="4"
                strokeDasharray="282.7"
                strokeDashoffset={282.7 * (1 - state.sleep.score / 100)}
                strokeLinecap="round"
                className="drop-shadow-[0_0_16px_rgba(124,111,247,0.5)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[64px] font-bold tabular-nums leading-none mb-2">
                {state.sleep.score}
                <span className="text-3xl text-[#888888]">%</span>
              </span>
              <span className="text-[14px] font-bold text-[#7C6FF7] uppercase tracking-widest bg-[rgba(124,111,247,0.1)] px-4 py-1.5 rounded-full">
                Optimized
              </span>
            </div>
          </div>

          <div
            className={`p-4 rounded-[16px] w-full flex items-center justify-between border ${state.sleep.debtHours < 0 ? "bg-[#1E1111] border-[rgba(247,111,111,0.2)]" : "bg-[#111e14] border-[rgba(111,247,160,0.2)]"}`}
          >
            <span className="text-[14px] font-medium text-[#888888]">
              Accumulated Debt
            </span>
            <span
              className={`text-[16px] font-bold ${state.sleep.debtHours < 0 ? "text-[#F76F6F]" : "text-[#6FF7A0]"}`}
            >
              {state.sleep.debtHours} hrs this week
            </span>
          </div>

          {/* Tracking Explanation */}
          <div className="mt-4 p-4 text-left border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] rounded-[16px]">
            <h4 className="flex items-center gap-2 text-[13px] font-bold text-[#F0F0F0] mb-2">
              <Info size={14} className="text-[#888888]" /> Tracking Methodology
            </h4>
            <p className="text-[12px] text-[#A0A0A0] leading-snug">
              Sleep Intel scores are derived from self-reported data using the Wake Up Check-in (Settings &gt; Notifications) combined with activity intervals. For absolute precision, connect Apple Health / Google Fit via the Connections menu (coming soon) to auto-sync sleep durations.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Target Schedule */}
          <div className="bg-[#141414] rounded-[24px] p-8 border border-[rgba(255,255,255,0.06)] shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[16px] font-bold">Target Schedule</h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 text-[#888888] hover:text-[#F0F0F0] bg-[#1E1E1E] rounded-lg border border-[rgba(255,255,255,0.04)]"
              >
                <Edit2 size={16} />
              </button>
            </div>

            <div className="flex justify-between items-center gap-4">
              <div className="flex-1 bg-[#1A1A1A] rounded-[16px] p-5 border border-[rgba(255,255,255,0.04)] text-center">
                <span className="text-[12px] font-bold text-[#888888] uppercase tracking-wider mb-2 block">
                  Bedtime
                </span>
                <span className="text-[24px] font-bold text-[#7C6FF7] tabular-nums">
                  {state.sleep.bedtime}
                </span>
              </div>
              <div className="flex-1 bg-[#1A1A1A] rounded-[16px] p-5 border border-[rgba(255,255,255,0.04)] text-center">
                <span className="text-[12px] font-bold text-[#888888] uppercase tracking-wider mb-2 block">
                  Wake Time
                </span>
                <span className="text-[24px] font-bold text-[#F0F0F0] tabular-nums">
                  {state.sleep.wakeTime}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between p-4 bg-[rgba(124,111,247,0.05)] border border-[rgba(124,111,247,0.2)] rounded-[16px]">
              <div className="flex items-center gap-3">
                <Moon size={20} className="text-[#7C6FF7]" />
                <div>
                  <p className="text-[14px] font-bold text-[#F0F0F0]">
                    Wind-down reminder
                  </p>
                  <p className="text-[12px] text-[#888888] mt-0.5">
                    30 mins before bed
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  updateSleep({
                    windDownReminder: !state.sleep.windDownReminder,
                  });
                  addToast("Wind-down updated");
                }}
                className={`w-[48px] h-[28px] rounded-full flex items-center p-1 transition-colors ${state.sleep.windDownReminder ? "bg-[#7C6FF7]" : "bg-[#1E1E1E] border border-[rgba(255,255,255,0.08)]"}`}
              >
                <motion.div
                  initial={false}
                  animate={{ x: state.sleep.windDownReminder ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-[20px] h-[20px] bg-white rounded-full shadow-sm"
                />
              </button>
            </div>

            <div className="mt-3 p-4 bg-[rgba(111,247,160,0.05)] border border-[rgba(111,247,160,0.2)] rounded-[16px]">
              <h4 className="text-[12px] font-bold text-[#6FF7A0] uppercase tracking-wider mb-1">AI Optimal Wind-Down Prediction</h4>
              <p className="text-[13px] text-[#A0A0A0] leading-snug">
                {aiRec.text}
                {aiRec.time && <strong className="text-[#6FF7A0]">{aiRec.time}</strong>}
                {aiRec.explanation && <span>{aiRec.explanation}</span>}
              </p>
            </div>
          </div>

          {/* 7-Day History Chart with Recharts */}
          <div className="bg-[#141414] rounded-[24px] p-8 border border-[rgba(255,255,255,0.06)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[16px] font-bold">7-Day Completion summary</h3>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#7C6FF7]" />
                  <span className="text-[#888888]">Sleep Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#6FF7A0]" />
                  <span className="text-[#888888]">Habit Score</span>
                </div>
              </div>
            </div>

            <div className="w-full h-[200px] mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C6FF7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7C6FF7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6FF7A0" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6FF7A0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#555555"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="font-medium"
                  />
                  <YAxis
                    stroke="#555555"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickCount={5}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#1A1A1A",
                      borderColor: "rgba(255,255,255,0.08)",
                      borderRadius: "14px",
                      color: "#F0F0F0",
                      fontSize: "12px",
                      padding: "10px 14px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                    }}
                    itemStyle={{
                      color: "#F0F0F0",
                      padding: "2px 0",
                    }}
                    labelStyle={{
                      fontWeight: "bold",
                      marginBottom: "4px",
                      color: "#888888",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Score"
                    stroke="#7C6FF7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    activeDot={{
                      r: 5,
                      stroke: "#7C6FF7",
                      strokeWidth: 2,
                      fill: "#141414",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Habits"
                    stroke="#6FF7A0"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHabits)"
                    activeDot={{
                      r: 5,
                      stroke: "#6FF7A0",
                      strokeWidth: 2,
                      fill: "#141414",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Schedule"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#888888] uppercase tracking-wide">
              Bedtime
            </label>
            <input
              type="text"
              value={editData.bed}
              onChange={(e) =>
                setEditData({ ...editData, bed: e.target.value })
              }
              className="h-[52px] w-full bg-[#1A1A1A] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 outline-none text-[#7C6FF7] focus:border-[#7C6FF7] text-[18px] font-bold"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#888888] uppercase tracking-wide">
              Wake Time
            </label>
            <input
              type="text"
              value={editData.wake}
              onChange={(e) =>
                setEditData({ ...editData, wake: e.target.value })
              }
              className="h-[52px] w-full bg-[#1A1A1A] rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 outline-none text-[#F0F0F0] focus:border-[#7C6FF7] text-[18px] font-bold"
            />
          </div>
          <button
            onClick={handleSave}
            className="h-[52px] w-full bg-[#7C6FF7] hover:bg-[#6b5ee6] text-[#0A0A0A] rounded-[12px] font-bold text-[16px] transition-colors mt-4"
          >
            Save Schedule
          </button>
        </div>
      </Modal>
    </div>
  );
}
