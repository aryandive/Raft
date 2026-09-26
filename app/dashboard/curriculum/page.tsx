import React from 'react';
import { BoxBreathing } from '@/components/dashboard/BoxBreathing';
import { GroundingTool } from '@/components/dashboard/GroundingTool';
import { getAllCurriculumModules } from '@/lib/curriculum';
import { Brain } from 'lucide-react';
import { CurriculumHubView } from '@/components/dashboard/CurriculumHubView';

export default async function CurriculumPage() {
  const modules = await getAllCurriculumModules();

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-4 md:p-8 lg:p-12 relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#81b29a]/5 blur-[120px] pointer-events-none rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#818cf8]/5 blur-[100px] pointer-events-none rounded-full"></div>

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        
        {/* Header */}
        <header className="w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-sm mb-4">
            <Brain size={12} className="text-[#818cf8]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#faf9f6]/60">Nervous System Architecture</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#faf9f6] mb-4 tracking-wide">
            Clinical Curriculum & Growth Engine
          </h1>
          <p className="text-lg text-[#faf9f6]/60 font-light max-w-2xl leading-relaxed">
            Evidence-based autonomic regulation protocols spanning sleep, focus, acute stress, relationships, and affective agility.
          </p>
        </header>

        {/* Quick Active Somatic Tools Section */}
        <section className="w-full">
          <h2 className="text-xs font-semibold text-slate-300 tracking-widest uppercase mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e07a5f] animate-pulse"></span>
            Active Somatic Workstation
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="w-full h-full bg-black/20 rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl backdrop-blur-sm flex flex-col justify-center transform transition-all hover:border-white/10">
              <BoxBreathing />
            </div>
            <div className="w-full h-full bg-black/20 rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl backdrop-blur-sm flex flex-col justify-center transform transition-all hover:border-white/10">
              <GroundingTool />
            </div>
          </div>
        </section>

        {/* Multi-Track Curriculum Hub */}
        <section className="w-full">
          <CurriculumHubView modules={modules} />
        </section>

      </div>
    </div>
  );
}

