import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTelemetry } from '@/hooks/useTelemetry';
import { getEmotionFromCoords } from '@/utils/emotionEngine';
import { getLocalMasterKey, encryptPayload, decryptPayload } from '@/utils/crypto';

interface Coordinate {
  x: number;
  y: number;
}

export function MoodMatrix() {
  const [selectedPoint, setSelectedPoint] = useState<Coordinate | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<Coordinate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  
  const { saveTelemetryLog, loadTelemetryLogs } = useTelemetry();

  // Convert mouse/touch event to grid coordinates (-1.0 to 1.0)
  const getCoordsFromEvent = (e: React.PointerEvent<HTMLDivElement>): Coordinate | null => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const xClick = e.clientX - rect.left;
    const yClick = e.clientY - rect.top;

    // Clamp coordinates strictly within grid boundaries
    const clampedX = Math.max(0, Math.min(xClick, rect.width));
    const clampedY = Math.max(0, Math.min(yClick, rect.height));

    const x = (clampedX / rect.width) * 2 - 1;
    const y = -((clampedY / rect.height) * 2 - 1);
    
    return { x, y };
  };

  const handlePointerDown = async (e: React.PointerEvent<HTMLDivElement>) => {
    if (isLoading) return;
    
    const coords = getCoordsFromEvent(e);
    if (!coords) return;
    
    setSelectedPoint(coords);
    setHoveredPoint(null); // Clear hover on select
    setIsLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const masterKey = await getLocalMasterKey();
      
      if (!masterKey) {
        console.error("Master key not found. Cannot encrypt payload.");
        setIsLoading(false);
        return;
      }

      // Fetch today's logs to append
      const allLogs = await loadTelemetryLogs();
      const todayLogObj = allLogs.find(log => log.date === today);
      
      let parsedArray: unknown[] = [];
      if (todayLogObj && todayLogObj.encryptedPayload) {
        try {
          const { ciphertext, iv } = JSON.parse(todayLogObj.encryptedPayload);
          const decryptedStr = await decryptPayload(ciphertext, iv, masterKey);
          parsedArray = JSON.parse(decryptedStr);
        } catch (err) {
          console.error("Failed to decrypt or parse existing payload. Starting fresh.", err);
          parsedArray = [];
        }
      }

      // Append new point
      const newPoint = {
        x: coords.x,
        y: coords.y,
        timestamp: new Date().toISOString()
      };
      parsedArray.push(newPoint);

      // Encrypt and save
      const plaintext = JSON.stringify(parsedArray);
      const { ciphertext, iv } = await encryptPayload(plaintext, masterKey);
      
      await saveTelemetryLog(today, JSON.stringify({ ciphertext, iv }));

    } catch (error) {
      console.error("Failed to log mood", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isLoading || e.pointerType === 'touch') return; // Disable hover effects for touch screens
    const coords = getCoordsFromEvent(e);
    if (coords) setHoveredPoint(coords);
  };

  const handlePointerLeave = () => {
    setHoveredPoint(null);
  };

  // Prioritize hover point for exploration, fallback to selected point
  const activePoint = hoveredPoint || selectedPoint;
  const activeEmotion = activePoint 
    ? getEmotionFromCoords(activePoint.x, activePoint.y) 
    : 'Awaiting Input';

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-4">
      {/* Header Info */}
      <div className="w-full flex justify-between items-end px-2 font-mono text-sm text-slate-400">
        <div>
          <h2 className="text-slate-200 font-medium tracking-wide uppercase text-xs">Affect Matrix</h2>
          <p className="text-[10px] opacity-70 mt-1 uppercase tracking-wider">Valence / Arousal</p>
        </div>
        <div className="text-right">
          <p className="text-slate-100 font-medium tracking-wide uppercase text-xs">{activeEmotion}</p>
          <div className="text-[10px] opacity-50 mt-1 min-h-[14px]">
            {activePoint ? `[${activePoint.x.toFixed(2)}, ${activePoint.y.toFixed(2)}]` : '[--.--, --.--]'}
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div 
        ref={gridRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={`relative w-full aspect-square bg-[#0f172a] border border-white/5 rounded-xl overflow-hidden shadow-inner cursor-crosshair touch-none ${
          isLoading ? 'opacity-60 pointer-events-none transition-opacity duration-300' : ''
        }`}
      >
        {/* Background layer */}
        <div className="absolute inset-0 bg-black/25" />

        {/* X and Y Axes (Center lines) */}
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-slate-500/30 -translate-y-1/2" />
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-500/30 -translate-x-1/2" />

        {/* Minimal Tick Marks */}
        <div className="absolute left-1/4 right-1/4 top-1/2 h-[1px] border-x border-slate-500/30 -translate-y-1/2" />
        <div className="absolute top-1/4 bottom-1/4 left-1/2 w-[1px] border-y border-slate-500/30 -translate-x-1/2" />

        {/* Subtle Quadrant Labels */}
        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-500 select-none tracking-widest">AROUSAL +</span>
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-500 select-none tracking-widest">AROUSAL -</span>
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-500 select-none -rotate-90 origin-center tracking-widest whitespace-nowrap">VALENCE -</span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-500 select-none rotate-90 origin-center tracking-widest whitespace-nowrap">VALENCE +</span>

        {/* Selected / Hovered Point Crosshair using Framer Motion */}
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
            <div className="absolute -left-1 -top-1 w-2 h-2 bg-slate-300 rounded-full shadow-[0_0_8px_rgba(203,213,225,0.4)]" />
            
            {/* Crosshair lines */}
            <div className="absolute -left-[0.5px] -top-6 w-[1px] h-12 bg-slate-400/30" />
            <div className="absolute -left-6 -top-[0.5px] w-12 h-[1px] bg-slate-400/30" />
          </motion.div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex space-x-1 p-3 bg-black/40 rounded border border-white/5 backdrop-blur-sm">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
            </div>
          </div>
        )}
      </div>

      <div className="w-full text-center min-h-[16px]">
        {isLoading ? (
          <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Encrypting & writing securely...</span>
        ) : (
          <span className="text-[10px] text-slate-500/70 font-mono tracking-widest uppercase">Tap grid to log coordinate state</span>
        )}
      </div>
    </div>
  );
}
