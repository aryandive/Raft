"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Wind, ArrowLeft, Timer, Activity, BrainCircuit, AlertTriangle } from "lucide-react";
import Link from "next/link";


export default function LibraryPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("raft-theme");
    if (saved === "dark") {
      setIsDarkMode(true);
    } else if (saved === "light") {
      setIsDarkMode(false);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => setIsDarkMode((prev) => {
    const next = !prev;
    localStorage.setItem("raft-theme", next ? "dark" : "light");
    return next;
  });

  const theme = {
    bg: isDarkMode ? "bg-[#0f172a]" : "bg-[#faf9f6]",
    textPrimary: isDarkMode ? "text-slate-100" : "text-slate-900",
    textSecondary: isDarkMode ? "text-slate-400" : "text-slate-600",
    navBg: isDarkMode ? "bg-[#0f172a]/80 border-slate-800" : "bg-[#faf9f6]/80 border-slate-200",
    cardBg: isDarkMode ? "bg-[#1e293b]/60 border-slate-800" : "bg-white/80 border-slate-200",
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out ${theme.bg} ${theme.textPrimary} font-sans`}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Inter:wght@300;400;500;600&display=swap');
        h1, h2, h3, .font-serif { font-family: 'Playfair Display', serif; }
        p, span, button, a, li { font-family: 'Inter', sans-serif; }
      `}} />

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 px-6 py-4 flex justify-between items-center backdrop-blur-md border-b ${theme.navBg}`}>
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#818cf8] to-[#81b29a] text-white shadow-sm">
            <Wind size={18} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-serif font-bold tracking-tight">Raft</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className={`hidden sm:flex items-center gap-2 text-sm font-medium ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <button onClick={toggleTheme} className={`p-2.5 rounded-full backdrop-blur-sm border ${isDarkMode ? 'border-slate-800' : 'border-slate-300'} hover:scale-105 transition-transform`}>
            {isDarkMode ? <Sun size={18} className="text-[#c4a97f]" /> : <Moon size={18} className="text-[#0f172a]" />}
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        {/* SECTION 1: The Header */}
        <header className="mb-20 text-center md:text-left">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} text-xs font-medium uppercase tracking-widest ${theme.textSecondary} mb-6 shadow-sm`}>
            Curriculum
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">The Core Foundation.</h1>
          <p className={`text-xl ${theme.textSecondary} leading-relaxed font-light max-w-3xl`}>
            We don&apos;t offer endless scrolling content. We offer three highly targeted, actionable modules designed to regulate your nervous system and build long-term resilience.
          </p>
        </header>

        {/* SECTION 2: The Modules (Stacked Layout) */}
        <section className="space-y-12">
          
          {/* Module 1 */}
          <div className={`p-8 md:p-12 rounded-[2rem] backdrop-blur-xl border ${theme.cardBg} shadow-sm relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#81b29a]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="flex flex-col md:flex-row gap-8 relative z-10">
              <div className="shrink-0 flex flex-col items-start md:items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#81b29a]/20 text-[#81b29a] flex items-center justify-center mb-4">
                  <Timer size={32} />
                </div>
                <span className={`text-sm font-bold tracking-widest uppercase text-[#81b29a]`}>Module 1</span>
              </div>
              <div>
                <h2 className="text-3xl font-serif font-bold mb-3">The Emergency Override</h2>
                <div className={`inline-flex px-3 py-1 rounded bg-slate-200 dark:bg-slate-800 text-xs font-semibold uppercase tracking-widest ${theme.textSecondary} mb-6`}>
                  Focus: Acute Stress Response
                </div>
                <div className={`space-y-4 ${theme.textSecondary} leading-relaxed`}>
                  <p>When the amygdala hijacks your brain, logic fails. This module trains your physiology directly.</p>
                  <ul className="space-y-3 mt-4">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#81b29a] mt-2 shrink-0"></div>
                      <span><strong>Box Breathing:</strong> Symmetrical respiration to down-regulate the sympathetic nervous system.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#81b29a] mt-2 shrink-0"></div>
                      <span><strong>5-4-3-2-1 Sensory Grounding:</strong> Immediate tethering to the physical environment.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#81b29a] mt-2 shrink-0"></div>
                      <span><strong>Mammalian Dive Reflex Timers:</strong> Temperature and breath control to force a parasympathetic state.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Module 2 */}
          <div className={`p-8 md:p-12 rounded-[2rem] backdrop-blur-xl border ${theme.cardBg} shadow-sm relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#e07a5f]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="flex flex-col md:flex-row gap-8 relative z-10">
              <div className="shrink-0 flex flex-col items-start md:items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#e07a5f]/20 text-[#e07a5f] flex items-center justify-center mb-4">
                  <Activity size={32} />
                </div>
                <span className={`text-sm font-bold tracking-widest uppercase text-[#e07a5f]`}>Module 2</span>
              </div>
              <div>
                <h2 className="text-3xl font-serif font-bold mb-3">The Telemetry Dashboard</h2>
                <div className={`inline-flex px-3 py-1 rounded bg-slate-200 dark:bg-slate-800 text-xs font-semibold uppercase tracking-widest ${theme.textSecondary} mb-6`}>
                  Focus: Observability & Logging
                </div>
                <div className={`space-y-4 ${theme.textSecondary} leading-relaxed`}>
                  <p>You cannot fix what you cannot observe. Treat your emotions like data to identify triggers and patterns over time.</p>
                  <ul className="space-y-3 mt-4">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#e07a5f] mt-2 shrink-0"></div>
                      <span><strong>Arousal vs. Valence Plotting:</strong> A robust 2D matrix moving beyond simplistic &ldquo;good&rdquo; or &ldquo;bad&rdquo; mood tracking.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#e07a5f] mt-2 shrink-0"></div>
                      <span><strong>Cryptographic Brain Dumps:</strong> Zero-knowledge, client-side encrypted spaces to unload cognitive burdens securely.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Module 3 */}
          <div className={`p-8 md:p-12 rounded-[2rem] backdrop-blur-xl border ${theme.cardBg} shadow-sm relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#818cf8]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="flex flex-col md:flex-row gap-8 relative z-10">
              <div className="shrink-0 flex flex-col items-start md:items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#818cf8]/20 text-[#818cf8] flex items-center justify-center mb-4">
                  <BrainCircuit size={32} />
                </div>
                <span className={`text-sm font-bold tracking-widest uppercase text-[#818cf8]`}>Module 3</span>
              </div>
              <div>
                <h2 className="text-3xl font-serif font-bold mb-3">Cognitive Refactoring</h2>
                <div className={`inline-flex px-3 py-1 rounded bg-slate-200 dark:bg-slate-800 text-xs font-semibold uppercase tracking-widest ${theme.textSecondary} mb-6`}>
                  Focus: Dealing with Burnout
                </div>
                <div className={`space-y-4 ${theme.textSecondary} leading-relaxed`}>
                  <p>Re-write the mental pathways that lead to catastrophic thinking and energy depletion.</p>
                  <ul className="space-y-3 mt-4">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#818cf8] mt-2 shrink-0"></div>
                      <span><strong>Cognitive Distortions Text-Parser:</strong> Learn to identify &ldquo;all-or-nothing&rdquo; and &ldquo;mind-reading&rdquo; biases in your own logic.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#818cf8] mt-2 shrink-0"></div>
                      <span><strong>Minimum Viable Day Builder:</strong> A framework for surviving burnout phases by cutting non-essential operations.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* SECTION 3: Out of Scope */}
        <section className="mt-24 pt-12 border-t border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center mb-4">
              <AlertTriangle size={18} />
            </div>
            <h3 className={`text-sm font-bold mb-3 uppercase tracking-widest ${theme.textSecondary}`}>What we strictly avoid.</h3>
            <p className={`text-sm ${theme.textSecondary} leading-relaxed max-w-xl`}>
              To ensure your safety, Raft is not designed for trauma processing (PTSD), clinical insomnia, or addiction recovery. If you are experiencing these, please consult a licensed clinical professional.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
