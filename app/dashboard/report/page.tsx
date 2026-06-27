"use client";

import { Activity, Clipboard, Share2, Info } from "lucide-react";

export default function ReportPage() {
  return (
    <div className="min-h-screen p-6 lg:p-12 font-sans relative text-[#faf9f6]">
      <div className="max-w-4xl mx-auto mt-4 relative z-10">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-sm mb-4">
            <Clipboard size={12} className="text-[#e07a5f]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#faf9f6]/60">Diagnostics & Audits</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#faf9f6] mb-4 tracking-wide">
            Clinical Summary
          </h1>
          <p className="text-lg text-[#faf9f6]/60 font-light max-w-2xl">
            Export structured metrics regarding vagal tone, respiration rate coherence, and mood valence distributions.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
            <span className="text-[10px] font-mono text-[#faf9f6]/40 uppercase tracking-wider block mb-2">Vagal Coherence Index</span>
            <div className="text-3xl font-serif text-[#81b29a] font-bold">88.4%</div>
            <p className="text-xs text-[#faf9f6]/40 font-light mt-2">Optimal range indicating active down-regulation capability.</p>
          </div>
          
          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
            <span className="text-[10px] font-mono text-[#faf9f6]/40 uppercase tracking-wider block mb-2">Dominant Quadrant</span>
            <div className="text-3xl font-serif text-[#faf9f6] font-bold">Positive / Low</div>
            <p className="text-xs text-[#faf9f6]/40 font-light mt-2">Corresponds to a calm, content state during daily logs.</p>
          </div>

          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
            <span className="text-[10px] font-mono text-[#faf9f6]/40 uppercase tracking-wider block mb-2">Grounding Efficiency</span>
            <div className="text-3xl font-serif text-[#818cf8] font-bold">12.5s cycle</div>
            <p className="text-xs text-[#faf9f6]/40 font-light mt-2">Mean breathing cycle length captured during active exercises.</p>
          </div>
        </div>

        {/* Report Card */}
        <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[220px] mb-8">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#e07a5f]/5 blur-[100px] pointer-events-none rounded-full"></div>
          
          <div>
            <h2 className="text-lg font-serif mb-2">Telemetry Archive</h2>
            <p className="text-xs text-[#faf9f6]/40 font-light leading-relaxed max-w-xl">
              Export your decrypted telemetry archive as standard JSON schema or PDF. Since Raft is strictly zero-knowledge, data stays local. You must decrypt it locally with your Master Recovery Key before printing or saving.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-mono text-xs uppercase tracking-widest text-[#faf9f6]/80 hover:text-white">
              <Activity size={12} />
              Export JSON Archive
            </button>
            <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#e07a5f]/10 text-[#e07a5f] border border-[#e07a5f]/20 hover:bg-[#e07a5f]/20 transition-all font-mono text-xs uppercase tracking-widest">
              <Share2 size={12} />
              Print Clinical PDF
            </button>
          </div>
        </div>

        {/* Warning Info */}
        <div className="bg-black/25 border border-white/5 rounded-2xl p-5 text-xs font-mono leading-relaxed text-[#faf9f6]/40 flex gap-3 items-start">
          <Info size={16} className="text-[#e07a5f] shrink-0 mt-0.5" />
          <p>
            Reports and diagnostics generated on this platform are for informational purposes only. Do not use these results to replace clinical counsel or diagnose medical disorders.
          </p>
        </div>
      </div>
    </div>
  );
}
