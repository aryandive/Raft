"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";

type Question = {
  id: string;
  title: string;
  options: string[];
};

const questions: Question[] = [
  {
    id: "reason",
    title: "What brings you to Raft today?",
    options: [
      "I need to interrupt a panic/stress spike.",
      "I want to track my emotional patterns.",
      "I am dealing with chronic burnout."
    ]
  },
  {
    id: "nervous_system",
    title: "How does your nervous system feel right now?",
    options: [
      "Overstimulated & Racing",
      "Numb & Exhausted",
      "Baseline but fragile"
    ]
  },
  {
    id: "goal",
    title: "What is your primary goal for the next 30 days?",
    options: [
      "Learn to manually regulate my stress.",
      "Build a consistent daily logging habit.",
      "Just find a safe place to vent."
    ]
  }
];

export default function CalibrationPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize with a slight delay for aesthetic fade in
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSelect = (option: string) => {
    if (isAnimating) return;
    
    const currentQ = questions[currentIndex];
    const newAnswers = { ...answers, [currentQ.id]: option };
    setAnswers(newAnswers);
    setIsAnimating(true);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsAnimating(false);
      } else {
        // Save to sessionStorage before routing
        sessionStorage.setItem("raft_calibration", JSON.stringify(newAnswers));
        router.push("/auth");
      }
    }, 500); // Wait for fade-out animation
  };

  const currentQ = questions[currentIndex];

  if (!mounted) return <div className="min-h-screen bg-[#0f172a]" />; // Prevent hydration mismatch

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#faf9f6] flex flex-col justify-center items-center p-6 font-sans selection:bg-[#818cf8]/30">
      <div className="max-w-xl w-full flex flex-col min-h-[400px] justify-between relative">
        
        {/* Main Content Area */}
        <div 
          className={`flex-1 flex flex-col justify-center space-y-10 transition-all duration-500 ease-in-out transform
            ${isAnimating ? "opacity-0 translate-y-4 scale-95 blur-[2px]" : "opacity-100 translate-y-0 scale-100 blur-0"}
          `}
        >
          <h2 className="text-3xl md:text-4xl font-serif text-[#faf9f6] tracking-wide text-center leading-relaxed">
            {currentQ.title}
          </h2>

          <div className="flex flex-col space-y-4">
            {currentQ.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleSelect(option)}
                className="w-full text-left p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#818cf8]/40 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#818cf8]/0 via-[#818cf8]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative z-10 text-lg text-[#faf9f6]/90 group-hover:text-white group-hover:pl-2 transition-all duration-300">
                  {option}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* The Privacy Tag */}
        <div className="pt-16 pb-4 flex flex-col items-center justify-center text-center opacity-60">
          <Shield size={16} className="text-[#81b29a] mb-3" />
          <p className="text-sm text-[#faf9f6] max-w-sm leading-relaxed font-light">
            Your responses are used to calibrate your dashboard. They will be client-side encrypted upon account creation.
          </p>
        </div>

      </div>
    </div>
  );
}
