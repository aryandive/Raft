"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Wind, ArrowLeft, Shield, Lock, HardDrive, FileText, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function PrivacyPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [openSection, setOpenSection] = useState<number | null>(null);

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

      <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto">
        {/* SECTION 1: The Human Promise */}
        <section className="mb-32 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} text-xs font-medium uppercase tracking-widest ${theme.textSecondary} mb-8 shadow-sm`}>
            <Shield size={14} className="text-[#81b29a]" />
            Privacy Architecture
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight tracking-tight">
            Your thoughts are yours.<br/>
            <span className="italic font-normal text-[#81b29a]">Period.</span>
          </h1>
          <p className={`text-xl md:text-2xl ${theme.textSecondary} leading-relaxed font-light max-w-3xl mx-auto`}>
            Most wellness apps monetize your mental state. Raft operates on a <strong className={theme.textPrimary}>Zero-Knowledge architecture.</strong> We cannot read your journal, we cannot see your mood matrix, and we cannot sell your data. Because we don&apos;t have it.
          </p>
        </section>

        {/* SECTION 2: The Architecture */}
        <section className="mb-32">
          <h2 className="text-sm font-bold uppercase tracking-widest text-center mb-12 text-[#c4a97f]">For the Skeptics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-3xl ${theme.cardBg} backdrop-blur-xl border flex flex-col`}>
              <div className="w-12 h-12 rounded-xl bg-[#818cf8]/10 text-[#818cf8] flex items-center justify-center mb-6">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">Client-Side Encryption</h3>
              <p className={`text-sm ${theme.textSecondary} leading-relaxed`}>
                Your data is encrypted directly in your browser using the Web Crypto API (AES-256) before it ever touches the network.
              </p>
            </div>

            <div className={`p-8 rounded-3xl ${theme.cardBg} backdrop-blur-xl border flex flex-col`}>
              <div className="w-12 h-12 rounded-xl bg-[#c4a97f]/10 text-[#c4a97f] flex items-center justify-center mb-6">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">Zero-Knowledge Cloud</h3>
              <p className={`text-sm ${theme.textSecondary} leading-relaxed`}>
                If you use the Premium cloud sync, the database (Supabase) only stores scrambled ciphertexts. Without your local decryption key, the database is unreadable—even to our developers.
              </p>
            </div>

            <div className={`p-8 rounded-3xl ${theme.cardBg} backdrop-blur-xl border flex flex-col`}>
              <div className="w-12 h-12 rounded-xl bg-[#e07a5f]/10 text-[#e07a5f] flex items-center justify-center mb-6">
                <HardDrive size={24} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">Local-Only Guarantee</h3>
              <p className={`text-sm ${theme.textSecondary} leading-relaxed`}>
                Free tier users operate entirely locally. Your data lives in your browser storage. If you clear your cache, it&apos;s gone forever. No external backups.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: Standard Legal Policy */}
        <section className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            <span className={`text-xs font-bold uppercase tracking-widest ${theme.textSecondary}`}>Standard Legal Boilerplate</span>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          </div>
          
          <div className="space-y-4">
            {[
              {
                title: "Cookies & Tracking",
                content: "We use strictly necessary cookies for authentication and session management. We do not use third-party tracking pixels, marketing analytics, or cross-site tracking scripts."
              },
              {
                title: "Server Logs & Telemetry",
                content: "Our servers automatically record standard, non-identifiable web log information (IP addresses, browser types) for security and rate-limiting. This is deleted automatically after 30 days."
              },
              {
                title: "Payment Processing",
                content: "All payment processing is handled via Stripe. We do not store or process your credit card information directly. Stripe's usage of your data is governed by their privacy policy."
              },
              {
                title: "GDPR & CCPA Rights",
                content: "You have the right to request deletion of any account metadata. Note that because your actual journal/mood data is Zero-Knowledge, there is nothing for us to 'export' or 'delete' regarding your content—it is already exclusively in your control."
              }
            ].map((policy, index) => (
              <div key={index} className={`border border-slate-200 dark:border-slate-800 rounded-2xl ${theme.cardBg} overflow-hidden transition-all duration-300`}>
                <button 
                  onClick={() => setOpenSection(openSection === index ? null : index)}
                  className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                >
                  <span className={`text-sm font-medium ${theme.textPrimary}`}>{policy.title}</span>
                  {openSection === index ? <ChevronUp size={16} className={theme.textSecondary} /> : <ChevronDown size={16} className={theme.textSecondary} />}
                </button>
                <AnimatePresence>
                  {openSection === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className={`p-6 pt-0 text-sm ${theme.textSecondary} font-light leading-relaxed`}>
                        {policy.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
