"use client";
import React from 'react';

export function DualTaskProtocol({ duration = "120s" }: { duration?: string }) {
  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6 my-6 font-mono text-center max-w-sm mx-auto shadow-inner">
      <h4 className="text-xs tracking-widest text-slate-400 uppercase mb-2">Dual-Task Protocol</h4>
      <p className="text-[10px] text-slate-500 mb-6 uppercase">Target Duration: {duration}</p>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/20 p-4 rounded border border-white/5">
          <p className="text-[#81b29a] text-xs uppercase mb-2">Task 1: Somatic</p>
          <p className="text-sm">Box Breathing</p>
        </div>
        <div className="bg-black/20 p-4 rounded border border-white/5">
          <p className="text-[#818cf8] text-xs uppercase mb-2">Task 2: Cognitive</p>
          <p className="text-sm text-slate-300">100 - 7 = 93...</p>
        </div>
      </div>
      <button className="mt-6 px-6 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-xs transition-colors uppercase tracking-widest w-full">
        Begin Protocol
      </button>
    </div>
  );
}
