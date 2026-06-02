"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Wind, ArrowLeft, Scale } from "lucide-react";
import Link from "next/link";

const LAST_UPDATED = "May 13, 2025";

const sections = [
  {
    num: "01",
    color: "text-[#818cf8]",
    borderColor: "border-[#818cf8]/30",
    bgColor: "bg-[#818cf8]/5",
    title: "Not a Clinical Tool",
    content: [
      "Raft is a personal resilience and emotional observability platform. It is explicitly and strictly designed for self-directed stress management, nervous system regulation, and long-term habit formation.",
      "Raft is NOT a medical device, a licensed therapy service, or a crisis intervention platform. It does not constitute medical advice, diagnosis, or treatment of any kind.",
      "If you are experiencing a mental health crisis, acute psychiatric emergency, suicidal ideation, severe depression, post-traumatic stress, clinical anxiety, or any condition requiring professional care, please immediately contact a licensed mental health professional, a crisis hotline, or your local emergency services.",
      "By using Raft, you acknowledge that it is a supplement to — and not a replacement for — qualified clinical care.",
    ],
  },
  {
    num: "02",
    color: "text-[#c4a97f]",
    borderColor: "border-[#c4a97f]/30",
    bgColor: "bg-[#c4a97f]/5",
    title: "Data Ownership & Zero-Knowledge Liability",
    content: [
      "You own your data. Raft's Zero-Knowledge architecture ensures that all journal entries, mood logs, and personal records are encrypted client-side using AES-256 before any data reaches our servers. Raft, its developers, and its operators possess no cryptographic keys capable of decrypting your content.",
      "Because of this architecture, Raft cannot recover your data if you lose access to your local decryption credentials, clear your browser cache while on the Free (Local-Only) tier, uninstall the application without first exporting a backup, or experience device failure without an active Premium cloud sync subscription.",
      "The Free tier stores all data exclusively in your browser's local storage. This data is ephemeral by its nature. Raft bears no liability for the loss of any data resulting from the above scenarios. You assume full responsibility for maintaining access to your encryption keys and performing personal backups.",
      "Premium subscribers benefit from encrypted cloud synchronization via Supabase. Even in this mode, the database stores only ciphertext. Your encrypted data persists in the cloud, but remains unreadable to us.",
    ],
  },
  {
    num: "03",
    color: "text-[#81b29a]",
    borderColor: "border-[#81b29a]/30",
    bgColor: "bg-[#81b29a]/5",
    title: "Acceptable Use",
    content: [
      "You agree to use Raft solely for its intended purpose of personal resilience and mental wellness management. The following activities are strictly prohibited:",
      "Reverse engineering, decompiling, or attempting to extract the source code or cryptographic implementation of the Raft platform. Attempting to access, read, or interfere with the encrypted data of other users. Using automated scripts, bots, or any non-human agent to interact with the service. Uploading or transmitting any malicious code, virus, or disruptive software. Impersonating another user or entity in connection with Raft's services.",
      "Violation of these terms may result in immediate account termination without refund and, where applicable, referral to relevant legal authorities.",
    ],
  },
  {
    num: "04",
    color: "text-[#e07a5f]",
    borderColor: "border-[#e07a5f]/30",
    bgColor: "bg-[#e07a5f]/5",
    title: "Subscriptions & Refunds",
    content: [
      "Premium tier subscriptions are billed at $2.99 per month (Early Bird rate) or $29.99 per year via Stripe, Inc. By subscribing, you authorize Stripe to charge your designated payment method on a recurring basis.",
      "Subscriptions renew automatically at the end of each billing cycle. You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current paid period; you will retain Premium access until that date.",
      "Raft does not issue refunds for partial billing periods. If you believe a charge was made in error, please contact us at support@raft.app within 14 days of the transaction date. All payment data is handled exclusively by Stripe and is governed by Stripe's Privacy Policy and Terms of Service. Raft does not store, process, or retain payment card details.",
      "Raft reserves the right to modify pricing with a minimum of 30 days' written notice to active subscribers.",
    ],
  },
];

export default function TermsPage() {
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
    textBody: isDarkMode ? "text-slate-300" : "text-slate-700",
    navBg: isDarkMode ? "bg-[#0f172a]/80 border-slate-800" : "bg-[#faf9f6]/80 border-slate-200",
    cardBg: isDarkMode ? "bg-[#1e293b]/60 border-slate-800" : "bg-white/80 border-slate-200",
    divider: isDarkMode ? "border-slate-800" : "border-slate-200",
  };

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
          <Link href="/" className={`hidden sm:flex items-center gap-2 text-sm font-medium ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <button onClick={toggleTheme} className={`p-2.5 rounded-full backdrop-blur-sm border ${isDarkMode ? 'border-slate-800' : 'border-slate-300'} hover:scale-105 transition-transform`}>
            {isDarkMode ? <Sun size={18} className="text-[#c4a97f]" /> : <Moon size={18} className="text-[#0f172a]" />}
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-32 px-6">
        <div className="max-w-3xl mx-auto">

          {/* SECTION 1: Header */}
          <header className="mb-20">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} text-xs font-medium uppercase tracking-widest ${theme.textSecondary} mb-8 shadow-sm`}>
              <Scale size={14} className="text-[#818cf8]" />
              Legal
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
              Terms &amp; Boundaries.
            </h1>
            <p className={`text-lg ${theme.textSecondary} leading-relaxed`}>
              Clear rules for a safe, private ecosystem.{" "}
              <span className={`font-medium ${theme.textPrimary}`}>Last updated: {LAST_UPDATED}.</span>
            </p>
            <div className={`mt-10 p-5 rounded-2xl border ${isDarkMode ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`text-sm ${theme.textSecondary} leading-relaxed`}>
                These Terms of Service govern your use of the Raft platform (&ldquo;Raft&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By accessing or using the service, you agree to be bound by these terms. If you do not agree, do not use the service.
              </p>
            </div>
          </header>

          {/* SECTION 2: Legal Content */}
          <div className="space-y-16">
            {sections.map((section) => (
              <article key={section.num} className="relative">
                {/* Number + Title */}
                <div className="flex items-baseline gap-4 mb-6">
                  <span className={`text-4xl font-serif font-bold ${section.color} leading-none tabular-nums`}>
                    {section.num}
                  </span>
                  <h2 className={`text-2xl md:text-3xl font-serif font-bold ${theme.textPrimary} leading-tight`}>
                    {section.title}
                  </h2>
                </div>

                {/* Accent bar */}
                <div className={`w-12 h-0.5 mb-8 rounded-full ${section.color.replace("text-", "bg-")}`}></div>

                {/* Content card */}
                <div className={`p-8 rounded-2xl border ${section.borderColor} ${section.bgColor} backdrop-blur-sm space-y-5`}>
                  {section.content.map((para, i) => (
                    <p
                      key={i}
                      className={`text-base leading-loose ${theme.textBody}`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {/* Closing / Contact */}
          <div className={`mt-24 pt-12 border-t ${theme.divider} text-center`}>
            <p className={`text-sm ${theme.textSecondary} leading-relaxed mb-4`}>
              Questions about these terms? We respond to all legal inquiries.
            </p>
            <a
              href="mailto:legal@raft.app"
              className="text-sm font-medium text-[#c4a97f] hover:underline underline-offset-4 transition-all"
            >
              legal@raft.app
            </a>
            <p className={`mt-8 text-xs ${theme.textSecondary} opacity-50`}>
              Raft &copy; {new Date().getFullYear()}. All rights reserved.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
