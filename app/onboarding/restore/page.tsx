"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Shield } from "lucide-react";
import { importRecoveryKey } from "@/utils/crypto";

export default function RestorePage() {
  const router = useRouter();
  const [recoveryString, setRecoveryString] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async () => {
    setError(null);
    try {
      await importRecoveryKey(recoveryString.trim());
      router.push("/dashboard");
    } catch {
      setError("Invalid Recovery Key. Please check your formatting.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#faf9f6] flex flex-col justify-center items-center p-6 font-sans">
      <div className="max-w-xl w-full flex flex-col space-y-10">
        
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c4a97f] to-[#e07a5f] flex items-center justify-center shadow-lg shadow-[#c4a97f]/20 mx-auto mb-6">
            <Shield size={24} className="text-[#0f172a]" fill="currentColor" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#faf9f6] tracking-wide">
            Unlock your sanctuary.
          </h1>
          <p className="text-lg text-[#faf9f6]/70 font-light leading-relaxed max-w-md mx-auto">
            Your journal is Zero-Knowledge encrypted. We cannot decrypt it without your Master Key. Please paste your recovery string below.
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <textarea
            value={recoveryString}
            onChange={(e) => setRecoveryString(e.target.value)}
            placeholder="eyJhbGciOiJBMTI4R0NNIiwiZXh0Ijp..."
            rows={5}
            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-[#faf9f6] font-mono text-sm placeholder:text-[#faf9f6]/30 focus:outline-none focus:border-[#818cf8]/50 focus:ring-1 focus:ring-[#818cf8]/50 transition-all resize-none mb-6 break-all"
          />

          {error && (
            <div className="mb-6 px-4 py-3 bg-[#e07a5f]/10 border border-[#e07a5f]/30 rounded-xl text-[#e07a5f] text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleUnlock}
            disabled={!recoveryString.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#818cf8] hover:bg-[#818cf8]/90 text-white rounded-xl font-medium shadow-[0_0_20px_-5px_rgba(129,140,248,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
          >
            Unlock Vault
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
