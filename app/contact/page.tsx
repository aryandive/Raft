"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Wind, ArrowLeft, Mail, Terminal, AlertTriangle, Phone, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";


export default function ContactPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("raft-theme");
    if (saved === "dark") setIsDarkMode(true);
    else if (saved === "light") setIsDarkMode(false);
    else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) setIsDarkMode(true);
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
    cardBg: isDarkMode ? "bg-[#1e293b]/60" : "bg-white/80",
    cardBorder: isDarkMode ? "border-slate-800" : "border-slate-200",
    divider: isDarkMode ? "border-slate-800" : "border-slate-200",
  };

  const cards = [
    {
      icon: <Mail size={28} />,
      iconColor: "text-[#818cf8]",
      iconBg: "bg-[#818cf8]/10",
      tag: "Accounts & Subscriptions",
      tagColor: "text-[#818cf8] bg-[#818cf8]/10",
      title: "General Support",
      body: "Questions about your Premium subscription, billing, account access, or anything else related to your Raft experience.",
      email: "support@raft.example.com",
      btnClass: "bg-[#e07a5f] text-white hover:bg-[#d0694e]",
      btnLabel: "Email Support",
      primary: true,
    },
    {
      icon: <Terminal size={28} />,
      iconColor: "text-[#81b29a]",
      iconBg: "bg-[#81b29a]/10",
      tag: "Engineering",
      tagColor: "text-[#81b29a] bg-[#81b29a]/10",
      title: "Bug Reports & Architecture",
      body: "Spotted a UI glitch, a sync conflict, or an unexpected behaviour with the Web Crypto API? Send us a detailed report so we can patch it fast.",
      email: "bugs@raft.example.com",
      btnClass: `border ${isDarkMode ? "border-slate-700 text-slate-300 hover:bg-white/5" : "border-slate-300 text-slate-700 hover:bg-black/5"}`,
      btnLabel: "Report a Bug",
      primary: false,
    },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out ${theme.bg} ${theme.textPrimary} font-sans`}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Inter:wght@300;400;500;600&display=swap');
        h1, h2, h3, h4, .font-serif { font-family: 'Playfair Display', serif; }
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
          <Link href="/" className={`hidden sm:flex items-center gap-2 text-sm font-medium ${theme.textSecondary} transition-colors hover:opacity-80`}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <button onClick={toggleTheme} className={`p-2.5 rounded-full backdrop-blur-sm border ${isDarkMode ? "border-slate-800" : "border-slate-300"} hover:scale-105 transition-transform`}>
            {isDarkMode ? <Sun size={18} className="text-[#c4a97f]" /> : <Moon size={18} className="text-[#0f172a]" />}
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-32 px-6 max-w-4xl mx-auto">

        {/* SECTION 1: Header */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-20 text-center"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md border ${isDarkMode ? "border-slate-800" : "border-slate-200"} text-xs font-medium uppercase tracking-widest ${theme.textSecondary} mb-8 shadow-sm`}>
            <Mail size={13} className="text-[#c4a97f]" />
            Contact
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            We&apos;re here to help.
          </h1>
          <p className={`text-xl ${theme.textSecondary} font-light leading-relaxed max-w-2xl mx-auto`}>
            Whether you found a bug, need account support, or just want to share how Raft has helped your nervous system.
          </p>
        </motion.header>

        {/* SECTION 2: Support Grid */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.15, ease: "easeOut" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`relative flex flex-col p-8 rounded-[2rem] ${theme.cardBg} backdrop-blur-xl border ${card.primary ? "border-[#818cf8]/40 shadow-[0_0_40px_rgba(129,140,248,0.08)]" : theme.cardBorder} shadow-xl overflow-hidden`}
              >
                {/* Ambient glow top-right */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none ${card.primary ? "bg-[#818cf8]/10" : "bg-[#81b29a]/10"}`}></div>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-6 shadow-sm`}>
                  {card.icon}
                </div>

                {/* Tag */}
                <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-4 ${card.tagColor}`}>
                  {card.tag}
                </span>

                <h2 className="text-2xl font-serif font-bold mb-3">{card.title}</h2>
                <p className={`text-sm ${theme.textSecondary} leading-relaxed mb-8 flex-1`}>{card.body}</p>

                <div className="space-y-3">
                  <a
                    href={`mailto:${card.email}`}
                    className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-medium text-sm transition-all shadow-sm ${card.btnClass}`}
                  >
                    <Mail size={15} />
                    {card.btnLabel}
                  </a>
                  <p className={`text-xs text-center ${theme.textSecondary} opacity-60`}>{card.email}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Response time note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className={`flex items-center gap-3 p-4 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} backdrop-blur-md mb-20`}
        >
          <span className="w-2 h-2 rounded-full bg-[#81b29a] animate-pulse shrink-0"></span>
          <p className={`text-sm ${theme.textSecondary}`}>
            We aim to respond within <strong className={theme.textPrimary}>1–2 business days</strong>. We&apos;re a small team building something we care about.
          </p>
        </motion.div>

        {/* SECTION 3: Crisis Disclaimer */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="relative rounded-[2rem] border border-[#e07a5f]/40 bg-[#e07a5f]/5 overflow-hidden p-8 md:p-10"
        >
          {/* Subtle warm glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#e07a5f]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#e07a5f]/15 text-[#e07a5f] flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-serif font-bold mb-3 text-[#e07a5f]">Need immediate help?</h3>
              <p className={`text-sm ${theme.textSecondary} leading-relaxed mb-6`}>
                <strong className={theme.textPrimary}>We do not monitor these inboxes 24/7.</strong> If you are experiencing a mental health emergency or severe panic, please step away from the screen and contact your local emergency services or a dedicated crisis hotline immediately.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:988"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e07a5f]/15 text-[#e07a5f] text-sm font-semibold border border-[#e07a5f]/30 hover:bg-[#e07a5f]/25 transition-colors"
                >
                  <Phone size={14} />
                  988 — US Suicide & Crisis Lifeline
                </a>
                <a
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border ${theme.cardBorder} ${theme.textSecondary} hover:opacity-80 transition-opacity`}
                >
                  <ExternalLink size={14} />
                  Find a helpline internationally
                </a>
              </div>
            </div>
          </div>
        </motion.section>

      </main>
    </div>
  );
}
