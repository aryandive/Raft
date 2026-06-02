"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getLocalMasterKey } from "@/utils/crypto";
import { createClient } from "@/utils/supabase/client";
import { Mail, Lock, Shield, ArrowRight, Eye, EyeOff, User } from "lucide-react";

type AuthMode = "signup" | "signin";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    
    if (mode === "signup") {
      // Supabase Signup Integration
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) {
        console.error("Signup error:", error.message);
        alert(error.message);
        return;
      }
      
      router.push("/onboarding/vault");
    } else {
      // Supabase Signin Integration
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Signin error:", error.message);
        alert(error.message);
        return;
      }
      
      const localKey = await getLocalMasterKey();
      if (!localKey) {
        router.push('/onboarding/restore'); // Key missing from IndexedDB -> Restore
      } else {
        router.push('/dashboard'); // Key exists locally -> Send to Sanctuary
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#faf9f6] flex flex-col lg:flex-row font-sans">
      
      {/* Left Side: Visual / Ambient Gradient */}
      <div className="relative lg:w-5/12 flex flex-col justify-between p-10 lg:p-16 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
        {/* Ambient background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-[#818cf8]/20 z-0"></div>
        
        {/* Soft floating orb */}
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[50%] bg-[#818cf8] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c4a97f] to-[#e07a5f] flex items-center justify-center shadow-lg shadow-[#c4a97f]/20">
            <Shield size={20} className="text-[#0f172a]" fill="currentColor" />
          </div>
          <span className="text-2xl font-serif tracking-widest text-white">RAFT</span>
        </div>

        <div className="relative z-10 mt-20 lg:mt-0 lg:mb-20">
          <h1 className="text-5xl lg:text-6xl font-serif text-[#faf9f6] tracking-wide leading-tight">
            Secure your<br/>
            <span className="text-[#818cf8] italic">sanctuary.</span>
          </h1>
          <p className="mt-6 text-lg text-[#faf9f6]/60 font-light max-w-sm">
            End-to-end encryption ensures your thoughts remain entirely yours.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 relative z-10">
        <div className="w-full max-w-md">
          
          {/* Form Container */}
          <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl">
            
            {/* Toggle */}
            <div className="flex p-1 bg-black/20 rounded-xl mb-10">
              <button 
                onClick={() => setMode("signup")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === "signup" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white/80"}`}
              >
                Create Account
              </button>
              <button 
                onClick={() => setMode("signin")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === "signin" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white/80"}`}
              >
                Sign In
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                
                {mode === "signup" && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={18} className="text-[#faf9f6]/40 group-focus-within:text-[#818cf8] transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="First Name (or Alias)"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-[#faf9f6] placeholder:text-[#faf9f6]/30 focus:outline-none focus:border-[#818cf8]/50 focus:ring-1 focus:ring-[#818cf8]/50 transition-all"
                    />
                  </div>
                )}

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-[#faf9f6]/40 group-focus-within:text-[#818cf8] transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    placeholder="Email address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-[#faf9f6] placeholder:text-[#faf9f6]/30 focus:outline-none focus:border-[#818cf8]/50 focus:ring-1 focus:ring-[#818cf8]/50 transition-all"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-[#faf9f6]/40 group-focus-within:text-[#818cf8] transition-colors" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-11 pr-11 text-[#faf9f6] placeholder:text-[#faf9f6]/30 focus:outline-none focus:border-[#818cf8]/50 focus:ring-1 focus:ring-[#818cf8]/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#faf9f6]/30 hover:text-[#faf9f6]/70 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-[#818cf8] hover:bg-[#818cf8]/90 text-white rounded-xl font-medium shadow-[0_0_20px_-5px_rgba(129,140,248,0.4)] hover:shadow-[0_0_25px_-5px_rgba(129,140,248,0.6)] transition-all group"
              >
                {mode === "signup" ? "Generate Vault" : "Unlock Vault"}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-8 flex items-center gap-4 before:h-px before:flex-1 before:bg-white/5 after:h-px after:flex-1 after:bg-white/5">
              <span className="text-xs text-[#faf9f6]/30 uppercase tracking-widest">or</span>
            </div>

            <div className="mt-8 relative group">
              <button 
                disabled
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-white/5 border border-white/5 text-white/30 rounded-xl font-medium cursor-not-allowed"
              >
                <svg className="w-5 h-5 opacity-40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              {/* Coming Soon Badge */}
              <div className="absolute -top-3 -right-2 bg-[#e07a5f] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-lg rotate-3 z-10">
                Coming Soon
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
