"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function WorkspacePage() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#faf9f6] flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-serif text-[#818cf8] mb-8">Workspace</h1>
      <p className="text-[#faf9f6]/70 mb-8 max-w-md text-center">
        This is a placeholder page to verify authentication. You are securely logged in.
      </p>
      <button 
        onClick={handleSignOut}
        className="flex items-center gap-2 px-6 py-3 bg-[#e07a5f]/10 text-[#e07a5f] border border-[#e07a5f]/20 rounded-full hover:bg-[#e07a5f]/20 transition-all"
      >
        <LogOut size={18} />
        <span>Sign Out</span>
      </button>
    </div>
  );
}
