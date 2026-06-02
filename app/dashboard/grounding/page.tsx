"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

type Phase = "inhale" | "holdFull" | "exhale" | "holdEmpty";

const textMap: Record<Phase, string> = {
  inhale: "Inhale...",
  holdFull: "Hold...",
  exhale: "Exhale...",
  holdEmpty: "Hold...",
};

const orbVariants: Variants = {
  inhale: {
    scale: 1.5,
    backgroundColor: "#818cf8", // Soft Indigo
    opacity: 0.8,
    boxShadow: "0 0 80px rgba(129,140,248,0.4)",
    transition: { duration: 4, ease: "easeInOut" }
  },
  holdFull: {
    scale: 1.5,
    backgroundColor: "#818cf8",
    opacity: [0.8, 0.4, 0.8], // Pulse
    boxShadow: "0 0 80px rgba(129,140,248,0.4)",
    transition: { duration: 4, ease: "easeInOut" }
  },
  exhale: {
    scale: 1,
    backgroundColor: "#81b29a", // Sage Green
    opacity: 0.8,
    boxShadow: "0 0 60px rgba(129,178,154,0.3)",
    transition: { duration: 4, ease: "easeInOut" }
  },
  holdEmpty: {
    scale: 1,
    backgroundColor: "#81b29a",
    opacity: [0.8, 0.4, 0.8], // Pulse
    boxShadow: "0 0 60px rgba(129,178,154,0.3)",
    transition: { duration: 4, ease: "easeInOut" }
  }
};

export default function GroundingPage() {
  const [phase, setPhase] = useState<Phase>("inhale");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let isMounted = true;

    const runBreathingCycle = async () => {
      while (isMounted) {
        setPhase("inhale");
        await new Promise((resolve) => setTimeout(resolve, 4000));
        if (!isMounted) break;

        setPhase("holdFull");
        await new Promise((resolve) => setTimeout(resolve, 4000));
        if (!isMounted) break;

        setPhase("exhale");
        await new Promise((resolve) => setTimeout(resolve, 4000));
        if (!isMounted) break;

        setPhase("holdEmpty");
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    };

    runBreathingCycle();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#0f172a]" />;

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#faf9f6] flex flex-col items-center justify-between p-6 md:p-12 font-sans selection:bg-[#818cf8]/30 overflow-hidden">
      
      {/* SECTION 1: Header & Context */}
      <div className="text-center mt-12 max-w-2xl relative z-10">
        <h1 className="text-4xl md:text-5xl font-serif text-[#c4a97f] tracking-wide mb-6">
          The Hardware Reset
        </h1>
        <p className="text-lg md:text-xl text-[#faf9f6]/80 font-light leading-relaxed">
          Sync your breath with the circle to manually override your nervous system&apos;s stress response.
        </p>
      </div>

      {/* SECTION 2: The Breathing Sandbox */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative min-h-[400px]">
        
        {/* Ambient background glow to enhance the hypnotic vibe */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            variants={orbVariants}
            animate={phase}
            className="w-96 h-96 rounded-full blur-[100px] opacity-30 mix-blend-screen"
          />
        </div>

        {/* The Main Breathing Orb */}
        <motion.div
          variants={orbVariants}
          animate={phase}
          className="w-48 h-48 md:w-64 md:h-64 rounded-full blur-[2px] flex items-center justify-center relative z-10"
        >
          {/* Inner ring for texture */}
          <div className="absolute inset-2 rounded-full border border-white/20 mix-blend-overlay"></div>
        </motion.div>

        {/* Text Indicator (Centered over orb) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
           <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="text-3xl md:text-4xl font-serif text-[#faf9f6] tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] mix-blend-overlay"
            >
              {textMap[phase]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* SECTION 3: The Safety Layer (Crisis Fallback) */}
      <div className="w-full max-w-3xl mt-12 mb-4 flex flex-col items-center relative z-10">
        <div className="w-full bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-3xl p-8 md:p-10 text-center transition-all duration-500 hover:bg-white/[0.04]">
          <p className="text-[#faf9f6]/50 text-sm md:text-base leading-relaxed mb-8 font-light max-w-xl mx-auto">
            If you are in immediate danger or experiencing a severe clinical panic attack, please reach out to professionals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <a 
              href="#" 
              onClick={(e) => e.preventDefault()}
              className="px-8 py-3 rounded-full border border-white/10 text-[#faf9f6]/60 hover:text-[#faf9f6] hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium tracking-wide"
            >
              International Hotlines
            </a>
            <a 
              href="#" 
              onClick={(e) => e.preventDefault()}
              className="px-8 py-3 rounded-full border border-white/10 text-[#faf9f6]/60 hover:text-[#faf9f6] hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium tracking-wide"
            >
              Text Crisis Line
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
