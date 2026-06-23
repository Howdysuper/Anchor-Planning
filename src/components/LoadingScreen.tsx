import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Anchor } from "lucide-react";

export default function LoadingScreen() {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 550);
    return () => clearInterval(interval);
  }, []);

  // Google Premium colors for ambient dots
  const googleColors = [
    { name: "Blue", bg: "bg-[#4285F4]" },
    { name: "Red", bg: "bg-[#EA4335]" },
    { name: "Yellow", bg: "bg-[#FBBC05]" },
    { name: "Green", bg: "bg-[#34A853]" }
  ];

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#000000] text-[#F5F5F5] font-sans relative overflow-hidden select-none">
      {/* Pure OLED Premium Background Glow - Pulse Effect */}
      <motion.div 
        animate={{
          scale: [0.95, 1.05, 0.95],
          opacity: [0.35, 0.55, 0.35]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-gradient-to-tr from-[rgba(66,133,244,0.08)] via-[rgba(234,67,53,0.05)] to-[rgba(52,168,83,0.08)] rounded-full blur-[100px] pointer-events-none" 
      />

      <div className="z-10 flex flex-col items-center gap-10">
        {/* Animated Premium Logo Wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-6"
        >
          {/* Logo container with a premium double-ring pulse effect */}
          <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-b from-[#181818] to-[#0A0A0A] rounded-[24px] border border-[rgba(255,255,255,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <motion.div
              className="absolute inset-0 rounded-[24px] border border-[#7C6FF7] opacity-25"
              animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0, 0.25] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <Anchor size={36} className="text-[#7C6FF7] drop-shadow-[0_0_12px_rgba(124,111,247,0.4)]" />
          </div>

          {/* The Google Dots Loader - smooth slide up */}
          <div className="flex items-center gap-2.5">
            {googleColors.map((dot, idx) => (
              <motion.div
                key={dot.name}
                className={`w-[10px] h-[10px] rounded-full ${dot.bg} shadow-[0_0_8px_rgba(255,255,255,0.1)]`}
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.15, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: idx * 0.15
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Loading Text and Branding */}
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <motion.h3 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-[22px] font-bold tracking-tight text-[#FFFFFF] font-sans flex items-center justify-center gap-1 min-w-[280px]"
          >
            Loading Anchor
          </motion.h3>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-[14px] text-[#A0A0A0] font-medium leading-relaxed max-w-xs"
          >
            Please sit back while we load your data{dots}
          </motion.p>
        </div>

        {/* Footer info showing Google Spark Infrastructure details */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="absolute bottom-8 flex flex-col items-center gap-1.5"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#34A853] rounded-full animate-ping" />
            <span className="text-[10px] font-mono tracking-wider text-center uppercase text-[#888888]">
              anchor-flow-cloud
            </span>
          </div>
          <span className="text-[9px] font-sans text-center text-[#555555]">
            Firebase Cloud Gateway • Premium Sync Active
          </span>
        </motion.div>
      </div>
    </div>
  );
}
