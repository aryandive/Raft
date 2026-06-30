import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTelemetry } from '@/hooks/useTelemetry';
import { getLocalMasterKey, decryptPayload } from '@/utils/crypto';

interface BranchPath {
  d: string;
  delay: number;
}

export function GrowthMatrix() {
  const [totalLogCount, setTotalLogCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { loadTelemetryLogs } = useTelemetry();

  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      try {
        setIsLoading(true);
        const logs = await loadTelemetryLogs();
        const masterKey = await getLocalMasterKey();
        
        if (!masterKey) {
          if (isMounted) setIsLoading(false);
          return; 
        }

        let count = 0;
        for (const log of logs) {
          if (log.encryptedPayload) {
            try {
              const { ciphertext, iv } = JSON.parse(log.encryptedPayload);
              const decryptedStr = await decryptPayload(ciphertext, iv, masterKey);
              const parsedArray = JSON.parse(decryptedStr);
              if (Array.isArray(parsedArray)) {
                count += parsedArray.length;
              }
            } catch (e) {
              // Ignore corrupted logs gracefully
              console.warn("Failed to decrypt a log entry", e);
            }
          }
        }
        
        if (isMounted) {
          setTotalLogCount(count);
        }
      } catch (err) {
        console.error("Failed to load growth data", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [loadTelemetryLogs]);

  // Generate fractal tree paths based on the total log count
  const treePaths = useMemo(() => {
    const paths: BranchPath[] = [];
    
    // Tree starts near the bottom center of a 400x400 viewBox
    const startX = 200;
    const startY = 360;
    
    let maxDepth = 0;
    if (totalLogCount > 0) maxDepth = 1; // Basic Trunk
    if (totalLogCount >= 5) maxDepth = 2; // Primary Branches
    if (totalLogCount >= 10) maxDepth = 3;
    if (totalLogCount >= 15) maxDepth = 4; // Fractal Nodes
    if (totalLogCount >= 25) maxDepth = 5;
    if (totalLogCount >= 40) maxDepth = 6;
    
    function drawBranch(x: number, y: number, angle: number, length: number, depth: number, delayAcc: number) {
      if (depth > maxDepth) return;
      
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;
      
      paths.push({
        d: `M ${x} ${y} L ${endX} ${endY}`,
        delay: delayAcc
      });
      
      const branchDelay = delayAcc + 0.3;
      
      // Clinical geometric spreading (tightens as depth increases)
      const spread = Math.PI / (3.5 + depth * 0.5); 
      
      // Left and right branches
      drawBranch(endX, endY, angle - spread, length * 0.75, depth + 1, branchDelay);
      drawBranch(endX, endY, angle + spread, length * 0.75, depth + 1, branchDelay);
      
      // Center structural spine occasionally for higher complexity
      if (depth > 1 && depth % 2 === 1 && maxDepth >= 4) {
         drawBranch(endX, endY, angle, length * 0.6, depth + 1, branchDelay);
      }
    }
    
    if (maxDepth > 0) {
      drawBranch(startX, startY, -Math.PI / 2, 85, 1, 0);
    } else {
      // 0 logs: Render a baseline "seed" only
      paths.push({
        d: `M 180 360 L 220 360`,
        delay: 0
      });
    }
    
    return paths;
  }, [totalLogCount]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 bg-[#0f172a] rounded-xl border border-white/5 font-mono text-slate-200">
      
      {/* Header */}
      <div className="w-full text-left mb-6">
        <h2 className="text-sm uppercase tracking-widest text-slate-300">Growth Matrix</h2>
        <p className="text-[10px] opacity-50 mt-1 uppercase">Constructed Data Visualisation</p>
      </div>

      {/* SVG Container (Fixed size to guarantee zero CLS) */}
      <div className="relative w-full aspect-square max-w-[320px] mx-auto bg-black/25 rounded border border-white/5 shadow-inner overflow-hidden flex items-center justify-center">
        {isLoading ? (
          <div className="absolute w-full h-[1px] bg-slate-500/20 top-[90%] left-0 animate-pulse" />
        ) : (
          <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
            {treePaths.map((path, i) => (
              <motion.path
                key={i}
                d={path.d}
                stroke="currentColor"
                strokeWidth={Math.max(1, 4 - (path.delay * 1.5))} // Thinner lines for deeper branches
                strokeLinecap="round"
                fill="transparent"
                className="text-slate-300"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: 1.5,
                  delay: path.delay,
                  ease: "easeOut"
                }}
              />
            ))}
            
            {/* Base anchor point */}
            <motion.circle
              cx="200"
              cy="360"
              r="3"
              fill="currentColor"
              className="text-slate-200"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </svg>
        )}
      </div>

      {/* Investment Readout */}
      <div className="w-full mt-6 p-3 bg-black/30 rounded border border-white/5 flex justify-between items-center">
        <span className="text-[10px] text-slate-500 tracking-widest uppercase">
          Total_Encrypted_Nodes
        </span>
        <span className="text-xs text-white font-medium">
          {isLoading ? '--' : `[${totalLogCount}]`}
        </span>
      </div>
    </div>
  );
}
