"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTelemetry, type TelemetryPoint } from "@/hooks/useTelemetry"; // Adjust path to @/utils/useTelemetry if needed
import { getEmotionFromCoords } from "@/utils/emotionEngine";
import { 
  Activity, 
  MapPin, 
  RefreshCw, 
  ShieldCheck,
  X,
  BookOpen,
  Check
} from "lucide-react";

interface Coordinates {
  x: number; // Valence: [-1.0, 1.0]
  y: number; // Arousal: [-1.0, 1.0]
}

export default function TelemetryPage() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [todayLogs, setTodayLogs] = useState<TelemetryPoint[]>([]);
  const [savedVaults, setSavedVaults] = useState<Record<string, boolean>>({});
  const gridRef = useRef<HTMLDivElement>(null);
  const { handleLogMood, fetchTodayLogs, handleDeleteMood, bridgeToVault } = useTelemetry();

  const handleVaultBridge = async (log: TelemetryPoint, emotion: string) => {
    try {
      await bridgeToVault(log, emotion);
      setSavedVaults(prev => ({ ...prev, [log.timestamp]: true }));
      setTimeout(() => {
        setSavedVaults(prev => ({ ...prev, [log.timestamp]: false }));
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogDelete = async (timestamp: string) => {
    try {
      await handleDeleteMood(timestamp);
      setTodayLogs(prev => prev.filter(l => l.timestamp !== timestamp));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadLogs = async () => {
      const logs = await fetchTodayLogs();
      setTodayLogs(logs);
    };
    loadLogs();
  }, [fetchTodayLogs]);

  // Core coordinate updates (clamped and mapped to [-1.000, 1.000])
  const updateCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    
    // Position inside the grid bounding box
    const rawX = clientX - rect.left;
    const rawY = clientY - rect.top;
    
    // Clamp to boundaries
    const clampedX = Math.max(0, Math.min(rawX, rect.width));
    const clampedY = Math.max(0, Math.min(rawY, rect.height));
    
    // Map to [-1.0, 1.0]
    // X-axis: left is -1.0, right is +1.0
    const x = (clampedX / rect.width) * 2 - 1;
    
    // Y-axis: top is +1.0, bottom is -1.0
    const y = 1 - (clampedY / rect.height) * 2;
    
    setCoordinates({
      x: parseFloat(x.toFixed(3)),
      y: parseFloat(y.toFixed(3))
    });
  }, []);

  // Mouse drag handler
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLocked) return;
    updateCoordinates(e.clientX, e.clientY);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      updateCoordinates(moveEvent.clientX, moveEvent.clientY);
    };
    
    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Touch drag handler
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isLocked || e.touches.length === 0) return;
    updateCoordinates(e.touches[0].clientX, e.touches[0].clientY);
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length === 0) return;
      updateCoordinates(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY);
    };
    
    const handleTouchEnd = () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
    
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  };

  // Identify psychological space state labels based on dimensions
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

  const metadata = coordinates 
    ? getMoodMetadata(coordinates.x, coordinates.y) 
    : {
        quadrant: "Uncalibrated",
        mood: "Select State",
        description: "Click or drag inside the 2D grid to drop a pin representing your current psychological telemetry.",
        colorClass: "bg-[#faf9f6]/5 border-white/5 text-[#faf9f6]/40",
        glowColor: "rgba(255, 255, 255, 0)"
      };

  return (
    <div className="min-h-screen p-6 lg:p-12 font-sans relative text-[#faf9f6] flex flex-col justify-center items-center">
      <div className="max-w-4xl w-full relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-sm mb-4">
            <Activity size={12} className="text-[#818cf8] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#faf9f6]/60">Psychological Telemetry</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#faf9f6] mb-2 tracking-wide">
            Mood Matrix
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
            <div className="w-full max-w-[340px] aspect-square relative flex items-center justify-center mt-2">
              
              {/* Outer Coordinate Border */}
              <div 
                ref={gridRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className={`w-full h-full rounded-2xl border transition-colors relative overflow-hidden ${
                  isLocked 
                    ? "border-white/5 bg-black/40 cursor-not-allowed" 
                    : "border-white/10 bg-black/25 cursor-crosshair hover:border-[#818cf8]/30"
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
                {/* Horizontal Center (Y = 0) */}
                <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/10 border-t border-dashed border-white/5 pointer-events-none"></div>
                {/* Vertical Center (X = 0) */}
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/10 border-l border-dashed border-white/5 pointer-events-none"></div>
                
                {/* Guide helper tick marks at +/- 0.5 */}
                <div className="absolute left-[25%] top-0 bottom-0 w-[1px] border-l border-dotted border-white/5 pointer-events-none"></div>
                <div className="absolute left-[75%] top-0 bottom-0 w-[1px] border-l border-dotted border-white/5 pointer-events-none"></div>
                <div className="absolute top-[25%] left-0 right-0 h-[1px] border-t border-dotted border-white/5 pointer-events-none"></div>
                <div className="absolute top-[75%] left-0 right-0 h-[1px] border-t border-dotted border-white/5 pointer-events-none"></div>

                {/* Interactive State Pin */}
                {coordinates && (
                  <div 
                    className="absolute w-6 h-6 -ml-3 -mb-3 rounded-full pointer-events-none flex items-center justify-center transition-all duration-75"
                    style={{
                      left: `${(coordinates.x + 1) * 50}%`,
                      bottom: `${(coordinates.y + 1) * 50}%`,
                    }}
                  >
                    {/* Ring aura */}
                    <div 
                      className="absolute inset-0 rounded-full animate-ping opacity-35"
                      style={{ backgroundColor: metadata.glowColor }}
                    ></div>
                    {/* Outer glow */}
                    <div 
                      className="absolute inset-0.5 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                      style={{ 
                        backgroundColor: metadata.glowColor,
                        boxShadow: `0 0 16px ${metadata.glowColor}`
                      }}
                    ></div>
                    {/* Core pin */}
                    <div className="w-2.5 h-2.5 rounded-full bg-[#faf9f6] relative z-10 border border-black/50 shadow-sm"></div>
                  </div>
                )}
              </div>

              {/* Axial Label Helpers (Absolute Positions around Grid) */}
              <div className="absolute -top-6 left-0 right-0 text-center pointer-events-none">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#faf9f6]/30">High Arousal (Energy)</span>
              </div>
              <div className="absolute -bottom-6 left-0 right-0 text-center pointer-events-none">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#faf9f6]/30">Low Arousal (Energy)</span>
              </div>
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 origin-center pointer-events-none">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#faf9f6]/30 block whitespace-nowrap">Negative Valence</span>
              </div>
              <div className="absolute -right-6 top-1/2 -translate-y-1/2 rotate-90 origin-center pointer-events-none">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#faf9f6]/30 block whitespace-nowrap">Positive Valence</span>
              </div>
            </div>

            {/* Simple Grid Reset/Controls */}
            <div className="mt-8 w-full flex justify-between items-center text-[10px] font-mono text-[#faf9f6]/30">
              <span>[-1.0, +1.0] Range</span>
              {coordinates && !isLocked && (
                <button
                  onClick={() => setCoordinates(null)}
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
                    {coordinates ? (coordinates.x >= 0 ? `+${coordinates.x.toFixed(3)}` : coordinates.x.toFixed(3)) : "0.000"}
                  </span>
                </div>
                
                <div className="bg-black/35 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#faf9f6]/40 mb-1">Arousal (Y)</span>
                  <span className="text-xl font-mono font-bold tracking-tight">
                    {coordinates ? (coordinates.y >= 0 ? `+${coordinates.y.toFixed(3)}` : coordinates.y.toFixed(3)) : "0.000"}
                  </span>
                </div>
              </div>

              {/* Interactive State Card */}
              <div className={`border rounded-2xl p-5 transition-all duration-300 ${metadata.colorClass}`}>
                <div className="text-[9px] font-mono uppercase tracking-wider opacity-50 mb-1">Detected Space</div>
                <div className="text-lg font-serif font-bold mb-2 flex items-center gap-1.5">
                  {coordinates && <MapPin size={14} className="animate-pulse" />}
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
                  Coordinates are captured inside a local React state variable `coordinates`. This can be encrypted client-side using `utils/crypto.ts` and securely stored in your vault.
                </p>
              </div>
            </div>

            {/* Lock/Submit controls */}
            <div className="mt-8 pt-4">
              {coordinates && !isLocked && (
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add an optional comment..."
                  className="w-full bg-transparent border-b border-white/10 outline-none text-slate-300 placeholder:text-slate-600 font-mono text-sm py-2 mb-4"
                />
              )}
              {coordinates ? (
                <button
                  onClick={async () => {
                    if (isLocked) {
                      setIsLocked(false);
                      return;
                    }
                    setIsSubmitting(true);
                    try {
                      await handleLogMood(coordinates.x, coordinates.y, comment);
                      setComment("");
                      const logs = await fetchTodayLogs();
                      setTodayLogs(logs);
                      setIsLocked(true);
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
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
                      Saving...
                    </>
                  ) : isLocked ? (
                    <>
                      <ShieldCheck size={14} />
                      Telemetry Locked
                    </>
                  ) : (
                    <>
                      <MapPin size={14} />
                      Log Telemetry Coords
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
                    const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    const formattedTime = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                    const dateTimeString = `${formattedDate} • ${formattedTime}`;
                    const emotion = getEmotionFromCoords(log.x, log.y);
                    
                    return (
                      <div key={idx} className="flex flex-col gap-1.5 text-xs font-mono text-slate-400 bg-black/25 p-3 rounded-lg border border-white/5">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-200 font-semibold">{emotion}</span>
                            <span className="text-[10px] opacity-60">{dateTimeString}</span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] opacity-60 whitespace-nowrap pt-0.5">X: {log.x.toFixed(2)} | Y: {log.y.toFixed(2)}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <button 
                                onClick={() => handleVaultBridge(log, emotion)}
                                className="text-slate-500 hover:text-[#818cf8] transition-colors cursor-pointer"
                                title="Send to Vault"
                              >
                                {savedVaults[log.timestamp] ? (
                                  <Check size={12} className="text-[#81b29a] animate-pulse" />
                                ) : (
                                  <BookOpen size={12} />
                                )}
                              </button>
                              <button 
                                onClick={() => handleLogDelete(log.timestamp)}
                                className="text-slate-500 hover:text-[#e07a5f] transition-colors cursor-pointer"
                                title="Delete Log"
                              >
                                <X size={12} />
                              </button>
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
