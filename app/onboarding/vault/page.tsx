"use client";

import { useState, useEffect } from "react";
import { Copy, Check, ShieldAlert, Key } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateMasterKey, exportKeyToBase64, storeLocalMasterKey } from "@/utils/crypto";

export default function VaultPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [confirmedCheckbox, setConfirmedCheckbox] = useState(false);
  const [base64Key, setBase64Key] = useState<string | null>(null);
  const [rawKey, setRawKey] = useState<CryptoKey | null>(null);
  const [isStoring, setIsStoring] = useState(false);

  // Generate Master Key on Mount
  useEffect(() => {
    const initMasterKey = async () => {
      try {
        // Simulate a slight operational pause for visual generation feedback
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        const generatedKey = await generateMasterKey();
        const base64 = await exportKeyToBase64(generatedKey);
        
        setRawKey(generatedKey);
        setBase64Key(base64);
      } catch (err) {
        console.error("Failed to generate master key", err);
      }
    };
    initMasterKey();
  }, []);

  const handleCopy = async () => {
    if (!base64Key) return;
    try {
      await navigator.clipboard.writeText(base64Key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy key to clipboard", err);
    }
  };

  const handleEnterSanctuary = async () => {
    if (!rawKey || !confirmedCheckbox) return;
    setIsStoring(true);
    try {
      await storeLocalMasterKey(rawKey);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error: Failed to store your master key locally in IndexedDB. Please check your browser storage permissions and try again.");
    } finally {
      setIsStoring(false);
    }
  };

  // Loading State
  if (!base64Key) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-[#faf9f6] flex flex-col items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-[#81b29a] animate-spin"></div>
          <p className="text-xs font-mono tracking-widest text-[#faf9f6]/40 uppercase">Generating Secure Cryptographic Key...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#faf9f6] flex flex-col items-center justify-center p-6 font-sans selection:bg-[#818cf8]/30">
      <div className="max-w-xl w-full relative">
        {/* Decorative backdrop glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#818cf8]/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col items-stretch space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#81b29a]/10 text-[#81b29a] border border-[#81b29a]/20 mb-2">
              <Key size={22} className="animate-pulse" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#faf9f6] tracking-wide">
              Your key has been generated.
            </h1>
            <p className="text-xs md:text-sm text-[#e07a5f] font-mono leading-relaxed max-w-sm mx-auto">
              Warning: We do not store this key on our servers. Your keys remain completely offline.
            </p>
          </div>

          {/* Key display box */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#faf9f6]/40">Your Master Recovery Key</span>
            <div className="relative flex items-center bg-black/45 border border-white/10 rounded-2xl p-4 overflow-hidden group">
              <input
                type="text"
                readOnly
                value={base64Key}
                className="w-full bg-transparent text-[#81b29a] font-mono text-xs md:text-sm pr-12 focus:outline-none select-all overflow-ellipsis"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-full flex items-center bg-gradient-to-l from-black/80 via-black/50 to-transparent pl-4">
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#faf9f6]/60 hover:text-white transition-all"
                  title="Copy Key"
                >
                  {copied ? <Check size={14} className="text-[#81b29a]" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Info friction block */}
          <div className="bg-[#e07a5f]/5 border border-[#e07a5f]/15 rounded-2xl p-4 flex gap-3.5 items-start">
            <ShieldAlert size={18} className="text-[#e07a5f] shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-[#faf9f6]/70">
              This master key is the only method to recover your encrypted sanctuary. If lost, your locked journal entries are permanently irrecoverable.
            </div>
          </div>

          {/* Copy to Clipboard CTA Button */}
          <button
            onClick={handleCopy}
            className={`py-3 px-6 rounded-2xl border font-mono text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              copied 
                ? "bg-[#81b29a]/10 border-[#81b29a]/30 text-[#81b29a]"
                : "bg-white/5 border-white/10 hover:bg-white/10 text-[#faf9f6]/80 hover:text-white"
            }`}
          >
            {copied ? (
              <>
                <Check size={14} />
                Copied Key Securely
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy Master Key
              </>
            )}
          </button>

          {/* Confirmation Checkbox */}
          <div className="pt-2 border-t border-white/5">
            <label className="flex items-start gap-3.5 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={confirmedCheckbox}
                  onChange={(e) => setConfirmedCheckbox(e.target.checked)}
                />
                <div className="w-5.5 h-5.5 rounded-lg border-2 border-white/10 peer-checked:border-[#818cf8] peer-checked:bg-[#818cf8]/10 transition-all flex items-center justify-center bg-white/[0.02] group-hover:border-white/30">
                  <Check size={12} className={`text-[#818cf8] transition-opacity stroke-[3] ${confirmedCheckbox ? "opacity-100" : "opacity-0"}`} />
                </div>
              </div>
              <span className="text-xs text-[#faf9f6]/60 select-none group-hover:text-[#faf9f6] transition-colors leading-normal font-light">
                I have securely saved my master key.
              </span>
            </label>
          </div>

          {/* Enter Sanctuary Button */}
          <button
            onClick={handleEnterSanctuary}
            disabled={!confirmedCheckbox || isStoring}
            className={`w-full py-4 rounded-2xl font-mono text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
              confirmedCheckbox && !isStoring
                ? "bg-[#818cf8] hover:bg-[#818cf8]/90 text-white shadow-[0_0_25px_rgba(129,140,248,0.35)] hover:shadow-[0_0_35px_rgba(129,140,248,0.5)] cursor-pointer active:scale-[0.98]"
                : "bg-white/5 border border-white/5 text-white/20 cursor-not-allowed"
            }`}
          >
            {isStoring ? "Storing Key..." : "Enter Sanctuary"}
          </button>

        </div>
      </div>
    </div>
  );
}
