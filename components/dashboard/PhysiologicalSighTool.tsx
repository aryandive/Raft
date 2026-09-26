"use client";
import React from 'react';

export function PhysiologicalSighTool({ duration = "90s" }: { duration?: string }) {
  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6 my-6 font-mono text-center max-w-sm mx-auto shadow-inner">
      <h4 className="text-xs tracking-widest text-[#e07a5f] uppercase mb-2">Physiological Sigh</h4>
      <p className="text-[10px] text-slate-500 mb-4 uppercase">Target Duration: {duration}</p>
      
      <div className="w-32 h-32 mx-auto rounded-full border-2 border-dashed border-[#e07a5f]/40 flex items-center justify-center animate-[spin_10s_linear_infinite]">
        <div className="w-24 h-24 rounded-full bg-[#e07a5f]/10 animate-pulse flex items-center justify-center">
          <span className="text-[#e07a5f] text-xs font-bold uppercase tracking-widest">Inhale</span>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-400">Two inhales (nose), one long exhale (mouth).</p>
    </div>
  );
}
