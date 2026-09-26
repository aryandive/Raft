'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Moon, 
  Briefcase, 
  Flame, 
  Users, 
  HeartHandshake, 
  Zap, 
  Sparkles, 
  Unlock, 
  Lock, 
  ArrowRight, 
  Clock, 
  Compass, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { CurriculumModuleMeta } from '@/content/curriculum/schema';
import { TrackDefinition, CURRICULUM_TRACKS } from '@/lib/curriculum-tracks';

interface CurriculumHubViewProps {
  modules: CurriculumModuleMeta[];
}

const TRACK_ICONS: Record<string, React.ReactNode> = {
  all: <Sparkles size={14} />,
  foundation: <Brain size={14} />,
  sleep: <Moon size={14} />,
  work: <Briefcase size={14} />,
  stress: <Flame size={14} />,
  relationships: <Users size={14} />,
  emotions: <HeartHandshake size={14} />,
  habits: <Zap size={14} />,
};

const TRACK_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  foundation: { border: 'border-[#81b29a]/40', bg: 'bg-[#81b29a]/10', text: 'text-[#81b29a]' },
  sleep: { border: 'border-[#38bdf8]/40', bg: 'bg-[#38bdf8]/10', text: 'text-[#38bdf8]' },
  work: { border: 'border-[#f59e0b]/40', bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
  stress: { border: 'border-[#e07a5f]/40', bg: 'bg-[#e07a5f]/10', text: 'text-[#e07a5f]' },
  relationships: { border: 'border-[#ec4899]/40', bg: 'bg-[#ec4899]/10', text: 'text-[#ec4899]' },
  emotions: { border: 'border-[#a855f7]/40', bg: 'bg-[#a855f7]/10', text: 'text-[#a855f7]' },
  habits: { border: 'border-[#10b981]/40', bg: 'bg-[#10b981]/10', text: 'text-[#10b981]' },
};

