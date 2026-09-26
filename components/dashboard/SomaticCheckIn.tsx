"use client";
import React, { useState } from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';

export function SomaticCheckIn() {
  const { saveTelemetryLog } = useTelemetry();
  const [completed, setCompleted] = useState(false);

  const handleCheckIn = async (delta: number) => {
    // In a real scenario, this payload would be encrypted before saveTelemetryLog
    // For demo, we just record a delta event directly
    await saveTelemetryLog(new Date().toISOString(), JSON.stringify({
      ciphertext: btoa(JSON.stringify({ eventType: 'biometric_delta_logged', payload: { delta } })),
      iv: btoa('demo-iv-not-secure')
    }));
    setCompleted(true);
  };

  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6 my-6 font-mono text-center max-w-sm mx-auto shadow-inner">
      <h4 className="text-xs tracking-widest text-[#818cf8] uppercase mb-4">Somatic Check-In</h4>
      {!completed ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-300">How regulated do you feel right now?</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => handleCheckIn(-1)} className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-[#e07a5f]/20 rounded text-xs transition-colors">Dysregulated</button>
            <button onClick={() => handleCheckIn(0)} className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-[#c4a97f]/20 rounded text-xs transition-colors">Neutral</button>
            <button onClick={() => handleCheckIn(1)} className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-[#81b29a]/20 rounded text-xs transition-colors">Stable</button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#81b29a] animate-pulse">State recorded to local vault.</p>
      )}
    </div>
  );
}
