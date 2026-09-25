import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVault } from '@/hooks/useVault';
import { getLocalMasterKey, encryptPayload } from '@/utils/crypto';

const GROUNDING_STEPS = [
  { count: 5, prompt: "things you see", instruction: "Look around and acknowledge five things you can see." },
  { count: 4, prompt: "things you feel", instruction: "Notice four things you can physically feel." },
  { count: 3, prompt: "things you hear", instruction: "Listen for three distinct sounds." },
  { count: 2, prompt: "things you smell", instruction: "Identify two things you can smell." },
  { count: 1, prompt: "thing you taste", instruction: "Acknowledge one thing you can taste." }
];

export function GroundingTool() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tapsRemaining, setTapsRemaining] = useState(GROUNDING_STEPS[0].count);
  
  // Reflection state
  const [reflection, setReflection] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const { saveJournalEntry } = useVault();

  const handleAcknowledge = () => {
    if (tapsRemaining > 1) {
      setTapsRemaining(prev => prev - 1);
    } else {
      // Move to next step
      if (currentStepIndex < GROUNDING_STEPS.length - 1) {
        const nextIndex = currentStepIndex + 1;
        setCurrentStepIndex(nextIndex);
        setTapsRemaining(GROUNDING_STEPS[nextIndex].count);
      } else {
        // Wizard finished
        setCurrentStepIndex(GROUNDING_STEPS.length);
      }
    }
  };

  const handleSaveReflection = async () => {
    if (!reflection.trim()) {
      setIsComplete(true);
      return;
    }

    setIsSaving(true);
    try {
      const masterKey = await getLocalMasterKey();
      if (!masterKey) throw new Error("Master key missing");

      const payload = JSON.stringify({
        title: "5-4-3-2-1 Grounding Reflection",
        content: reflection
      });

      const { ciphertext, iv } = await encryptPayload(payload, masterKey);
      
      // useVault's saveJournalEntry expects the raw string payload that will be stored in the DB
      // We stringify the ciphertext and IV so it fits in the single string column
      await saveJournalEntry(JSON.stringify({ ciphertext, iv }));
      
      setIsComplete(true);
    } catch (err) {
      console.error("Failed to save reflection", err);
    } finally {
      setIsSaving(false);
    }
  };

  const resetTool = () => {
    setCurrentStepIndex(0);
    setTapsRemaining(GROUNDING_STEPS[0].count);
    setReflection("");
    setIsComplete(false);
  };

  // 0 to 4 are the grounding steps. 5 is the reflection prompt.
  const isReflecting = currentStepIndex === GROUNDING_STEPS.length;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-8 bg-[#0f172a] rounded-xl border border-white/5 font-mono text-slate-200 min-h-[400px]">
      
      <div className="w-full text-center mb-8 h-8">
        <h2 className="text-sm uppercase tracking-widest text-slate-400">Cognitive Redirection</h2>
        <p className="text-[10px] opacity-50 mt-1">5-4-3-2-1 Grounding Protocol</p>
      </div>

      <div className="relative w-full flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!isReflecting && !isComplete && (
            <motion.div
              key={`step-${currentStepIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center w-full"
            >
              <div className="text-6xl font-light mb-4 text-white">
                {tapsRemaining}
              </div>
              <h3 className="text-xl uppercase tracking-wider mb-2 text-slate-300 text-center">
                {GROUNDING_STEPS[currentStepIndex].prompt}
              </h3>
              <p className="text-xs text-slate-500 text-center max-w-xs mb-10 h-8">
                {GROUNDING_STEPS[currentStepIndex].instruction}
              </p>

              <button
                onClick={handleAcknowledge}
                className="w-full max-w-[200px] py-4 rounded border border-white/10 bg-white/5 hover:bg-white/10 active:bg-white/20 transition-colors uppercase tracking-widest text-xs select-none touch-manipulation"
              >
                Acknowledge Item
              </button>
              
              {/* Progress indicators */}
              <div className="flex space-x-2 mt-8">
                {GROUNDING_STEPS.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx === currentStepIndex ? 'w-4 bg-slate-300' : idx < currentStepIndex ? 'w-1 bg-slate-600' : 'w-1 bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {isReflecting && !isComplete && (
            <motion.div
              key="reflection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center w-full"
            >
              <h3 className="text-sm uppercase tracking-wider mb-4 text-slate-300">
                Protocol Complete
              </h3>
              <label className="text-xs text-slate-500 mb-2">Push micro-reflection to Journal?</label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What brought you here? (Optional)"
                className="w-full h-24 bg-black/20 border border-white/10 rounded p-3 text-sm focus:outline-none focus:border-white/30 resize-none mb-6 placeholder-slate-700"
                disabled={isSaving}
              />
              <div className="flex space-x-3 w-full">
                <button
                  onClick={handleSaveReflection}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-slate-100 text-slate-900 rounded uppercase tracking-widest text-xs hover:bg-white transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Encrypting...' : reflection.trim() ? 'Save' : 'Skip'}
                </button>
              </div>
            </motion.div>
          )}

          {isComplete && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              <div className="w-12 h-12 rounded-full border border-slate-500 flex items-center justify-center mb-4">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
              </div>
              <p className="text-sm text-slate-400 uppercase tracking-widest mb-8">Nervous System Reset</p>
              
              <button
                onClick={resetTool}
                className="text-xs text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors"
              >
                Start Over
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
