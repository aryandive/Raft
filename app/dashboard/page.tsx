"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { MoodMatrix } from '@/components/dashboard/MoodMatrix';
import { GrowthMatrix } from '@/components/dashboard/GrowthMatrix';
import { WeeklyReport } from '@/components/dashboard/WeeklyReport';

export default function DashboardPage() {
  const { session } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Graceful loading state to prevent hydration mismatch
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center font-mono text-slate-500 text-xs tracking-widest uppercase">
        Initializing Vault Environment...
      </div>
    );
  }

  const userEmail = session?.user?.email || 'GUEST_ENTITY';

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-mono p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Section: System Status & Greeting */}
        <header className="w-full flex flex-col md:flex-row justify-between items-start md:items-center py-4 border-b border-white/10">
          <div>
            <h1 className="text-sm font-semibold text-slate-100 tracking-widest uppercase">
              SYSTEM_USER: [{userEmail}]
            </h1>
          </div>
          <div className="mt-2 md:mt-0 flex items-center space-x-3">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse shadow-[0_0_8px_rgba(203,213,225,0.8)]" />
            <span className="text-[10px] text-slate-400 tracking-widest uppercase">
              STATUS: SECURE
            </span>
          </div>
        </header>

        {/* Middle Section: 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="w-full h-full flex flex-col justify-start">
            <MoodMatrix />
          </section>
          
          <section className="w-full h-full flex flex-col justify-start">
            <GrowthMatrix />
          </section>
        </div>

        {/* Bottom Section: Full Width Report */}
        <section className="w-full pt-4">
          <WeeklyReport />
        </section>
        
      </div>
    </div>
  );
}
