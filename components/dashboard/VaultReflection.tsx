"use client";
import React, { useState } from 'react';

export function VaultReflection({ prompt }: { prompt: string }) {
  const [reflection, setReflection] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (reflection.trim()) setSaved(true);
  };

  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6 my-6 font-mono w-full max-w-lg mx-auto shadow-inner text-left relative overflow-hidden">
      <div className="absolute top-0 right-0 w-2 h-full bg-[#c4a97f]/40" />
      <h4 className="text-xs tracking-widest text-[#c4a97f] uppercase mb-4 flex justify-between">
        <span>Zero-Knowledge Vault</span>
        {saved && <span className="text-[#81b29a]">Encrypted & Saved</span>}
      </h4>
      <p className="text-sm text-slate-300 mb-4">{prompt}</p>
      
      {!saved ? (
        <>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded p-3 text-sm text-slate-200 focus:outline-none focus:border-[#c4a97f]/50 resize-none h-24 mb-4"
            placeholder="Type your reflection here..."
          />
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-white/5 border border-white/10 hover:bg-[#c4a97f]/20 rounded text-xs transition-colors uppercase tracking-widest"
          >
            Encrypt & Store
          </button>
        </>
      ) : (
        <div className="w-full bg-black/40 border border-white/5 rounded p-3 text-sm text-slate-500 italic">
          [Content securely encrypted on local device]
        </div>
      )}
    </div>
  );
}
