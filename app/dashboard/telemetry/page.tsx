"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useVault } from "@/hooks/useVault";
import { getEmotionFromCoords } from "@/utils/emotionEngine";
import { getLocalMasterKey, encryptPayload, decryptPayload } from "@/utils/crypto";
import { 
  Activity, 
  MapPin, 
  RefreshCw, 
  ShieldCheck,
  BookOpen,
  Check
} from "lucide-react";

interface Coordinate {
  x: number;
  y: number;
}

interface DecryptedLogPoint {
  x: number;
  y: number;
  timestamp: string;
  comment?: string;
}

export default function TelemetryPage() {
  const [selectedPoint, setSelectedPoint] = useState<Coordinate | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<Coordinate | null>(null);
  
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [todayLogs, setTodayLogs] = useState<DecryptedLogPoint[]>([]);
  const [savedVaults, setSavedVaults] = useState<Record<string, boolean>>({});
  
  const gridRef = useRef<HTMLDivElement>(null);
  const { saveTelemetryLog, loadTelemetryLogs } = useTelemetry();
  const { saveJournalEntry } = useVault();

  // Load today's logs on mount
  useEffect(() => {
    let isMounted = true;
    const fetchToday = async () => {
      try {
        const logs = await loadTelemetryLogs();
        const masterKey = await getLocalMasterKey();
        if (!masterKey) return;

        const today = new Date().toISOString().split('T')[0];
        const todayLogObj = logs.find(l => l.date === today);

        if (todayLogObj && todayLogObj.encryptedPayload) {
          const { ciphertext, iv } = JSON.parse(todayLogObj.encryptedPayload);
          const decryptedStr = await decryptPayload(ciphertext, iv, masterKey);
          const parsed = JSON.parse(decryptedStr);
          if (Array.isArray(parsed) && isMounted) {
            setTodayLogs(parsed.reverse()); // most recent first
          }
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes("Decryption failed")) {
          console.warn("Key rotated: old local data unreadable, starting fresh.");
        } else {
          console.error("Failed to load today's logs", err);
        }
      }
    };
    fetchToday();
    return () => { isMounted = false; };
  }, [loadTelemetryLogs]);

  // Convert pointer event to coords
  const getCoordsFromEvent = (e: React.PointerEvent<HTMLDivElement>): Coordinate | null => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const xClick = e.clientX - rect.left;
    const yClick = e.clientY - rect.top;

    const clampedX = Math.max(0, Math.min(xClick, rect.width));
    const clampedY = Math.max(0, Math.min(yClick, rect.height));

    const x = (clampedX / rect.width) * 2 - 1;
    const y = -((clampedY / rect.height) * 2 - 1);
    
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isLocked || isSubmitting) return;
    const coords = getCoordsFromEvent(e);
    if (coords) {
      setSelectedPoint(coords);
      setHoveredPoint(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isLocked || isSubmitting || e.pointerType === 'touch') return;
    const coords = getCoordsFromEvent(e);
    if (coords) setHoveredPoint(coords);
  };

  const handlePointerLeave = () => {
    setHoveredPoint(null);
  };

  const submitLog = async () => {
    if (!selectedPoint || isLocked) {
      setIsLocked(false);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const masterKey = await getLocalMasterKey();
      
      if (!masterKey) throw new Error("Master key missing");

      // We maintain the existing array
      const logs = await loadTelemetryLogs();
      const todayLogObj = logs.find(l => l.date === today);
      
      let parsedArray: DecryptedLogPoint[] = [];
      if (todayLogObj && todayLogObj.encryptedPayload) {
        try {
          const { ciphertext, iv } = JSON.parse(todayLogObj.encryptedPayload);
          const decryptedStr = await decryptPayload(ciphertext, iv, masterKey);
          parsedArray = JSON.parse(decryptedStr);
        } catch {
          // ignore
        }
      }

      const newPoint: DecryptedLogPoint = {
        x: selectedPoint.x,
        y: selectedPoint.y,
        timestamp: new Date().toISOString(),
        comment: comment.trim() || undefined
      };
      
      parsedArray.push(newPoint);
      
      const plaintext = JSON.stringify(parsedArray);
      const { ciphertext, iv } = await encryptPayload(plaintext, masterKey);
      
      await saveTelemetryLog(today, JSON.stringify({ ciphertext, iv }));
      
      setComment("");
      setTodayLogs([...parsedArray].reverse());
      setIsLocked(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVaultBridge = async (log: DecryptedLogPoint, emotion: string) => {
    try {
      const masterKey = await getLocalMasterKey();
      if (!masterKey) return;
      
      const content = `State: ${emotion}\nX: ${log.x.toFixed(2)} | Y: ${log.y.toFixed(2)}\nTime: ${new Date(log.timestamp).toLocaleString()}\n\nReflection:\n${log.comment || "No reflection provided."}`;
      
      const payload = JSON.stringify({
        title: "Telemetry Reflection Bridge",
        content
      });

      const { ciphertext, iv } = await encryptPayload(payload, masterKey);
      await saveJournalEntry(JSON.stringify({ ciphertext, iv }));

      setSavedVaults(prev => ({ ...prev, [log.timestamp]: true }));
      setTimeout(() => {
        setSavedVaults(prev => ({ ...prev, [log.timestamp]: false }));
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const getMoodMetadata = (x: number, y: number) => {
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    
    if (absX < 0.15 && absY < 0.15) {
      return {
        quadrant: "Neutral / Center",
        mood: "Baseline State",
        description: "A balanced emotional baseline. Calm, awake, and alert with neutral affect.",
        colorClass: "bg-[#faf9f6]/60 border-[#faf9f6]/20 text-[#faf9f6]",
        glowColor: "rgba(250, 249, 246, 0.4)"
      };
    }
    
    if (x >= 0 && y >= 0) {
      return {
        quadrant: "High Valence, High Arousal",
        mood: y > x ? "Alert / Excited" : "Happy / Energized",
        description: "Positive valence coupled with high physiological energy. Ready for engagement.",
        colorClass: "bg-[#c4a97f]/10 border-[#c4a97f]/20 text-[#c4a97f]",
        glowColor: "rgba(196, 169, 127, 0.6)"
      };
    } else if (x < 0 && y >= 0) {
      return {
        quadrant: "Low Valence, High Arousal",
        mood: absX > y ? "Angry / Frustrated" : "Tense / Anxious",
        description: "Negative valence coupled with high physiological energy. Threat or flight response.",
        colorClass: "bg-[#e07a5f]/10 border-[#e07a5f]/20 text-[#e07a5f]",
        glowColor: "rgba(224, 122, 95, 0.6)"
      };
    } else if (x < 0 && y < 0) {
      return {
        quadrant: "Low Valence, Low Arousal",
        mood: absX > absY ? "Sad / Melancholic" : "Fatigued / Sluggish",
        description: "Negative valence coupled with low energy state. Muted interaction, recovery phase.",
        colorClass: "bg-[#818cf8]/10 border-[#818cf8]/20 text-[#818cf8]",
        glowColor: "rgba(129, 140, 248, 0.6)"
      };
    } else {
      return {
        quadrant: "High Valence, Low Arousal",
        mood: x > absY ? "Serene / Content" : "Relaxed / Peaceful",
        description: "Positive valence coupled with low physiological energy. Restoration, rest, and safety.",
        colorClass: "bg-[#81b29a]/10 border-[#81b29a]/20 text-[#81b29a]",
        glowColor: "rgba(129, 178, 154, 0.6)"
      };
    }
  };

  const activePoint = selectedPoint || hoveredPoint;
  const metadata = activePoint
    ? getMoodMetadata(activePoint.x, activePoint.y) 
    : {
        quadrant: "Uncalibrated",
        mood: "Select State",
        description: "Hover or click inside the 2D grid to drop a pin representing your current psychological telemetry.",
        colorClass: "bg-[#faf9f6]/5 border-white/5 text-[#faf9f6]/40",
        glowColor: "rgba(255, 255, 255, 0)"
      };

  return (
    <div className="min-h-screen p-6 lg:p-12 font-sans relative text-[#faf9f6] bg-[#0f172a] flex flex-col justify-center items-center">
      <div className="max-w-5xl w-full relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-sm mb-4">
            <Activity size={12} className="text-[#818cf8] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#faf9f6]/60">Psychological Telemetry</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#faf9f6] mb-2 tracking-wide">
            Telemetry Matrix
          </h1>
          <p className="text-xs text-[#faf9f6]/40 font-mono tracking-wider max-w-md mx-auto">
            Quantify emotional valence and physiological arousal in real-time coordinates.
          </p>
        </div>

        {/* Clinical Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch mt-4">
          
          {/* Scatter Plot Picker (7 Columns) */}
          <div className="md:col-span-7 bg-white/[0.01] border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden select-none">
            
            {/* Grid Container */}
            <div 
              ref={gridRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              className={`w-full max-w-[340px] aspect-square relative flex items-center justify-center rounded-2xl border transition-colors overflow-hidden touch-none mt-2 ${
                isLocked || isSubmitting
                  ? "border-white/5 bg-black/40 cursor-not-allowed" 
                  : "border-white/10 bg-black/25 cursor-crosshair hover:border-slate-500/30"
              }`}
            >
              {/* Quadrant backgrounds */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-5 pointer-events-none">
                <div className="border-r border-b border-dashed border-white/20 bg-[#e07a5f]"></div>
                <div className="border-b border-dashed border-white/20 bg-[#c4a97f]"></div>
                <div className="border-r border-dashed border-white/20 bg-[#818cf8]"></div>
                <div className="bg-[#81b29a]"></div>
              </div>

              {/* Grid Lines */}
              <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/10 border-t border-dashed border-white/5 pointer-events-none"></div>
              <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/10 border-l border-dashed border-white/5 pointer-events-none"></div>
              
              <div className="absolute left-[25%] top-0 bottom-0 w-[1px] border-l border-dotted border-white/5 pointer-events-none"></div>
              <div className="absolute left-[75%] top-0 bottom-0 w-[1px] border-l border-dotted border-white/5 pointer-events-none"></div>
              <div className="absolute top-[25%] left-0 right-0 h-[1px] border-t border-dotted border-white/5 pointer-events-none"></div>
              <div className="absolute top-[75%] left-0 right-0 h-[1px] border-t border-dotted border-white/5 pointer-events-none"></div>

              {/* Framer Motion Crosshair for Active Point */}
              {activePoint && (
                <motion.div
                  initial={false}
                  animate={{
                    left: `${((activePoint.x + 1) / 2) * 100}%`,
                    top: `${((-activePoint.y + 1) / 2) * 100}%`
                  }}
                  transition={{
                    type: "spring",
                    damping: 25,
                    stiffness: 300,
                    mass: 0.5
                  }}
                  className="absolute w-0 h-0 pointer-events-none"
                >
                  {/* Center dot */}
                  <div className="absolute -left-1 -top-1 w-2 h-2 bg-slate-200 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                  
                  {/* Crosshair lines */}
                  <div className="absolute -left-[0.5px] -top-6 w-[1px] h-12 bg-white/30" />
                  <div className="absolute -left-6 -top-[0.5px] w-12 h-[1px] bg-white/30" />
                </motion.div>
              )}

            </div>

            {/* Axial Label Helpers (Absolute Positions around Grid) */}
            <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#faf9f6]/30">High Arousal (Energy)</span>
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#faf9f6]/30">Low Arousal (Energy)</span>
            </div>

            {/* Simple Grid Reset/Controls */}
            <div className="mt-8 w-full max-w-[340px] flex justify-between items-center text-[10px] font-mono text-[#faf9f6]/30">
              <span>[-1.0, +1.0] Range</span>
              {selectedPoint && !isLocked && !isSubmitting && (
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="hover:text-[#faf9f6] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={10} />
                  Reset coordinates
                </button>
              )}
            </div>
          </div>

          {/* Clinical Readout and State Locker (5 Columns) */}
          <div className="md:col-span-5 bg-white/[0.01] border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Telemetry Title */}
              <div>
                <h2 className="text-lg font-serif text-[#faf9f6] mb-1">State Readout</h2>
                <p className="text-xs text-[#faf9f6]/40 font-light">Real-time mapping parameters.</p>
              </div>

              {/* Coordinates read-out block */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/35 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#faf9f6]/40 mb-1">Valence (X)</span>
                  <span className="text-xl font-mono font-bold tracking-tight">
                    {activePoint ? (activePoint.x >= 0 ? `+${activePoint.x.toFixed(3)}` : activePoint.x.toFixed(3)) : "0.000"}
                  </span>
                </div>
                
                <div className="bg-black/35 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#faf9f6]/40 mb-1">Arousal (Y)</span>
                  <span className="text-xl font-mono font-bold tracking-tight">
                    {activePoint ? (activePoint.y >= 0 ? `+${activePoint.y.toFixed(3)}` : activePoint.y.toFixed(3)) : "0.000"}
                  </span>
                </div>
              </div>

              {/* Interactive State Card */}
              <div className={`border rounded-2xl p-5 transition-all duration-300 ${metadata.colorClass}`}>
                <div className="text-[9px] font-mono uppercase tracking-wider opacity-50 mb-1">Detected Space</div>
                <div className="text-lg font-serif font-bold mb-2 flex items-center gap-1.5">
                  {activePoint && <MapPin size={14} className="animate-pulse" />}
                  {metadata.mood}
                </div>
                <p className="text-xs font-light leading-relaxed opacity-75">
                  {metadata.description}
                </p>
              </div>

              {/* Status information warning */}
              <div className="bg-black/25 border border-white/5 rounded-2xl p-4 text-[10px] font-mono leading-relaxed text-[#faf9f6]/40 flex gap-2.5 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-[#818cf8] mt-1 shrink-0 animate-pulse"></div>
                <p>
                  Data is immediately packaged and client-side encrypted via AES-GCM 256-bit before local indexing.
                </p>
              </div>
            </div>

            {/* Lock/Submit controls */}
            <div className="mt-8 pt-4">
              {selectedPoint && !isLocked && (
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add an optional comment..."
                  className="w-full bg-transparent border-b border-white/10 outline-none text-slate-300 placeholder:text-slate-600 font-mono text-sm py-2 mb-4"
                />
              )}
              {selectedPoint ? (
                <button
                  onClick={submitLog}
                  disabled={isSubmitting}
                  className={`w-full py-3.5 rounded-xl border font-mono text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  } ${
                    isLocked
                      ? "bg-[#81b29a]/10 border-[#81b29a]/30 text-[#81b29a]"
                      : "bg-[#818cf8]/10 border-[#818cf8]/20 text-[#818cf8] hover:bg-[#818cf8]/20 active:scale-[0.98]"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Encrypting...
                    </>
                  ) : isLocked ? (
                    <>
                      <ShieldCheck size={14} />
                      Log Secured
                    </>
                  ) : (
                    <>
                      <MapPin size={14} />
                      Log Telemetry
                    </>
                  )}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 rounded-xl bg-white/5 border border-white/5 text-[#faf9f6]/20 font-mono text-xs uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <MapPin size={14} className="opacity-25" />
                  Drop Pin on Grid
                </button>
              )}
              
              {/* History List */}
              {todayLogs.length > 0 && (
                <div className="mt-6 flex flex-col gap-3 max-h-40 overflow-y-auto pr-2">
                  <div className="text-[10px] font-mono text-[#faf9f6]/40 uppercase tracking-widest border-b border-white/5 pb-2 mb-2">Today&apos;s Logs</div>
                  {todayLogs.map((log, idx) => {
                    const dateObj = new Date(log.timestamp);
                    const formattedTime = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                    const emotion = getEmotionFromCoords(log.x, log.y);
                    
                    return (
                      <div key={idx} className="flex flex-col gap-1.5 text-xs font-mono text-slate-400 bg-black/25 p-3 rounded-lg border border-white/5">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-200 font-semibold">{emotion}</span>
                            <span className="text-[10px] opacity-60">{formattedTime}</span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] opacity-60 whitespace-nowrap pt-0.5">X: {log.x.toFixed(2)} | Y: {log.y.toFixed(2)}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <button 
                                onClick={() => handleVaultBridge(log, emotion)}
                                className="text-slate-500 hover:text-[#818cf8] transition-colors cursor-pointer"
                                title="Bridge to Vault"
                              >
                                {savedVaults[log.timestamp] ? (
                                  <Check size={12} className="text-[#81b29a] animate-pulse" />
                                ) : (
                                  <BookOpen size={12} />
                                )}
                              </button>
                              {/* Deletion of individual points inside array is complex in the new array structure, so omitting delete button for now to maintain integrity */}
                            </div>
                          </div>
                        </div>
                        {log.comment && <div className="text-[#faf9f6]/70 text-xs mt-1">{log.comment}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