export function CurriculumHubView({ modules }: CurriculumHubViewProps) {
  const [selectedTrack, setSelectedTrack] = useState<string>('all');

  // Filter modules
  const filteredModules = useMemo(() => {
    if (selectedTrack === 'all') return modules;
    return modules.filter((m) => (m.trackId || 'foundation') === selectedTrack);
  }, [modules, selectedTrack]);

  // Group modules by track or layer
  const groupedModules = useMemo(() => {
    const groups: Record<string, { title: string; trackId: string; modules: CurriculumModuleMeta[] }> = {};

    filteredModules.forEach((mod) => {
      const trackId = mod.trackId || 'foundation';
      const trackTitle = mod.trackTitle || 'Autonomic Foundations';
      const key = selectedTrack === 'foundation' ? `Layer ${mod.layerIndex}: ${mod.layerTitle}` : trackTitle;

      if (!groups[key]) {
        groups[key] = {
          title: key,
          trackId: trackId,
          modules: [],
        };
      }
      groups[key].modules.push(mod);
    });

    return Object.values(groups);
  }, [filteredModules, selectedTrack]);

  const activeTrackMeta = CURRICULUM_TRACKS.find(t => t.id === selectedTrack) || CURRICULUM_TRACKS[0];

  return (
    <div className="space-y-12">
      {/* SOS Acute Interventions Bar */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-indigo-500/10 p-5 md:p-6 backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#e07a5f]">
              <AlertCircle size={14} className="text-[#e07a5f]" />
              <span>In-the-Moment Physiological Support</span>
            </div>
            <h3 className="text-xl font-serif text-[#faf9f6]">Acute Nervous System Reset</h3>
            <p className="text-xs text-slate-400 font-light max-w-xl">
              Experiencing acute overload, sleeplessness, or conflict right now? Launch these targeted somatic resets instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link 
              href="/dashboard/curriculum/acute-allostatic-downshift" 
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#e07a5f]/20 border border-white/10 hover:border-[#e07a5f]/40 text-xs text-slate-200 hover:text-white flex items-center gap-1.5 transition-all transform-gpu hover:scale-[1.02] active:scale-95 duration-200"
            >
              <Flame size={12} className="text-[#e07a5f]" />
              <span>Acute Panic / Stress</span>
            </Link>
            <Link 
              href="/dashboard/curriculum/circadian-hyperarousal-reset" 
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#38bdf8]/20 border border-white/10 hover:border-[#38bdf8]/40 text-xs text-slate-200 hover:text-white flex items-center gap-1.5 transition-all transform-gpu hover:scale-[1.02] active:scale-95 duration-200"
            >
              <Moon size={12} className="text-[#38bdf8]" />
              <span>2 AM Sleeplessness</span>
            </Link>
            <Link 
              href="/dashboard/curriculum/ultradian-focus-decoupling" 
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#f59e0b]/20 border border-white/10 hover:border-[#f59e0b]/40 text-xs text-slate-200 hover:text-white flex items-center gap-1.5 transition-all transform-gpu hover:scale-[1.02] active:scale-95 duration-200"
            >
              <Briefcase size={12} className="text-[#f59e0b]" />
              <span>Post-Work Detach</span>
            </Link>
            <Link 
              href="/dashboard/curriculum/conflict-co-regulation" 
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#ec4899]/20 border border-white/10 hover:border-[#ec4899]/40 text-xs text-slate-200 hover:text-white flex items-center gap-1.5 transition-all transform-gpu hover:scale-[1.02] active:scale-95 duration-200"
            >
              <Users size={12} className="text-[#ec4899]" />
              <span>Pre-Conflict Calm</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Track Filter Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-300 tracking-widest uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]"></span>
            Clinical Domains & Tracks
          </h2>
          <span className="text-xs font-mono text-slate-500">
            {filteredModules.length} Protocol{filteredModules.length === 1 ? '' : 's'} Available
          </span>
        </div>

        {/* Scrollable Track Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CURRICULUM_TRACKS.map((track) => {
            const isSelected = selectedTrack === track.id;
            const count = track.id === 'all' 
              ? modules.length 
              : modules.filter(m => (m.trackId || 'foundation') === track.id).length;

            return (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                key={track.id}
                onClick={() => setSelectedTrack(track.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 border transform-gpu ${
                  isSelected
                    ? 'bg-white/10 border-white/30 text-white shadow-lg'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
                }`}
              >
                <span className={isSelected ? 'text-[#818cf8]' : 'text-slate-500'}>
                  {TRACK_ICONS[track.id] || <Sparkles size={14} />}
                </span>
                <span>{track.shortTitle}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Active Track Description */}
        <div className="text-xs text-slate-400 font-light flex items-center gap-2 pt-1">
          <span className="text-slate-500">Focus:</span>
          <span>{activeTrackMeta.description}</span>
        </div>
      </div>

      {/* Modules List Display */}
      <div className="space-y-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTrack}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-12"
          >
            {groupedModules.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                <p className="text-slate-400 text-sm">No protocols found in this track yet.</p>
              </div>
            ) : (
              groupedModules.map((group, groupIdx) => {
                const colorConfig = TRACK_COLORS[group.trackId] || TRACK_COLORS.foundation;

                return (
                  <div key={groupIdx} className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <div className={`p-1.5 rounded-lg border ${colorConfig.border} ${colorConfig.bg}`}>
                        {TRACK_ICONS[group.trackId] || <Brain size={16} />}
                      </div>
                      <h3 className="text-xl font-serif text-[#faf9f6] tracking-wide">
                        {group.title}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {group.modules.map((mod) => {
                        const isUnlocked = true; // Unlocked for user testing
                        const modColor = TRACK_COLORS[mod.trackId || 'foundation'] || TRACK_COLORS.foundation;

                        return (
                          <Link
                            key={mod.slug}
                            href={`/dashboard/curriculum/${mod.slug}`}
                            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                              isUnlocked 
                                ? 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04] hover:border-[#818cf8]/50 cursor-pointer shadow-sm hover:shadow-xl' 
                                : 'bg-black/20 border-white/5 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="p-6 relative z-10 flex flex-col h-full">
                              {/* Top Bar: Track & Status */}
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${modColor.border} ${modColor.bg} ${modColor.text}`}>
                                    {mod.trackTitle || 'Foundation'}
                                  </span>
                                  {mod.difficulty && (
                                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                                      • {mod.difficulty}
                                    </span>
                                  )}
                                </div>
                                {isUnlocked ? (
                                  <div className="flex items-center gap-1 text-[11px] font-mono text-[#81b29a] bg-[#81b29a]/10 px-2 py-0.5 rounded border border-[#81b29a]/20">
                                    <Unlock size={12} />
                                    <span>Ready</span>
                                  </div>
                                ) : (
                                  <Lock size={14} className="text-white/20" />
                                )}
                              </div>

                              {/* Title & Summary */}
                              <h4 className="text-lg font-medium text-slate-100 group-hover:text-white transition-colors mb-2">
                                {mod.title}
                              </h4>
                              
                              <p className="text-xs text-slate-400 mb-6 font-light line-clamp-2 leading-relaxed">
                                {mod.summary || `Target state: ${mod.targetQuadrant}. Clinically anchored protocol.`}
                              </p>

                              {/* Footer Metadata */}
                              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {mod.durationMinutes} MIN
                                  </span>
                                  <span className="flex items-center gap-1 text-slate-400">
                                    <Compass size={12} className="text-[#818cf8]" />
                                    {mod.targetQuadrant}
                                  </span>
                                </div>
                                <span className={`flex items-center gap-1 transition-colors ${isUnlocked ? 'group-hover:text-[#818cf8]' : ''}`}>
                                  <span>Start</span>
                                  <ArrowRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                                </span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
