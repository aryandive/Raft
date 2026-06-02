"use client";

import { useEffect, useState } from "react";
import { Shield, Activity, CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getLocalMasterKey, encryptPayload } from "@/utils/crypto";

export default function DashboardPage() {
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const hydrateData = async () => {
      const calData = sessionStorage.getItem('raft_calibration');
      if (calData) {
        try {
          const localKey = await getLocalMasterKey();
          if (!localKey) return; // Abort if no key

          // Phase 5: Encrypt this payload securely using the local CryptoKey
          const { ciphertext, iv } = await encryptPayload(calData, localKey);
          
          console.log("🔒 Calibration Data Encrypted:", { ciphertext, iv }); // Placeholder for DB insert
          
          // Clear it immediately so it doesn't re-trigger on next load
          sessionStorage.removeItem('raft_calibration');
          
          // Show soft UI toast
          setToast(true);
          setTimeout(() => setToast(false), 4000);
        } catch (err) {
          console.error("Failed to encrypt calibration data:", err);
        }
      }
    };
    
    hydrateData();
  }, []);

  // Format date: e.g., "OCT 24, 2026"
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();

  return (
    <div className="min-h-screen p-6 lg:p-12 font-sans relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#1e293b]/90 backdrop-blur-md border border-[#81b29a]/30 rounded-2xl shadow-xl"
          >
            <CheckCircle size={18} className="text-[#81b29a]" />
            <span className="text-sm font-medium text-[#faf9f6]">Your calibration data has been securely encrypted.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto mt-4 relative z-10">
        
        {/* Header / Status Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-[#faf9f6] mb-2 tracking-wide">
              Good afternoon.
            </h1>
            <p className="font-mono text-xs text-[#faf9f6]/40 tracking-widest">{currentDate}</p>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <Shield size={14} className="text-[#81b29a]" />
            <span className="text-xs font-medium text-[#faf9f6]/70 uppercase tracking-widest">Vault Status: Secured</span>
            <div className="w-2 h-2 rounded-full bg-[#81b29a] animate-pulse shadow-[0_0_8px_#81b29a]"></div>
          </div>
        </div>

        {/* Bento Box CSS Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-[auto_1fr] gap-6">
          
          {/* Panel 1: Top Span - Quick Telemetry */}
          <div className="md:col-span-8 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-serif text-[#faf9f6]">Current State</h2>
              <Activity size={18} className="text-[#faf9f6]/40" />
            </div>
            
            <div className="relative h-16 w-full flex items-center">
              {/* Slider Track */}
              <div className="absolute w-full h-2 rounded-full bg-gradient-to-r from-[#e07a5f] via-[#c4a97f] to-[#818cf8] opacity-80"></div>
              
              {/* Mock Slider Handle */}
              <div className="absolute left-[60%] w-6 h-6 -ml-3 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)] border-2 border-[#818cf8] transition-transform group-hover:scale-110 cursor-pointer flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#818cf8]"></div>
              </div>
            </div>
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#faf9f6]/40 mt-2 font-mono">
              <span>Overstimulated</span>
              <span>Baseline</span>
              <span>Regulated</span>
            </div>
          </div>

          {/* Panel 4: Right Span - The Ambient Tree */}
          <div className="md:col-span-4 md:row-span-2 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[400px]">
            <div className="relative z-10">
              <h2 className="text-lg font-serif text-[#faf9f6] mb-1">Growth Matrix</h2>
              <p className="text-xs text-[#faf9f6]/40 font-light">Resilience topology</p>
            </div>
            
            {/* SVG Abstract Node Tree */}
            <div className="absolute inset-0 flex items-end justify-center pointer-events-none opacity-80 mix-blend-screen">
              <svg width="100%" height="80%" viewBox="0 0 200 300" preserveAspectRatio="xMidYMax slice">
                {/* Connections */}
                <path d="M100 300 Q100 220 50 180" fill="none" stroke="rgba(196,169,127,0.3)" strokeWidth="2" />
                <path d="M100 300 Q100 220 150 160" fill="none" stroke="rgba(129,178,154,0.3)" strokeWidth="2" />
                <path d="M50 180 Q30 120 70 80" fill="none" stroke="rgba(196,169,127,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M150 160 Q170 100 120 70" fill="none" stroke="rgba(129,178,154,0.3)" strokeWidth="1.5" />
                <path d="M70 80 Q100 40 120 70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                
                {/* Glowing Nodes */}
                <circle cx="100" cy="300" r="4" fill="#c4a97f" className="animate-pulse" />
                <circle cx="50" cy="180" r="3" fill="#c4a97f" />
                <circle cx="150" cy="160" r="4" fill="#81b29a" className="animate-pulse" />
                <circle cx="70" cy="80" r="3" fill="#c4a97f" />
                <circle cx="120" cy="70" r="5" fill="#81b29a" />
              </svg>
            </div>
            
            <div className="mt-auto relative z-10 flex justify-between items-end border-t border-white/10 pt-4">
              <span className="text-2xl font-serif text-[#81b29a]">12</span>
              <span className="text-[10px] uppercase tracking-widest text-[#faf9f6]/40 text-right max-w-[80px]">Active Nodes</span>
            </div>
          </div>

          {/* Panel 2: Center Left - The Vault Entry */}
          <div className="md:col-span-5 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Shield size={16} className="text-[#818cf8]" />
              <h2 className="text-lg font-serif text-[#faf9f6]">Encrypted Journal</h2>
            </div>
            
            <textarea 
              className="w-full flex-1 min-h-[120px] bg-black/20 border border-white/5 rounded-xl p-4 text-sm text-[#faf9f6] placeholder:text-[#faf9f6]/20 focus:outline-none focus:border-[#818cf8]/40 resize-none transition-colors mb-4"
              placeholder="Offload your thoughts. Only you hold the key..."
            ></textarea>
            
            <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium uppercase tracking-widest text-[#faf9f6]/80 hover:text-white transition-all group flex items-center justify-center gap-2">
              <Shield size={14} className="group-hover:text-[#818cf8] transition-colors" />
              Seal Entry
            </button>
          </div>

          {/* Panel 3: Center Middle - The Grounding Tool */}
          <div className="md:col-span-3 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-[#81b29a]/30 transition-colors">
            <Link href="/dashboard/grounding" className="absolute inset-0 z-20"></Link>
            
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#e07a5f] animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-widest text-[#faf9f6]/40">Emergency</span>
            </div>
            
            <div className="relative w-24 h-24 my-6 flex items-center justify-center">
              {/* Miniature static Box Breathing orb */}
              <div className="absolute inset-0 bg-[#81b29a]/20 rounded-full blur-xl group-hover:bg-[#81b29a]/30 transition-colors"></div>
              <div className="w-12 h-12 rounded-full border border-[#81b29a]/40 bg-[#81b29a]/10 backdrop-blur-sm animate-[pulse_4s_ease-in-out_infinite] group-hover:scale-110 transition-transform"></div>
            </div>
            
            <h3 className="text-sm font-serif text-[#faf9f6] mb-1">Override Sequence</h3>
            <p className="text-[10px] text-[#faf9f6]/40 uppercase tracking-widest">Initiate</p>
          </div>

        </div>
      </div>
    </div>
  );
}
