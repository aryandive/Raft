import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function BoxBreathing() {
  const [isActive, setIsActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setElapsed(prev => (prev + 1) % 16);
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const getPhase = () => {
    if (!isActive) return { text: "READY", count: null };
    if (elapsed < 4) return { text: "INHALE", count: 4 - elapsed };
    if (elapsed < 8) return { text: "HOLD", count: 8 - elapsed };
    if (elapsed < 12) return { text: "EXHALE", count: 12 - elapsed };
    return { text: "HOLD", count: 16 - elapsed };
  };

  const { text, count } = getPhase();

  // Framer motion variants to handle CSS hardware accelerated transforms without CLS
  const circleVariants = {
    active: {
      scale: [1, 1.5, 1.5, 1, 1],
      opacity: [1, 1, 0.4, 1, 1, 1, 0.4, 1],
      transition: {
        scale: {
          duration: 16,
          repeat: Infinity,
          ease: "linear",
          times: [0, 0.25, 0.5, 0.75, 1]
        },
        opacity: {
          duration: 16,
          repeat: Infinity,
          ease: "linear",
          times: [0, 0.25, 0.375, 0.5, 0.75, 0.875, 1] 
          // Pulses down to 0.4 at the midpoints of the hold phases (6s and 14s)
        }
      }
    },
    inactive: {
      scale: 1,
      opacity: 0.15,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-8 bg-[#0f172a] rounded-xl border border-white/5 font-mono text-slate-200">
      <div className="text-center mb-12 h-8">
        <h2 className="text-sm uppercase tracking-widest text-slate-400">Autonomic Pacing</h2>
        <p className="text-[10px] opacity-50 mt-1">4-4-4-4 Box Breathing</p>
      </div>

      {/* Animation Container (Fixed size to prevent CLS) */}
      <div className="relative w-48 h-48 flex items-center justify-center my-8">
        {/* The Animated Geometry */}
        <motion.div
          variants={circleVariants}
          animate={isActive ? "active" : "inactive"}
          initial="inactive"
          className="absolute w-32 h-32 rounded-full border-2 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          style={{ originX: 0.5, originY: 0.5 }}
        />
        
        {/* Core static reference ring */}
        <div className="absolute w-32 h-32 rounded-full border border-white/5" />

        {/* Text Instructions (Absolute centered to prevent layout shift) */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-lg font-medium tracking-[0.2em]">{text}</span>
          <span className="text-3xl font-light mt-1 h-10 flex items-center">
            {count !== null ? count : '—'}
          </span>
        </div>
      </div>

      <div className="flex space-x-4 mt-12">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-6 py-2 rounded uppercase tracking-widest text-xs transition-colors duration-200 border ${
            isActive 
              ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300' 
              : 'bg-slate-100 text-slate-900 border-transparent hover:bg-white'
          }`}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={() => {
            setIsActive(false);
            setElapsed(0);
          }}
          className="px-6 py-2 rounded uppercase tracking-widest text-xs border border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
