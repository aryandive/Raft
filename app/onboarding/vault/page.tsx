"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { setupNewMasterKey } from "@/utils/crypto";

export default function VaultPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);

  useEffect(() => {
    const initKey = async () => {
      try {
        const { recoveryString } = await setupNewMasterKey();
        setRecoveryKey(recoveryString);
      } catch (err) {
        console.error("Failed to generate key", err);
      }
    };
    initKey();
  }, []);

  const handleCopy = () => {
    if (!recoveryKey) return;
    navigator.clipboard.writeText(recoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#faf9f6] flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full space-y-12">
        {/* SECTION 1: The Context */}
        <div className="space-y-6 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-[#c4a97f] tracking-wide">
            Your mind deserves absolute privacy.
          </h1>
          <p className="text-lg md:text-xl text-[#faf9f6]/80 leading-relaxed font-light">
            Because Raft uses Zero-Knowledge architecture, we cannot read your entries. To make this possible, your device has just generated a unique cryptographic Master Key.
          </p>
        </div>

        {/* SECTION 2: The Vault Key Display */}
        <div className="relative group">
          {/* Soft glow effect behind the card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#818cf8]/20 to-[#c4a97f]/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl flex flex-col items-center space-y-6">
            <div className="w-full bg-black/40 rounded-xl p-4 overflow-hidden border border-white/5">
              <code className="text-[#81b29a] font-mono text-sm md:text-base break-all select-all">
                {recoveryKey || "Generating secure key..."}
              </code>
            </div>
            
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-[#faf9f6] text-sm tracking-wide"
            >
              {copied ? (
                <>
                  <Check size={18} className="text-[#81b29a]" />
                  <span>Copied securely</span>
                </>
              ) : (
                <>
                  <Copy size={18} className="text-[#c4a97f]" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SECTION 3: The Friction */}
        <div className="bg-[#e07a5f]/10 border border-[#e07a5f]/20 rounded-xl p-6 space-y-6">
          <p className="text-[#faf9f6]/90 leading-relaxed">
            This key is the only way to recover your journal if you log in on a new device or clear your browser cache. If you lose it, your data is permanently locked. We cannot reset it for you.
          </p>
          
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-1">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
              />
              <div className="w-6 h-6 rounded border-2 border-white/30 peer-checked:border-[#c4a97f] peer-checked:bg-[#c4a97f]/20 transition-all flex items-center justify-center bg-white/5 group-hover:border-white/50">
                <Check size={14} className={`text-[#c4a97f] transition-opacity ${acknowledged ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            </div>
            <span className="text-[#faf9f6] font-medium select-none group-hover:text-white transition-colors">
              I have securely saved my Master Key offline or in a password manager.
            </span>
          </label>
        </div>

        {/* SECTION 4: The Gateway */}
        <div className="flex justify-center pt-8">
          <button
            onClick={() => {
              if (acknowledged && recoveryKey) {
                router.push('/dashboard');
              }
            }}
            disabled={!acknowledged || !recoveryKey}
            className={`
              px-10 py-4 rounded-full font-medium tracking-widest uppercase text-sm transition-all duration-500
              ${acknowledged && recoveryKey
                ? 'bg-[#818cf8] text-white shadow-[0_0_30px_-5px_rgba(129,140,248,0.5)] hover:shadow-[0_0_40px_0px_rgba(129,140,248,0.7)] hover:scale-105 cursor-pointer' 
                : 'bg-white/5 text-white/40 border border-white/10 cursor-not-allowed opacity-50'
              }
            `}
          >
            Enter Your Sanctuary
          </button>
        </div>
      </div>
    </div>
  );
}
