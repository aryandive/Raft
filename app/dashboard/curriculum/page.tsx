"use client";

import React from 'react';
import { BoxBreathing } from '@/components/dashboard/BoxBreathing';
import { GroundingTool } from '@/components/dashboard/GroundingTool';

export default function CurriculumPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-mono p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Top Section */}
        <header className="w-full py-4 border-b border-white/10">
          <h1 className="text-sm font-semibold text-slate-100 tracking-widest uppercase">
            Active Protocols
          </h1>
          <p className="text-[10px] text-slate-500 mt-2 tracking-widest uppercase">
            Crisis Tools // Autonomic Regulation
          </p>
        </header>

        {/* Tools Section: Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          <section className="w-full h-full bg-[#0f172a]/50 rounded-xl p-4 md:p-6 border border-white/5 shadow-inner flex flex-col justify-center">
            <BoxBreathing />
          </section>

          <section className="w-full h-full bg-[#0f172a]/50 rounded-xl p-4 md:p-6 border border-white/5 shadow-inner flex flex-col justify-center">
            <GroundingTool />
          </section>

        </div>
        
      </div>
    </div>
  );
}
