"use client";

import { Home, Wind, Shield, Activity, AlertTriangle, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { label: "Home", href: "/dashboard", icon: <Home size={20} /> },
    { label: "Grounding", href: "/dashboard/grounding", icon: <Wind size={20} /> },
    { label: "The Vault", href: "/dashboard/vault", icon: <Shield size={20} /> },
    { label: "Telemetry", href: "/dashboard/telemetry", icon: <Activity size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#faf9f6] flex flex-col md:flex-row font-sans selection:bg-[#818cf8]/30">
      
      {/* Sidebar Desktop / Bottom Nav Mobile */}
      <aside className="fixed bottom-0 md:top-0 left-0 w-full md:w-64 md:h-screen bg-[#0f172a]/80 backdrop-blur-md border-t md:border-t-0 md:border-r border-[#818cf8]/20 z-50 flex md:flex-col justify-between p-4 md:p-6 shadow-2xl">
        
        {/* Top Section (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#818cf8] to-[#81b29a] flex items-center justify-center text-white shadow-sm">
            <Wind size={16} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-serif font-bold tracking-tight">Raft</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex md:flex-col justify-around md:justify-start w-full gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-[#818cf8]/10 text-[#818cf8] md:border md:border-[#818cf8]/20" 
                    : "text-[#faf9f6]/60 hover:bg-white/5 hover:text-[#faf9f6]"
                }`}
              >
                {item.icon}
                <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section (Controls) */}
        <div className="hidden md:flex flex-col gap-3 mt-10">
          <Link
            href="/dashboard/grounding"
            className="flex items-center gap-3 p-3 rounded-xl bg-[#e07a5f]/10 text-[#e07a5f] border border-[#e07a5f]/20 hover:bg-[#e07a5f]/20 transition-all font-medium text-sm group"
          >
            <AlertTriangle size={18} className="group-hover:animate-pulse" />
            Emergency Override
          </Link>
          
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 p-3 rounded-xl text-[#faf9f6]/50 hover:bg-white/5 hover:text-[#faf9f6] transition-all text-sm font-medium w-full text-left"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 relative overflow-hidden">
        {/* Subtle ambient light for the whole dashboard */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#818cf8]/5 blur-[120px] pointer-events-none rounded-full"></div>
        {children}
      </main>
    </div>
  );
}
