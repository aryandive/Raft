"use client";

import { AlertTriangle, Activity, BrainCircuit, ArrowRight, ShieldAlert } from "lucide-react";

export default function CurriculumPage() {
  return (
    <div className="min-h-screen p-6 lg:p-12 font-sans relative">
      <div className="max-w-4xl mx-auto mt-4 relative z-10">
        
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-[#faf9f6] mb-4 tracking-wide">
            The Core Foundation.
          </h1>
          <p className="text-lg text-[#faf9f6]/60 font-light max-w-2xl">
            Structured modules to regulate your nervous system. These are not quick fixes; they are clinical protocols translated for everyday resilience.
          </p>
        </div>

        {/* The Modules (Stacked Layout) */}
        <div className="space-y-8">
          
          {/* Module 1 */}
          <div className="relative bg-white/[0.02] backdrop-blur-xl border border-[#e07a5f]/10 hover:border-[#e07a5f]/30 rounded-3xl p-8 transition-colors group">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-full bg-[#e07a5f]/5 blur-[80px] pointer-events-none rounded-full group-hover:bg-[#e07a5f]/10 transition-colors"></div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#e07a5f]/10 text-[#e07a5f] flex items-center justify-center border border-[#e07a5f]/20 shadow-[0_0_20px_rgba(224,122,95,0.1)]">
                <AlertTriangle size={28} />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 text-[10px] uppercase tracking-widest bg-[#e07a5f]/10 text-[#e07a5f] rounded-full font-medium">Acute Stress</span>
                  <span className="px-3 py-1 text-[10px] uppercase tracking-widest bg-white/5 text-[#faf9f6]/60 rounded-full font-medium border border-white/5">Physiological</span>
                </div>
                
                <h2 className="text-2xl font-serif text-[#faf9f6] mb-3">Module 1: The Emergency Override</h2>
                <p className="text-[#faf9f6]/60 font-light leading-relaxed mb-8">
                  When your sympathetic nervous system is actively spiking, logic fails. This module trains you to use physical, body-first interventions (like mammalian dive reflex techniques and box breathing) to forcefully down-regulate your state before attempting cognitive work.
                </p>
                
                <button className="flex items-center gap-3 px-6 py-3 rounded-xl bg-[#e07a5f]/10 text-[#e07a5f] border border-[#e07a5f]/20 hover:bg-[#e07a5f]/20 transition-all font-medium text-sm group-hover:shadow-[0_0_15px_rgba(224,122,95,0.2)]">
                  Start Module
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Module 2 */}
          <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/5 hover:border-[#818cf8]/30 rounded-3xl p-8 transition-colors group opacity-80 hover:opacity-100">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-full bg-[#818cf8]/5 blur-[80px] pointer-events-none rounded-full group-hover:bg-[#818cf8]/10 transition-colors"></div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#818cf8]/10 text-[#818cf8] flex items-center justify-center border border-[#818cf8]/20">
                <Activity size={28} />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 text-[10px] uppercase tracking-widest bg-[#818cf8]/10 text-[#818cf8] rounded-full font-medium">Observability</span>
                  <span className="px-3 py-1 text-[10px] uppercase tracking-widest bg-white/5 text-[#faf9f6]/60 rounded-full font-medium border border-white/5">Data</span>
                </div>
                
                <h2 className="text-2xl font-serif text-[#faf9f6] mb-3">Module 2: The Telemetry Dashboard</h2>
                <p className="text-[#faf9f6]/60 font-light leading-relaxed mb-6">
                  You cannot fix a system you cannot see. Learn to track your baseline emotional state without judgment. This module establishes your personal Mood Matrix and teaches you how to identify leading indicators of burnout before it happens.
                </p>
              </div>
            </div>
          </div>

          {/* Module 3 */}
          <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/5 hover:border-[#c4a97f]/30 rounded-3xl p-8 transition-colors group opacity-60 hover:opacity-100">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-full bg-[#c4a97f]/5 blur-[80px] pointer-events-none rounded-full group-hover:bg-[#c4a97f]/10 transition-colors"></div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#c4a97f]/10 text-[#c4a97f] flex items-center justify-center border border-[#c4a97f]/20">
                <BrainCircuit size={28} />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 text-[10px] uppercase tracking-widest bg-[#c4a97f]/10 text-[#c4a97f] rounded-full font-medium">Burnout</span>
                  <span className="px-3 py-1 text-[10px] uppercase tracking-widest bg-white/5 text-[#faf9f6]/60 rounded-full font-medium border border-white/5">Restructuring</span>
                </div>
                
                <h2 className="text-2xl font-serif text-[#faf9f6] mb-3">Module 3: Cognitive Refactoring</h2>
                <p className="text-[#faf9f6]/60 font-light leading-relaxed mb-6">
                  Once the body is regulated and data is gathered, we target the software. This advanced module uses CBT-inspired frameworks to identify systemic stressors, establish boundaries, and refactor the neural pathways keeping you in a state of hyper-vigilance.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* The Disclaimer */}
        <div className="mt-20 pt-8 border-t border-white/5 flex gap-4 opacity-50 hover:opacity-100 transition-opacity max-w-2xl mx-auto">
          <ShieldAlert size={20} className="text-[#faf9f6]/40 shrink-0 mt-1" />
          <p className="text-xs text-[#faf9f6]/40 leading-relaxed font-light">
            Raft is strictly scoped to everyday resilience, burnout prevention, and nervous system regulation. It is not a clinical tool, and it is not designed for trauma processing, severe clinical depression, or acute insomnia.
          </p>
        </div>

      </div>
    </div>
  );
}
