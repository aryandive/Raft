import React from 'react';
import { getCurriculumModuleBySlug } from '@/lib/curriculum';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { ArrowLeft, Brain, Compass, Clock, BookOpen } from 'lucide-react';

// Import all interactive components that can be used inside MDX
import { BoxBreathing } from '@/components/dashboard/BoxBreathing';
import { GroundingTool } from '@/components/dashboard/GroundingTool';
import { SomaticCheckIn } from '@/components/dashboard/SomaticCheckIn';
import { PhysiologicalSighTool } from '@/components/dashboard/PhysiologicalSighTool';
import { VaultReflection } from '@/components/dashboard/VaultReflection';
import { DualTaskProtocol } from '@/components/dashboard/DualTaskProtocol';

import { CurriculumWizard } from '@/components/dashboard/CurriculumWizard';

const components = {
  BoxBreathing,
  GroundingTool,
  SomaticCheckIn,
  PhysiologicalSighTool,
  VaultReflection,
  DualTaskProtocol,
  h1: (props: any) => <h1 className="text-3xl md:text-4xl font-serif text-[#faf9f6] mt-4 mb-6" {...props} />,
  h2: (props: any) => <h2 className="text-2xl font-serif text-[#faf9f6] mt-6 mb-4" {...props} />,
  h3: (props: any) => <h3 className="text-lg font-semibold text-[#818cf8] mt-2 mb-6 tracking-wide uppercase border-b border-white/10 pb-4 inline-block" {...props} />,
  p: (props: any) => <p className="text-base text-slate-300 leading-relaxed mb-6 font-light" {...props} />,
  strong: (props: any) => <strong className="font-semibold text-slate-100" {...props} />,
};

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function CurriculumModulePage({ params }: PageProps) {
  const moduleData = await getCurriculumModuleBySlug(params.slug);

  if (!moduleData) {
    notFound();
  }

  const { meta, content } = moduleData;

  // Split MDX by '### Step' to create wizard pages. 
  // We use lookahead so the '### Step' heading stays with the chunk.
  const rawSteps = content.split(/(?=###\s+Step)/i).filter(step => step.trim().length > 0);

  const renderedSteps = rawSteps.map((stepContent, index) => (
    <article key={index} className="prose prose-invert prose-slate max-w-none w-full">
      <MDXRemote source={stepContent} components={components} />
    </article>
  ));

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#faf9f6] font-sans p-4 md:p-8 relative">
      <div className="max-w-4xl mx-auto relative z-10 pt-4 pb-12 flex flex-col min-h-screen">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/dashboard/curriculum" className="inline-flex items-center text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft size={14} className="mr-2" />
            Back to Hub
          </Link>
        </div>

        {/* Module Header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.03] border border-white/10">
              <Brain size={12} className="text-[#818cf8]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                {meta.trackId && meta.trackId !== 'foundation' ? meta.trackTitle || meta.trackId : `Layer ${meta.layerIndex}`}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.03] border border-white/10">
              <Compass size={12} className="text-[#e07a5f]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{meta.targetQuadrant}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.03] border border-white/10">
              <Clock size={12} className="text-[#81b29a]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{meta.durationMinutes} MIN</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif tracking-wide mb-4">
            {meta.title}
          </h1>
        </header>

        {/* Interactive Wizard */}
        <div className="flex-1 w-full">
          <CurriculumWizard steps={renderedSteps} meta={meta} />
        </div>
        
      </div>
    </div>
  );
}
