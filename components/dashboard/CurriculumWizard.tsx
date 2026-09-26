"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTelemetry } from '@/hooks/useTelemetry';
import { CurriculumModuleMeta } from '@/content/curriculum/schema';

interface CurriculumWizardProps {
  steps: React.ReactNode[];
  meta: CurriculumModuleMeta;
}

// Background gradient logic based on step index
const getBackgroundGradient = (index: number, total: number) => {
  if (index === 0) return "radial-gradient(circle at 50% 50%, rgba(129,140,248,0.15) 0%, rgba(15,23,42,1) 100%)"; // Intro: Calm Blue
  if (index === 1) return "radial-gradient(circle at 50% 50%, rgba(224,122,95,0.1) 0%, rgba(15,23,42,1) 100%)"; // Observe: Dim/Alert Coral
  if (index === total - 2) return "radial-gradient(circle at 50% 50%, rgba(196,169,127,0.15) 0%, rgba(15,23,42,1) 100%)"; // Synthesize: Lucid Gold
  if (index === total - 1) return "radial-gradient(circle at 50% 50%, rgba(129,178,154,0.2) 0%, rgba(15,23,42,1) 100%)"; // Encrypted Vault: Regulated Sage
  return "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, rgba(15,23,42,1) 100%)"; // Default
};

export function CurriculumWizard({ steps, meta }: CurriculumWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();
  const { saveTelemetryLog } = useTelemetry();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const payload = {
        eventType: 'protocol_completed',
        moduleSlug: meta.slug,
        telemetryTag: meta.telemetryTag,
      };
      
      await saveTelemetryLog(
        new Date().toISOString(), 
        JSON.stringify({
          ciphertext: btoa(JSON.stringify(payload)),
          iv: btoa('demo-iv-not-secure')
        })
      );
      
      // Redirect to Growth Matrix for variable reward
      router.push('/dashboard/growth-matrix');
    } catch (e) {
      console.error(e);
      setIsCompleting(false);
    }
  };

  return (
    <div className="relative min-h-[70vh] flex flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-[#0f172a] shadow-2xl transition-all duration-1000"
         style={{ background: getBackgroundGradient(currentStep, steps.length) }}>
      
      {/* Progress Bar Header */}
      <div className="absolute top-0 left-0 w-full h-1 bg-black/50 z-20">
        <motion.div 
          className="h-full bg-[#81b29a]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      <div className="flex-1 relative w-full flex flex-col p-8 md:p-12 z-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center"
          >
            {steps[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="w-full bg-black/20 backdrop-blur-md border-t border-white/5 p-4 md:p-6 flex items-center justify-between z-20">
        <button 
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${
            currentStep === 0 ? 'opacity-30 cursor-not-allowed text-slate-500' : 'text-slate-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          <ArrowLeft size={16} /> Previous
        </button>
        
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div 
              key={i} 
              onClick={() => setCurrentStep(i)}
              className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${i === currentStep ? 'bg-[#81b29a] w-6' : 'bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>

        {currentStep === steps.length - 1 ? (
          <button 
            onClick={handleComplete}
            disabled={isCompleting}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#81b29a] text-[#0f172a] text-xs font-mono uppercase tracking-widest transition-all hover:bg-[#81b29a]/90 hover:scale-105 shadow-[0_0_20px_rgba(129,178,154,0.3)] disabled:opacity-50"
          >
            {isCompleting ? 'Encrypting...' : 'Complete Protocol'} <CheckCircle size={16} />
          </button>
        ) : (
          <button 
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest text-slate-300 hover:bg-white/5 hover:text-white transition-all"
          >
            Next <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
