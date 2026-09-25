import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTelemetry } from '@/hooks/useTelemetry';
import { getLocalMasterKey, decryptPayload } from '@/utils/crypto';
import { getEmotionFromCoords } from '@/utils/emotionEngine';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface ChartPoint {
  x: number; // Time
  y: number; // Arousal
  valence: number;
  arousal: number;
  date: string;
  timestamp: number;
  emotion: string;
}

export function WeeklyReport() {
  const { isPremium } = useAuthStore();
  const { loadTelemetryLogs } = useTelemetry();
  const [data, setData] = useState<ChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

        const parsedPoints: ChartPoint[] = [];

        // Determine the cutoff for "past 14 days"
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        const cutoffTimestamp = fourteenDaysAgo.getTime();

        for (const log of logs) {
          const logDate = new Date(log.date).getTime();
          // Skip entire day if it's older than 14 days
          if (logDate < cutoffTimestamp) continue;

          if (log.encryptedPayload) {
            try {
              const { ciphertext, iv } = JSON.parse(log.encryptedPayload);
              const decryptedStr = await decryptPayload(ciphertext, iv, masterKey);
              const pointArray = JSON.parse(decryptedStr);

              if (Array.isArray(pointArray)) {
                pointArray.forEach((pt: { timestamp: string; x: number; y: number }) => {
                  const ptTimestamp = new Date(pt.timestamp).getTime();
                  if (ptTimestamp >= cutoffTimestamp) {
                    parsedPoints.push({
                      x: ptTimestamp,
                      y: pt.y, // Mapping Arousal to Y-axis 
                      valence: pt.x,
                      arousal: pt.y,
                      date: log.date,
                      timestamp: ptTimestamp,
                      emotion: getEmotionFromCoords(pt.x, pt.y)
                    });
                  }
                });
              }
            } catch (e) {
              console.warn("Failed to decrypt log for WeeklyReport", e);
            }
          }
        }
        
        parsedPoints.sort((a, b) => a.timestamp - b.timestamp);

        if (isMounted) {
          setData(parsedPoints);
        }
      } catch (err) {
        console.error("Failed to load weekly report data", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchData();
    return () => { isMounted = false; };
  }, [loadTelemetryLogs]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: ChartPoint }[] }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as ChartPoint;
      const formattedDate = new Date(dataPoint.timestamp).toLocaleDateString([], {
        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      return (
        <div className="bg-[#0f172a] border border-white/10 rounded px-3 py-2 shadow-xl pointer-events-none">
          <p className="text-[10px] text-slate-400 font-mono mb-1">{formattedDate}</p>
          <p className="text-xs font-medium text-slate-100 uppercase tracking-widest">{dataPoint.emotion}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-1">
            Valence: {dataPoint.valence.toFixed(2)} | Arousal: {dataPoint.arousal.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatXAxis = (tickItem: number) => {
    const d = new Date(tickItem);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-[#0f172a] rounded-xl border border-white/5 font-mono text-slate-200">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-sm uppercase tracking-widest text-slate-300">Pattern Recognition</h2>
        <p className="text-[10px] opacity-50 mt-1 uppercase">14-Day Autonomic Volatility</p>
      </div>

      {/* Chart Container */}
      <div className="relative w-full h-[320px]">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
             <div className="w-5 h-5 border-2 border-white/10 border-t-slate-400 rounded-full animate-spin" />
             <p className="text-[10px] text-slate-500 uppercase mt-4 tracking-widest animate-pulse">Decrypting Local Vault...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
             <p className="text-[10px] text-slate-600 uppercase tracking-widest">Insufficient Data for Pattern Recognition</p>
          </div>
        ) : (
          <div className="w-full h-full relative overflow-hidden rounded select-none">
            
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                {/* 5% Opacity Minimal Grid */}
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
                
                <XAxis 
                  dataKey="x"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={formatXAxis}
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                  axisLine={{ stroke: '#334155', strokeWidth: 1 }}
                  tickLine={{ stroke: '#334155' }}
                />
                
                <YAxis 
                  dataKey="y"
                  type="number" 
                  domain={[-1, 1]}
                  ticks={[-1, -0.5, 0, 0.5, 1]}
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                  axisLine={{ stroke: '#334155', strokeWidth: 1 }}
                  tickLine={{ stroke: '#334155' }}
                />
                
                {/* Uniform dot sizing */}
                <ZAxis type="number" range={[25, 25]} />

                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1', strokeOpacity: 0.2 }} 
                />
                
                <Scatter 
                  name="Autonomic State" 
                  data={data} 
                  fill="#f8fafc" // Slate-50 for high contrast clinical dots
                  opacity={0.8}
                />
              </ScatterChart>
            </ResponsiveContainer>

            {/* The Growth/Premium Paywall Overlay */}
            {!isPremium && (
              <div className="absolute inset-y-0 left-0 w-2/3 flex items-center justify-center z-10 pointer-events-auto">
                {/* CSS Backdrop Blur and Masking Gradient */}
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md [mask-image:linear-gradient(to_right,black_60%,transparent_100%)]" />
                
                {/* CTA Button */}
                <button 
                  onClick={() => console.log('Initiate Stripe Checkout')}
                  className="relative z-20 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-slate-100 text-[10px] font-semibold tracking-widest uppercase rounded shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all duration-300"
                >
                  Unlock Deep Pattern Recognition ($4.99/mo)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
