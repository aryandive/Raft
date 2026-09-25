"use client";

import { Compass, Info } from "lucide-react";

export default function GrowthMatrixPage() {
  return (
    <div className="min-h-screen p-6 lg:p-12 font-sans relative text-[#faf9f6]">
      <div className="max-w-4xl mx-auto mt-4 relative z-10">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-sm mb-4">
            <Compass size={12} className="text-[#81b29a] animate-spin" style={{ animationDuration: "6s" }} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#faf9f6]/60">Resilience Topology</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#faf9f6] mb-4 tracking-wide">
            Growth Matrix
          </h1>
          <p className="text-lg text-[#faf9f6]/60 font-light max-w-2xl">
            A topological visualization of your nervous system state dynamics over time. Identify key transition zones and stability nodes.
          </p>
        </div>

        {/* Matrix Visualization */}
        <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[380px] mb-8">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#81b29a]/5 blur-[120px] pointer-events-none rounded-full"></div>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-serif">State Transitions</h2>
              <p className="text-xs text-[#faf9f6]/40 font-light mt-1">Nodal trajectory map.</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#81b29a]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#81b29a] animate-pulse"></span>
              <span>12 Calibration Points Registered</span>
            </div>
          </div>

          {/* SVG Node Tree */}
          <div className="flex-1 w-full flex items-center justify-center my-6 relative min-h-[220px]">
            <svg width="100%" height="220" className="opacity-80">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#c4a97f" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#81b29a" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              {/* Connections */}
              <path d="M 150 180 Q 250 130 350 160 T 550 80" fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeDasharray="5 5" />
              <path d="M 150 180 Q 200 80 400 90 T 650 140" fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" />
              
              {/* Node circles */}
              <circle cx="150" cy="180" r="6" fill="#818cf8" className="animate-pulse" />
              <circle cx="350" cy="160" r="5" fill="#c4a97f" />
              <circle cx="550" cy="80" r="7" fill="#81b29a" />
              <circle cx="400" cy="90" r="5" fill="#e07a5f" />
              <circle cx="650" cy="140" r="6" fill="#faf9f6" />

              {/* Labels */}
              <text x="130" y="205" fill="#faf9f6" opacity="0.4" fontSize="10" fontFamily="monospace">Node A (Calibration)</text>
              <text x="330" y="140" fill="#faf9f6" opacity="0.4" fontSize="10" fontFamily="monospace">Node B (Override)</text>
              <text x="530" y="60" fill="#faf9f6" opacity="0.4" fontSize="10" fontFamily="monospace">Node C (Regulated)</text>
            </svg>
          </div>

          <div className="border-t border-white/5 pt-4 flex justify-between text-[11px] font-mono text-[#faf9f6]/40">
            <span>Grid Bounds: Stable Baseline</span>
            <span>Scale: Logarithmic</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-black/25 border border-white/5 rounded-2xl p-5 text-xs font-mono leading-relaxed text-[#faf9f6]/40 flex gap-3 items-start">
          <Info size={16} className="text-[#81b29a] shrink-0 mt-0.5" />
          <p>
            The Growth Matrix correlates your respiration logs, grounding sessions, and mood coordinates to build a multidimensional picture of autonomic regulation over time. Data is processed entirely inside the browser container using Web Crypto AES-GCM.
          </p>
        </div>
      </div>
    </div>
  );
}
