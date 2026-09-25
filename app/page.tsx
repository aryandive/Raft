"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Wind, Timer, Activity, Shield, Lock, BookOpen, Leaf, Eye, Database, CloudOff, RefreshCw, Check, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function RaftLandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [breatheState, setBreatheState] = useState("Inhale");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("raft-theme");
    if (saved === "dark") {
      setIsDarkMode(true);
    } else if (saved === "light") {
      setIsDarkMode(false);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const runCycle = async () => {
      while (isMounted) {
        setBreatheState("Inhale");
        await new Promise((r) => setTimeout(r, 4000));
        if (!isMounted) break;

        setBreatheState("Hold");
        await new Promise((r) => setTimeout(r, 4000));
        if (!isMounted) break;

        setBreatheState("Exhale");
        await new Promise((r) => setTimeout(r, 8000));
        if (!isMounted) break;

        setBreatheState("Hold");
        await new Promise((r) => setTimeout(r, 4000));
      }
    };

    runCycle();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTheme = () => setIsDarkMode((prev) => {
    const next = !prev;
    localStorage.setItem("raft-theme", next ? "dark" : "light");
    return next;
  });

  // Theme configuration based on strict constraints
  const theme = {
    bg: isDarkMode ? "bg-[#0f172a]" : "bg-[#faf9f6]",
    textPrimary: isDarkMode ? "text-slate-100" : "text-slate-900",
    textSecondary: isDarkMode ? "text-slate-300" : "text-slate-600",
    navBg: scrolled
      ? isDarkMode
        ? "bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800"
        : "bg-[#faf9f6]/80 backdrop-blur-md border-b border-slate-200"
      : "bg-transparent border-b border-transparent",
    accentGold: "text-[#c4a97f]",
    accentTerracotta: "bg-[#e07a5f]",
    cardBg: isDarkMode ? "bg-[#1e293b]/60" : "bg-white/60",
    cardBorder: isDarkMode ? "border-slate-800" : "border-slate-200",
    orb: isDarkMode ? "bg-[#818cf8]" : "bg-[#81b29a]",
    buttonSecondary: isDarkMode
      ? "border-slate-700 hover:bg-white/5"
      : "border-slate-300 hover:bg-black/5",
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-700 ease-in-out ${theme.bg} ${theme.textPrimary} font-sans`}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Inter:wght@300;400;500;600&display=swap');
        
        h1, h2, h3, .font-serif { font-family: 'Playfair Display', serif; }
        p, span, button, a { font-family: 'Inter', sans-serif; }
      `}} />

      {/* SECTION 1: Enhanced Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 px-6 py-4 flex justify-between items-center ${theme.navBg}`}
      >
        {/* Left: Logo & Icon */}
        <div className="flex items-center gap-3 cursor-pointer">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className={`w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#818cf8] to-[#81b29a] text-white shadow-sm`}
          >
            <Wind size={18} strokeWidth={2.5} />
          </motion.div>
          <span className="text-2xl font-serif font-bold tracking-tight">
            Raft
          </span>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex gap-8 text-sm font-medium">
          {[
            { label: "Privacy", href: "/privacy" },
            { label: "Pricing", href: "#pricing" },
            { label: "FAQ", href: "#faq" },
            { label: "The Curriculum", href: "/library" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className={`relative ${theme.textSecondary} transition-colors group`}
            >
              <span className={`group-hover:${isDarkMode ? "text-white" : "text-slate-900"} transition-colors`}>{label}</span>
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#c4a97f] group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-full backdrop-blur-sm border ${theme.cardBorder} hover:scale-105 transition-transform`}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <Sun size={18} className="text-[#c4a97f]" />
            ) : (
              <Moon size={18} className="text-[#0f172a]" />
            )}
          </button>

          <Link href="/onboarding/calibration">
            <button
              className={`hidden md:block bg-[#e07a5f] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#d0694e] transition-colors shadow-sm`}
            >
              Access Your Space
            </button>
          </Link>
        </div>
      </nav>

      {/* SECTION 2: The Hero Section */}
      <main className="relative pt-32 pb-24 px-6 overflow-hidden min-h-screen flex items-center">
        {/* Very subtle ambient background blur for vibe */}
        <div
          className={`absolute top-[10%] left-[5%] w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-[0.15] pointer-events-none ${
            isDarkMode ? "bg-[#818cf8]" : "bg-[#81b29a]"
          }`}
        ></div>
        <div
          className={`absolute bottom-[10%] right-[5%] w-[35vw] h-[35vw] rounded-full blur-[120px] opacity-[0.1] pointer-events-none bg-[#c4a97f]`}
        ></div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side (Copy) */}
          <div className="flex flex-col items-start lg:pr-12">
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md border ${theme.cardBorder} text-sm font-medium ${theme.textSecondary} mb-8`}
            >
              <span className="w-2 h-2 rounded-full bg-[#81b29a] animate-pulse"></span>
              A carefully crafted space for your mind.
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 font-serif">
              Your mental <br />
              <span className="italic font-normal">health matters.</span>
            </h1>

            <p
              className={`text-lg md:text-xl ${theme.textSecondary} mb-10 max-w-xl leading-relaxed font-light`}
            >
              A secure, private sanctuary offering interactive grounding tools,
              guided journaling, and patterns of resilience. Designed to support
              you on your own terms.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/onboarding/calibration">
                <button
                  className={`flex items-center justify-center bg-[#e07a5f] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#d0694e] transition-colors shadow-md`}
                >
                  Begin Your Journey
                </button>
              </Link>
              <Link href="/library" passHref>
                <button
                  className={`flex items-center justify-center backdrop-blur-sm border ${theme.buttonSecondary} ${theme.textPrimary} px-8 py-3.5 rounded-full font-medium transition-colors`}
                >
                  Browse the Library
                </button>
              </Link>
            </div>
          </div>

          {/* Right Side (The Grounding Sandbox) */}
          <div className="relative flex justify-center items-center w-full min-h-[450px] lg:min-h-[550px]">
            <div
              className={`w-full max-w-md aspect-square ${theme.cardBg} backdrop-blur-xl rounded-[2.5rem] shadow-2xl border ${theme.cardBorder} overflow-hidden relative flex items-center justify-center`}
            >
              <div className="absolute top-6 left-8 opacity-80">
                <p
                  className={`text-xs font-semibold ${theme.textSecondary} tracking-widest uppercase`}
                >
                  Grounding Sandbox
                </p>
              </div>

              {/* The Breathing Interactive Area */}
              <div className="relative flex items-center justify-center w-full h-full">
                {/* Expanding Orb synchronized with framer-motion */}
                <motion.div
                  animate={{
                    scale: [1, 1.6, 1.6, 1, 1],
                    opacity: [0.4, 0.8, 0.8, 0.4, 0.4],
                    filter: [
                      "blur(8px)",
                      "blur(0px)",
                      "blur(0px)",
                      "blur(8px)",
                      "blur(8px)",
                    ],
                  }}
                  transition={{
                    duration: 20,
                    times: [0, 0.2, 0.4, 0.8, 1],
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`absolute w-32 h-32 rounded-full ${theme.orb}`}
                ></motion.div>

                {/* Center text block */}
                <div
                  className={`z-10 w-32 h-32 rounded-full ${
                    isDarkMode ? "bg-[#0f172a]" : "bg-[#faf9f6]"
                  } flex items-center justify-center shadow-lg border ${theme.cardBorder}`}
                >
                  <motion.span
                    key={breatheState}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.5 }}
                    className={`text-xl font-serif italic ${theme.textPrimary}`}
                  >
                    {breatheState}
                  </motion.span>
                </div>
              </div>

              <div className="absolute bottom-8 w-full text-center px-8">
                <p
                  className={`text-sm ${theme.textSecondary} font-light leading-relaxed`}
                >
                  Take a moment. Sync your breath with the expanding circle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SECTION 3: The Problem Statement */}
      <section className="relative py-32 px-6 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-16 leading-tight">
            Modern stress isn&apos;t just mental.<br />
            <span className="italic font-normal text-[#e07a5f]">It&apos;s systemic.</span>
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {["Constant overstimulation", "Productivity guilt", "Anxiety spikes", "Burnout cycles"].map((symptom, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`p-6 rounded-2xl ${theme.cardBg} backdrop-blur-md border ${theme.cardBorder} flex flex-col items-center justify-center gap-3 shadow-sm cursor-default`}
            >
              <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-[#c4a97f]' : 'bg-[#81b29a]'} animate-pulse`}></div>
              <span className={`text-sm font-medium ${theme.textSecondary} text-center`}>{symptom}</span>
            </motion.div>
          ))}
        </div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          viewport={{ once: true }}
          className={`text-xl md:text-2xl ${theme.textSecondary} max-w-3xl mx-auto leading-relaxed font-light`}
        >
          Most mental wellness apps are optimized for engagement — not recovery. Raft was designed differently: <span className={`font-medium ${theme.textPrimary}`}>calm interfaces, actionable tools, and complete privacy.</span>
        </motion.p>
      </section>

      {/* SECTION 4: The Features */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col gap-32">
          
          {/* Feature 1: Emergency Override */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              viewport={{ once: true }}
              className="order-2 lg:order-1 flex flex-col items-start lg:pr-12"
            >
              <div className={`w-12 h-12 rounded-xl bg-[#81b29a]/20 flex items-center justify-center mb-6 text-[#81b29a]`}>
                <Timer size={24} />
              </div>
              <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">Interrupt panic before it spirals.</h3>
              <p className={`text-lg ${theme.textSecondary} leading-relaxed`}>
                Interactive grounding tools designed to regulate acute stress responses using physiological techniques.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              className="order-1 lg:order-2 relative h-[400px] flex items-center justify-center"
            >
              <div className={`w-full max-w-sm p-8 rounded-[2rem] ${theme.cardBg} backdrop-blur-xl border ${theme.cardBorder} shadow-xl relative overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#81b29a] to-transparent"></div>
                <p className={`text-xs font-semibold ${theme.textSecondary} tracking-widest uppercase mb-8 text-center`}>Cold Shock Reset</p>
                <div className="flex justify-center mb-8">
                  <div className={`w-32 h-32 rounded-full border-4 border-[#81b29a]/30 flex items-center justify-center relative`}>
                    <div className={`absolute inset-0 rounded-full border-4 border-[#81b29a] border-t-transparent animate-spin`} style={{ animationDuration: '3s' }}></div>
                    <span className="text-4xl font-light font-serif">5</span>
                  </div>
                </div>
                <div className={`h-12 w-full rounded-xl bg-[#81b29a]/10 flex items-center justify-center`}>
                  <span className="text-sm font-medium text-[#81b29a]">Breathe in slowly</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature 2: The Mood Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              className="order-1 lg:order-1 relative h-[400px] flex items-center justify-center"
            >
              <div className={`w-full max-w-sm aspect-square p-8 rounded-[2rem] ${theme.cardBg} backdrop-blur-xl border ${theme.cardBorder} shadow-xl flex flex-col`}>
                <p className={`text-xs font-semibold ${theme.textSecondary} tracking-widest uppercase mb-6`}>Mood Matrix</p>
                <div className={`flex-1 relative border-l border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-300'} mt-4 ml-4`}>
                  <span className={`absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] ${theme.textSecondary} tracking-widest uppercase`}>Energy</span>
                  <span className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] ${theme.textSecondary} tracking-widest uppercase`}>Valence</span>
                  
                  <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className={`border-r border-t ${isDarkMode ? 'border-slate-800/50' : 'border-slate-200'}`}></div>
                    ))}
                  </div>
                  <div className="absolute w-3 h-3 rounded-full bg-[#e07a5f] shadow-[0_0_10px_rgba(224,122,95,0.6)] top-[20%] left-[30%]"></div>
                  <div className="absolute w-3 h-3 rounded-full bg-[#818cf8] shadow-[0_0_10px_rgba(129,140,248,0.6)] top-[60%] left-[70%]"></div>
                  <div className="absolute w-4 h-4 rounded-full bg-[#c4a97f] shadow-[0_0_15px_rgba(196,169,127,0.6)] top-[40%] left-[50%] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute w-2 h-2 rounded-full bg-[#81b29a] top-[80%] left-[20%] opacity-50"></div>
                  <div className="absolute w-2 h-2 rounded-full bg-[#818cf8] top-[30%] left-[80%] opacity-50"></div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              viewport={{ once: true }}
              className="order-2 lg:order-2 flex flex-col items-start lg:pl-12"
            >
              <div className={`w-12 h-12 rounded-xl bg-[#818cf8]/20 flex items-center justify-center mb-6 text-[#818cf8]`}>
                <Activity size={24} />
              </div>
              <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">Track emotions like data, not guesses.</h3>
              <p className={`text-lg ${theme.textSecondary} leading-relaxed`}>
                Replace vague mood scores with a 2D emotional observability system mapping energy against emotional valence.
              </p>
            </motion.div>
          </div>

          {/* Feature 3: Encrypted Journal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 flex flex-col items-start lg:pr-12">
              <div className={`w-12 h-12 rounded-xl bg-[#c4a97f]/20 flex items-center justify-center mb-6 text-[#c4a97f]`}>
                <Shield size={24} />
              </div>
              <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">Your thoughts stay yours.</h3>
              <p className={`text-lg ${theme.textSecondary} leading-relaxed`}>
                All journal entries are encrypted client-side using AES-256 before storage. Even administrators cannot read your data.
              </p>
            </div>
            <div className="order-1 lg:order-2 relative h-[400px] flex items-center justify-center">
              <div className={`w-full max-w-sm p-6 rounded-[2rem] ${theme.cardBg} backdrop-blur-xl border ${theme.cardBorder} shadow-xl relative overflow-hidden flex flex-col h-full`}>
                <div className={`flex justify-between items-center mb-6 pb-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                  <p className={`text-xs font-semibold ${theme.textSecondary} tracking-widest uppercase`}>Daily Log</p>
                  <Lock size={14} className="text-[#c4a97f]" />
                </div>
                <div className="flex-1 relative">
                  <div className={`space-y-4 opacity-30 blur-[3px] pointer-events-none`}>
                    <div className={`h-3 w-3/4 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'} rounded`}></div>
                    <div className={`h-3 w-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'} rounded`}></div>
                    <div className={`h-3 w-5/6 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'} rounded`}></div>
                    <div className={`h-3 w-4/6 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'} rounded`}></div>
                  </div>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#c4a97f]/10 backdrop-blur-md flex items-center justify-center border border-[#c4a97f]/30 mb-4 shadow-lg">
                      <Shield size={28} className="text-[#c4a97f]" />
                    </div>
                    <span className={`text-sm font-medium ${theme.textPrimary}`}>Client-Side Encrypted</span>
                    <span className={`text-xs ${theme.textSecondary} mt-1`}>AES-256</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Guided Resilience Courses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-1 lg:order-1 relative h-[400px] flex items-center justify-center">
              <div className={`w-full max-w-sm p-6 rounded-[2rem] ${theme.cardBg} backdrop-blur-xl border ${theme.cardBorder} shadow-xl flex flex-col gap-4`}>
                <p className={`text-xs font-semibold ${theme.textSecondary} tracking-widest uppercase mb-2`}>Active Modules</p>
                
                <div className={`p-4 rounded-xl border border-[#e07a5f]/30 bg-[#e07a5f]/5 relative overflow-hidden`}>
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e07a5f]"></div>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className={`text-sm font-medium ${theme.textPrimary}`}>Module 1: The Hardware Reset</h4>
                    <span className={`text-[10px] px-2 py-1 rounded bg-[#e07a5f]/20 text-[#e07a5f] font-bold tracking-wider`}>IN PROGRESS</span>
                  </div>
                  <div className={`w-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} h-1.5 rounded-full overflow-hidden`}>
                    <div className="bg-[#e07a5f] h-full w-[60%] rounded-full"></div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${theme.cardBorder} opacity-60 flex items-center gap-4`}>
                  <div className={`w-8 h-8 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} flex items-center justify-center`}>
                    <Lock size={12} className={theme.textSecondary} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${theme.textPrimary}`}>Module 2: Cognitive Reframing</h4>
                    <span className={`text-xs ${theme.textSecondary}`}>Unlocks upon completion</span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${theme.cardBorder} opacity-40 flex items-center gap-4`}>
                   <div className={`w-8 h-8 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} flex items-center justify-center`}>
                    <Lock size={12} className={theme.textSecondary} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${theme.textPrimary}`}>Module 3: Burnout Recovery</h4>
                    <span className={`text-xs ${theme.textSecondary}`}>Locked</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-2 lg:order-2 flex flex-col items-start lg:pl-12">
              <div className={`w-12 h-12 rounded-xl bg-[#e07a5f]/20 flex items-center justify-center mb-6 text-[#e07a5f]`}>
                <BookOpen size={24} />
              </div>
              <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">Learn systems, not motivation.</h3>
              <p className={`text-lg ${theme.textSecondary} leading-relaxed`}>
                Structured modules teaching nervous system regulation, cognitive reframing, and burnout recovery.
              </p>
            </div>
          </div>

          {/* Feature 5: The Growth Tree */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 flex flex-col items-start lg:pr-12">
              <div className={`w-12 h-12 rounded-xl bg-[#81b29a]/20 flex items-center justify-center mb-6 text-[#81b29a]`}>
                <Leaf size={24} />
              </div>
              <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">Consistency becomes visible.</h3>
              <p className={`text-lg ${theme.textSecondary} leading-relaxed`}>
                Your progress grows a digital ecosystem that evolves with your resilience habits.
              </p>
            </div>
            <div className="order-1 lg:order-2 relative h-[400px] flex items-center justify-center">
              <div className={`w-full max-w-sm aspect-square p-8 rounded-[2rem] ${theme.cardBg} backdrop-blur-xl border ${theme.cardBorder} shadow-xl flex items-center justify-center relative overflow-hidden`}>
                <p className={`absolute top-8 left-8 text-xs font-semibold ${theme.textSecondary} tracking-widest uppercase`}>Resilience Node</p>
                
                <div className="relative w-48 h-48">
                  {/* Center Core */}
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-[#81b29a] flex items-center justify-center shadow-[0_0_30px_rgba(129,178,154,0.4)] z-10 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                    <div className="w-5 h-5 rounded-full bg-[#81b29a] animate-pulse"></div>
                  </div>
                  
                  {/* Abstract SVG branches */}
                  <svg className="absolute inset-0 w-full h-full text-[#81b29a]/30" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M100 100 L100 40" strokeDasharray="4 4" className="animate-pulse" />
                    <path d="M100 100 L40 140" strokeDasharray="4 4" />
                    <path d="M100 100 L160 140" strokeDasharray="4 4" />
                    
                    <path d="M100 40 L80 10" />
                    <path d="M100 40 L120 10" />
                    
                    <path d="M40 140 L10 120" />
                    <path d="M40 140 L20 170" />
                    
                    <path d="M160 140 L190 120" />
                    <path d="M160 140 L180 170" />
                  </svg>

                  {/* Nodes on branches */}
                  <div className="absolute top-[20px] left-[100px] -translate-x-1/2 w-3 h-3 rounded-full bg-[#81b29a] shadow-lg"></div>
                  <div className="absolute top-[140px] left-[40px] -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#818cf8] shadow-lg"></div>
                  <div className="absolute top-[140px] left-[160px] -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#c4a97f] shadow-lg"></div>
                  
                  <div className="absolute top-[10px] left-[80px] -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-[#81b29a] bg-transparent"></div>
                  <div className="absolute top-[170px] left-[180px] -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-[#c4a97f] bg-transparent"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: How It Works */}
      <section className="relative py-24 px-6 max-w-7xl mx-auto text-center border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-16">Three steps toward calmer systems.</h2>
        
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-[40px] left-1/6 right-1/6 h-0.5 border-t-2 border-dashed border-slate-300 dark:border-slate-700 w-2/3 mx-auto z-0"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-20 h-20 rounded-full ${theme.cardBg} backdrop-blur-md border border-slate-300 dark:border-slate-700 flex items-center justify-center mb-6 shadow-sm`}>
              <Eye size={32} className="text-[#81b29a]" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3">Observe</h3>
            <p className={`${theme.textSecondary} px-4`}>Track your emotional state using the Mood Matrix.</p>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-20 h-20 rounded-full ${theme.cardBg} backdrop-blur-md border border-slate-300 dark:border-slate-700 flex items-center justify-center mb-6 shadow-sm`}>
               <Timer size={32} className="text-[#e07a5f]" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3">Regulate</h3>
            <p className={`${theme.textSecondary} px-4`}>Use grounding tools to interrupt stress spikes.</p>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
             <div className={`w-20 h-20 rounded-full ${theme.cardBg} backdrop-blur-md border border-slate-300 dark:border-slate-700 flex items-center justify-center mb-6 shadow-sm`}>
               <Leaf size={32} className="text-[#c4a97f]" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3">Build</h3>
            <p className={`${theme.textSecondary} px-4`}>Develop long-term resilience through patterns and consistency.</p>
          </div>
        </div>
      </section>

      {/* SECTION 6: The Privacy Architecture */}
      <section className="relative py-32 px-6 bg-[#0f172a] text-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          
          <div className="flex flex-col items-start lg:pr-12">
            <div className={`w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center mb-6 text-slate-300 border border-slate-700`}>
               <Lock size={24} />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight">Privacy is the feature.</h2>
            <p className="text-xl text-slate-400 mb-12 max-w-xl leading-relaxed font-light">
              Raft was built on the belief that vulnerable thoughts should never become behavioral data.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              <div className="p-6 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-slate-700">
                <Shield size={20} className="text-[#81b29a] mb-3" />
                <h4 className="font-semibold mb-2">Client-Side Encryption</h4>
                <p className="text-sm text-slate-400">Military-grade AES-256 encryption happens on your device.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-slate-700">
                <Database size={20} className="text-[#c4a97f] mb-3" />
                <h4 className="font-semibold mb-2">Zero-Knowledge</h4>
                <p className="text-sm text-slate-400">We do not hold the keys to your data. We literally cannot read it.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-slate-700">
                <CloudOff size={20} className="text-[#e07a5f] mb-3" />
                <h4 className="font-semibold mb-2">Local-Only Mode</h4>
                <p className="text-sm text-slate-400">Use Raft completely offline. Data never leaves your hardware.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-slate-700">
                <RefreshCw size={20} className="text-[#818cf8] mb-3" />
                <h4 className="font-semibold mb-2">Secure Sync</h4>
                <p className="text-sm text-slate-400">Seamless, end-to-end encrypted syncing across your personal devices.</p>
              </div>
            </div>
          </div>

          <div className="relative h-[500px] flex items-center justify-center">
             <div className="relative w-80 h-80 rounded-full bg-slate-800/20 backdrop-blur-xl border border-slate-700 shadow-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#81b29a]/10 to-[#818cf8]/10 animate-pulse"></div>
                
                {/* Abstract Shield/Vault Graphic */}
                <svg className="w-48 h-48 text-slate-600/50 absolute" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                   <polygon points="50,10 90,25 90,60 50,90 10,60 10,25" />
                   <circle cx="50" cy="50" r="20" strokeDasharray="2 4" />
                </svg>
                
                <div className="z-10 w-24 h-24 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center shadow-[0_0_50px_rgba(129,178,154,0.3)]">
                   <Lock size={32} className="text-[#81b29a]" />
                </div>
                
                {/* Orbital dots */}
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-4 rounded-full border border-slate-700/50"></motion.div>
                <div className="absolute top-[10%] left-[20%] w-2 h-2 rounded-full bg-[#81b29a] animate-pulse"></div>
                <div className="absolute bottom-[20%] right-[10%] w-3 h-3 rounded-full bg-[#818cf8] animate-pulse"></div>
             </div>
          </div>
          
        </div>
      </section>

      {/* SECTION 7: Pricing */}
      <section id="pricing" className="relative py-32 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">Simple pricing. No manipulation.</h2>
          <p className={`text-xl ${theme.textSecondary} mb-16 font-light max-w-2xl mx-auto`}>Designed to be accessible, sustainable, and free of dark patterns.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`p-10 rounded-[2.5rem] ${theme.cardBg} backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-start text-left`}
          >
            <span className={`px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-semibold mb-6 ${theme.textSecondary}`}>Immediate Utility & Safety</span>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold font-serif">$0</span>
              <span className={theme.textSecondary}>/ forever</span>
            </div>
            <p className={`${theme.textSecondary} mb-8`}>The core tools for nervous system regulation will always be free.</p>
            
            <ul className="space-y-4 mb-10 flex-1 w-full">
              {["Emergency grounding tools", "Basic breathing pacer", "Local encrypted journal", "Introductory resilience courses"].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check size={18} className="text-[#81b29a] shrink-0" />
                  <span className={theme.textSecondary}>{feature}</span>
                </li>
              ))}
            </ul>
            
            <Link href="/onboarding/calibration" className="w-full block">
              <button className={`w-full py-4 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold ${theme.textPrimary} hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}>
                Start Free
              </button>
            </Link>
          </motion.div>
          
          {/* Premium Tier */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`p-10 rounded-[2.5rem] ${theme.cardBg} backdrop-blur-xl border-2 border-[#c4a97f] shadow-2xl flex flex-col items-start text-left relative`}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#c4a97f] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-md">
              Early Bird
            </div>
            <span className={`px-4 py-1.5 rounded-full bg-[#c4a97f]/10 text-sm font-semibold mb-6 text-[#c4a97f]`}>Worth Every Penny</span>
            
            <div className="w-full mb-6">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-bold font-serif">$2.99</span>
                <span className={theme.textSecondary}>/ month</span>
              </div>
              <div className={`flex items-center gap-2 mt-3 p-3 rounded-xl bg-[#c4a97f]/10 border border-[#c4a97f]/20`}>
                <span className="text-xs font-bold text-[#c4a97f] uppercase tracking-wider">Annual plan</span>
                <span className={`text-xs ${theme.textSecondary}`}>$29.99 / year</span>
                <span className="ml-auto text-xs font-bold text-[#81b29a] bg-[#81b29a]/10 px-2 py-0.5 rounded-full">Save 2 months</span>
              </div>
            </div>
            
            <p className={`${theme.textSecondary} mb-8`}>For those ready to build deep, consistent patterns of resilience.</p>
            
            <ul className="space-y-4 mb-10 flex-1 w-full">
              {["Everything in Free", "Encrypted cloud sync across devices", "Full resilience course library", "Advanced Mood Analytics", "The Growth Tree customization"].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check size={18} className="text-[#c4a97f] shrink-0" />
                  <span className={theme.textSecondary}>{feature}</span>
                </li>
              ))}
            </ul>
            
            <Link href="/onboarding/calibration" className="w-full block">
              <button className={`w-full py-4 rounded-xl bg-[#0f172a] dark:bg-white text-white dark:text-[#0f172a] font-semibold hover:opacity-90 transition-opacity`}>
                Start Early Bird Access
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 8: FAQ (The Legal Firewall) */}
      <section id="faq" className="relative py-24 px-6 max-w-3xl mx-auto">
        <h2 className="text-4xl font-serif font-bold mb-12 text-center">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {[
            {
              q: "Is Raft therapy?",
              a: "No. Raft is a resilience and emotional observability platform, strictly designed for stress management. It is not a replacement for professional clinical therapy."
            },
            {
              q: "Can anyone read my journal?",
              a: "No. Everything is encrypted locally on your device before it is saved. We literally cannot access your entries."
            },
            {
              q: "What happens if I lose my device?",
              a: "If you use the Free tier (Local-Only), your data remains on the lost device. If you use Premium, your encrypted data is safely synced and can be restored using your private recovery phrase."
            },
            {
              q: "Does Raft sell user data?",
              a: "Never. We are completely ad-free and rely solely on user subscriptions. Your data is not our product."
            }
          ].map((faq, index) => (
            <div key={index} className={`border border-slate-200 dark:border-slate-800 rounded-2xl ${theme.cardBg} overflow-hidden transition-all duration-300`}>
              <button 
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
              >
                <span className="text-lg font-medium">{faq.q}</span>
                {openFaq === index ? <ChevronUp size={20} className={theme.textSecondary} /> : <ChevronDown size={20} className={theme.textSecondary} />}
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className={`p-6 pt-0 ${theme.textSecondary} font-light leading-relaxed`}>
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 9: Final CTA & Footer */}
      <section className="bg-[#0f172a] text-slate-100 py-32 px-6 text-center border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-8 leading-tight">
            Your nervous system was never designed for constant overload.
          </h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Build resilience using tools that respect both your mind and your privacy.
          </p>
          <Link href="/onboarding/calibration">
            <button className="bg-[#e07a5f] text-white px-10 py-4 rounded-full text-lg font-medium hover:bg-[#d0694e] transition-colors shadow-xl">
              Start Free
            </button>
          </Link>
          <p className="mt-4 text-sm text-slate-500 font-medium tracking-wide uppercase">No credit card required</p>
        </div>
      </section>

      <footer className={`${theme.bg} border-t border-slate-200 dark:border-slate-800 py-12 px-6`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-tr from-[#818cf8] to-[#81b29a] flex items-center justify-center text-white`}>
              <Wind size={14} />
            </div>
            <span className="font-serif font-bold text-xl">Raft</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
             <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Features</a>
             <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Privacy</Link>
             <a href="#pricing" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Pricing</a>
             <a href="#faq" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">FAQ</a>
             <Link href="/terms" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Terms</Link>
             <Link href="/contact" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Contact</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 text-center text-sm text-slate-400 font-light">
          Designed for calm in an overstimulated world. &copy; {new Date().getFullYear()} Raft.
        </div>
      </footer>
    </div>
  );
}