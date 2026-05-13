"use client";

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Wind, HeartPulse, BookOpen, Shield, Activity } from 'lucide-react';

export default function RaftLandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [breatheState, setBreatheState] = useState('Inhale');

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    const cycle = () => {
      setBreatheState('Inhale');
      setTimeout(() => setBreatheState('Hold'), 4000);
      setTimeout(() => setBreatheState('Exhale'), 8000);
      setTimeout(() => setBreatheState('Hold'), 12000);
    };
    cycle();
    const interval = setInterval(cycle, 16000);
    return () => clearInterval(interval);
  }, []);

  const theme = {
    bg: isDarkMode ? 'bg-[#0f172a]' : 'bg-[#faf9f6]',
    textPrimary: isDarkMode ? 'text-slate-100' : 'text-[#2c3e50]',
    textSecondary: isDarkMode ? 'text-slate-400' : 'text-[#5c6e7a]',
    navBg: isDarkMode ? 'bg-[#0f172a]/80' : 'bg-[#faf9f6]/80',
    cardBg: isDarkMode ? 'bg-[#1e293b]' : 'bg-[#ffffff]',
    cardBorder: isDarkMode ? 'border-[#334155]' : 'border-[#f1f0ea]',
    shadow: isDarkMode ? 'shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'shadow-[0_20px_50px_rgba(200,195,180,0.3)]',
    accentPrimary: isDarkMode ? 'bg-[#c4a97f]' : 'bg-[#e07a5f]',
    accentSecondary: isDarkMode ? 'bg-[#818cf8]' : 'bg-[#81b29a]',
    accentText: isDarkMode ? 'text-[#c4a97f]' : 'text-[#e07a5f]',
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out ${theme.bg} ${theme.textPrimary} font-sans selection:bg-[#e07a5f]/30`}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');
        
        h1, h2, h3, .font-serif { font-family: 'Playfair Display', serif; }
        p, span, button, a { font-family: 'Inter', sans-serif; }
        
        @keyframes organic-breathe {
          0%, 100% { transform: scale(1); opacity: 0.2; filter: blur(20px); }
          50% { transform: scale(1.6); opacity: 0.5; filter: blur(30px); }
        }
        
        .breathe-orb {
          animation: organic-breathe 16s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .soft-card-hover {
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .soft-card-hover:hover {
          transform: translateY(-5px);
          box-shadow: ${isDarkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)' : '0 25px 50px -12px rgba(180, 175, 160, 0.5)'};
        }
      `}} />

      <nav className={`fixed w-full z-50 transition-all duration-500 backdrop-blur-md border-b ${theme.cardBorder} px-6 py-4 flex justify-between items-center ${theme.navBg}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme.accentSecondary} text-white shadow-md`}>
            <Wind size={20} />
          </div>
          <span className="text-xl font-serif font-bold tracking-wide">Raft</span>
        </div>

        <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
          <a href="#toolkit" className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}>The Library</a>
          <a href="#privacy" className={`${theme.textSecondary} hover:${theme.textPrimary} transition-colors`}>Privacy</a>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full ${theme.cardBg} border ${theme.cardBorder} hover:scale-110 transition-transform`}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={18} className="text-[#c4a97f]" /> : <Moon size={18} className="text-[#5c6e7a]" />}
          </button>
          
          <button className={`hidden md:block ${theme.accentPrimary} text-white px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity shadow-sm`}>
            Access Your Space
          </button>
        </div>
      </nav>

      <section className="relative pt-40 pb-24 px-6 overflow-hidden flex flex-col justify-center min-h-[90vh]">
        <div className={`absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 pointer-events-none ${isDarkMode ? 'bg-[#818cf8]' : 'bg-[#e07a5f]'}`}></div>
        <div className={`absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none ${isDarkMode ? 'bg-[#c4a97f]' : 'bg-[#81b29a]'}`}></div>

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          <div>
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.cardBg} border ${theme.cardBorder} text-xs font-medium ${theme.textSecondary} mb-8 shadow-sm`}>
              <span className={`w-2 h-2 rounded-full ${theme.accentPrimary}`}></span>
              A carefully crafted space for your mind.
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6 font-serif">
              Your mental <br/>
              <span className="italic font-normal">health matters.</span>
            </h1>
            
            <p className={`text-lg md:text-xl ${theme.textSecondary} mb-10 max-w-lg leading-relaxed font-light`}>
              A secure, private sanctuary offering interactive grounding tools, guided journaling, and patterns of resilience. Designed to support you on your own terms.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className={`flex items-center justify-center gap-2 ${theme.accentPrimary} text-white px-8 py-3.5 rounded-full font-medium hover:opacity-90 transition-opacity shadow-lg`}>
                Begin Your Journey
              </button>
              <button className={`flex items-center justify-center gap-2 ${theme.cardBg} border ${theme.cardBorder} ${theme.textPrimary} px-8 py-3.5 rounded-full font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}>
                Browse the Library
              </button>
            </div>
          </div>

          <div className="relative flex justify-center items-center min-h-[400px]">
            <div className={`absolute inset-0 ${theme.cardBg} rounded-[3rem] ${theme.shadow} border ${theme.cardBorder} overflow-hidden`}>
              <div className="absolute top-6 left-8">
                <p className={`text-sm font-medium ${theme.textSecondary} tracking-wide uppercase`}>Grounding Tool</p>
              </div>

              <div className="relative w-full h-full flex items-center justify-center">
                <div className={`absolute w-40 h-40 rounded-full ${isDarkMode ? 'bg-[#818cf8]' : 'bg-[#81b29a]'} breathe-orb`}></div>
                
                <div className={`z-10 w-28 h-28 rounded-full ${theme.cardBg} flex items-center justify-center shadow-lg border ${theme.cardBorder}`}>
                  <span className={`text-lg font-serif italic ${theme.textPrimary} transition-opacity duration-500`}>
                    {breatheState}
                  </span>
                </div>
              </div>

              <div className="absolute bottom-6 w-full text-center">
                <p className={`text-xs ${theme.textSecondary} max-w-[200px] mx-auto`}>
                  Take a moment. Sync your breath with the expanding circle.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section id="toolkit" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-serif">A sanctuary of tools.</h2>
          <p className={`text-lg ${theme.textSecondary} max-w-2xl mx-auto font-light`}>
            Explore interactive exercises and secure journaling designed to help you navigate overwhelming moments and recognize your own strength.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className={`${theme.cardBg} rounded-[2rem] p-10 border ${theme.cardBorder} ${theme.shadow} soft-card-hover`}>
            <div className={`w-14 h-14 rounded-2xl ${isDarkMode ? 'bg-[#818cf8]/20 text-[#818cf8]' : 'bg-[#81b29a]/20 text-[#81b29a]'} flex items-center justify-center mb-8`}>
              <HeartPulse size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif">Interactive Sandboxes</h3>
            <p className={`${theme.textSecondary} leading-relaxed`}>
              Tactile, guided modules designed to help ground you during moments of high stress. Practice breathing and sensory exercises safely.
            </p>
          </div>

          <div className={`${theme.cardBg} rounded-[2rem] p-10 border ${theme.cardBorder} ${theme.shadow} soft-card-hover`}>
            <div className={`w-14 h-14 rounded-2xl ${isDarkMode ? 'bg-[#c4a97f]/20 text-[#c4a97f]' : 'bg-[#e07a5f]/20 text-[#e07a5f]'} flex items-center justify-center mb-8`}>
              <BookOpen size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif">The Growth Journal</h3>
            <p className={`${theme.textSecondary} leading-relaxed`}>
              A private space to log your daily state. Build your digital resilience garden through micro-habits, without the pressure of maintaining streaks.
            </p>
          </div>

          <div className={`${theme.cardBg} rounded-[2rem] p-10 border ${theme.cardBorder} ${theme.shadow} soft-card-hover`}>
            <div className={`w-14 h-14 rounded-2xl ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} flex items-center justify-center mb-8`}>
              <Shield size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif">Total Privacy</h3>
            <p className={`${theme.textSecondary} leading-relaxed`}>
              Your thoughts belong to you. Every entry is encrypted directly on your device before it is ever saved. We cannot read your data.
            </p>
          </div>

        </div>
      </section>

      <footer className={`border-t ${theme.cardBorder} mt-12 py-16 px-6 text-center`}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 font-serif">You don't have to struggle in silence.</h2>
          <p className={`${theme.textSecondary} mb-8 font-light`}>
            The core tools for your well-being are, and always will be, completely free to access.
          </p>
          <button className={`flex items-center justify-center gap-2 ${theme.accentSecondary} text-white px-8 py-3 rounded-full font-medium mx-auto hover:opacity-90 transition-opacity shadow-md`}>
            Access the Tools
          </button>
          
          <div className={`mt-16 flex flex-col items-center text-sm ${theme.textSecondary} opacity-70`}>
            <div className="flex items-center gap-2 mb-2">
              <Activity size={14} />
              <span>A personal project built for resilience.</span>
            </div>
            <p>© 2026 Raft. Built with care.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}