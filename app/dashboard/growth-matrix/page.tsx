"use client";

import { useEffect, useState } from "react";
import { Compass, Info } from "lucide-react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { getLocalMasterKey, decryptPayload } from "@/utils/crypto";
import { CurriculumTelemetryEvent } from "@/types/telemetry";

type MatrixNode = { cx: number; cy: number; type: string; eventType?: string };

export default function GrowthMatrixPage() {
  const { loadTelemetryLogs } = useTelemetry();
  const [nodes, setNodes] = useState<MatrixNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAndPlot() {
      try {
        const logs = await loadTelemetryLogs();
        const key = await getLocalMasterKey();
        
        if (!key && logs.length > 0) {
          setError("Vault key not found. Please restore your key to view encrypted telemetry.");
          setIsLoading(false);
          return;
        }

        const events: CurriculumTelemetryEvent[] = [];
        
        // Logs might not be strictly sorted chronologically depending on how Dexie/Supabase returns them
        const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        for (const log of sortedLogs) {
          try {
            // Expecting encryptedPayload to be stringified {ciphertext, iv}
            const { ciphertext, iv } = JSON.parse(log.encryptedPayload);
            const decryptedString = await decryptPayload(ciphertext, iv, key!);
            events.push(JSON.parse(decryptedString));
          } catch (e) {
            console.warn("Failed to decrypt a log entry, skipping...", e);
            // It might not be a valid JSON or might be corrupted, we just skip to plot what we can
          }
        }

        const calculatedNodes = calculateTrajectory(events);
        setNodes(calculatedNodes);

      } catch (err: any) {
        console.error("Error loading growth matrix data:", err);
        setError("Failed to load growth matrix data.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAndPlot();
  }, [loadTelemetryLogs]);

  function calculateTrajectory(events: CurriculumTelemetryEvent[]): MatrixNode[] {
    const START_X = 150;
    const START_Y = 180;
    const SVG_WIDTH = 800;
    
    let logicalX = 0;
    let logicalY = 0;
    
    // Always start with the calibration root node
    const calculated: MatrixNode[] = [{ cx: START_X, cy: START_Y, type: 'start', eventType: 'calibration' }];
    
    events.forEach((event) => {
      // Modify logical coordinates based on the event's behavioral meaning
      if (event.eventType === 'biometric_delta_logged') {
        const delta = event.payload?.delta || 0; 
        logicalX += delta > 0 ? 1.5 : -0.5; // Positive shift moves right, negative shift stalls/pulls back
      } else if (event.eventType === 'vault_reflection_saved') {
        logicalY += 1.5; // Vault reflection drastically increases interoceptive accuracy (Y-axis)
        logicalX += 0.5; 
      } else if (event.eventType === 'protocol_completed') {
        logicalY += 0.5;
        logicalX += 1.0; // Protocol completion steadily increases adaptability
      }

      // Clamp coordinates to visual boundaries
      const cx = Math.min(START_X + (logicalX * 40), SVG_WIDTH - 50);
      const cy = Math.max(START_Y - (logicalY * 25), 40); 

      // Only add a distinct node if the user state has shifted enough to be visually distinct from the previous node
      const lastNode = calculated[calculated.length - 1];
      if (Math.abs(lastNode.cx - cx) > 15 || Math.abs(lastNode.cy - cy) > 15) {
         calculated.push({ cx, cy, type: 'node', eventType: event.eventType });
      }
    });

    return calculated;
  }

  const getColorForQuadrant = (node: MatrixNode, index: number, total: number) => {
    if (index === 0) return "#818cf8"; // Root Node (Blueish)
    if (index === total - 1) return "#faf9f6"; // Current Active State (White)
    if (node.eventType === 'vault_reflection_saved') return "#c4a97f"; // Insight (Gold/Tan)
    if (node.eventType === 'biometric_delta_logged') return "#e07a5f"; // Physical Shift (Orange/Coral)
    return "#81b29a"; // Regulated State (Sage Green)
  };

  return (
    <div className="min-h-screen p-6 lg:p-12 font-sans relative text-[#faf9f6]">
      <div className="max-w-4xl mx-auto mt-4 relative z-10">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-sm mb-4">
            <Compass size={12} className="text-[#81b29a] animate-spin" style={{ animationDuration: "6s" }} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#faf9f6]/60">Resilience Topology</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#faf9f6] mb-4 tracking-wide">
            Growth Matrix
          </h1>
          <p className="text-lg text-[#faf9f6]/60 font-light max-w-2xl">
            A topological visualization of your nervous system state dynamics over time. Watch your tree grow with each completed session.
          </p>
        </div>

        {/* Matrix Visualization */}
        <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[380px] mb-8">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#81b29a]/5 blur-[120px] pointer-events-none rounded-full"></div>
          
          <div className="flex justify-between items-start mb-6 z-10 relative">
            <div>
              <h2 className="text-lg font-serif">State Transitions</h2>
              <p className="text-xs text-[#faf9f6]/40 font-light mt-1">
                {isLoading ? "Decrypting telemetry..." : error ? <span className="text-red-400">{error}</span> : "Nodal trajectory map."}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#81b29a]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#81b29a] animate-pulse"></span>
              <span>{nodes.length} Calibration Points Registered</span>
            </div>
          </div>

          {/* SVG Node Tree */}
          <div className="flex-1 w-full flex items-center justify-center my-6 relative min-h-[220px]">
            <svg width="100%" height="220" className="opacity-80 overflow-visible">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#c4a97f" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#81b29a" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              
              {!isLoading && nodes.length === 1 && !error && (
                <text x="50%" y="50%" textAnchor="middle" fill="#faf9f6" opacity="0.3" fontSize="12" fontFamily="monospace">
                  Complete your first module to begin tracking.
                </text>
              )}

              {/* Dynamic Path Connections */}
              {!isLoading && nodes.map((node, index) => {
                if (index === 0) return null;
                const prev = nodes[index - 1];
                const isLast = index === nodes.length - 1;
                return (
                  <path 
                    key={`path-${index}`}
                    d={`M ${prev.cx} ${prev.cy} Q ${(prev.cx + node.cx)/2} ${(prev.cy + node.cy)/2 - 20} ${node.cx} ${node.cy}`} 
                    fill="none" 
                    stroke="url(#lineGrad)" 
                    strokeWidth={isLast ? "3" : "2"}
                    strokeDasharray={isLast ? "5 5" : "none"}
                    className={isLast ? "animate-pulse" : ""}
                  />
                );
              })}
              
              {/* Dynamic Node Circles */}
              {!isLoading && nodes.map((node, index) => {
                const isLast = index === nodes.length - 1;
                return (
                  <g key={`node-${index}`}>
                    <circle 
                      cx={node.cx} 
                      cy={node.cy} 
                      r={isLast ? 6 : 5} 
                      fill={getColorForQuadrant(node, index, nodes.length)} 
                      className={isLast ? "animate-pulse" : ""} 
                    />
                    {(isLast || index === 0) && (
                      <text 
                        x={node.cx - 20} 
                        y={node.cy + 20} 
                        fill="#faf9f6" 
                        opacity="0.4" 
                        fontSize="10" 
                        fontFamily="monospace"
                      >
                        {index === 0 ? "Node A (Start)" : `Current State`}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="border-t border-white/5 pt-4 flex justify-between text-[11px] font-mono text-[#faf9f6]/40 z-10 relative">
            <span>Grid Bounds: Stable Baseline</span>
            <span>Scale: Logarithmic</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-black/25 border border-white/5 rounded-2xl p-5 text-xs font-mono leading-relaxed text-[#faf9f6]/40 flex gap-3 items-start relative z-10">
          <Info size={16} className="text-[#81b29a] shrink-0 mt-0.5" />
          <p>
            The Growth Matrix correlates your respiration logs, grounding sessions, and mood coordinates to build a multidimensional picture of autonomic regulation over time. Data is processed entirely inside the browser container using Web Crypto AES-GCM.
          </p>
        </div>
      </div>
    </div>
  );
}
