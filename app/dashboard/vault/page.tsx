"use client";

import { useState, useEffect, useMemo } from "react";
import { Playfair_Display } from "next/font/google";
import { Eye, EyeOff, Lock, Shield, Loader2, CalendarIcon, Search, AlertCircle, Check } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { getLocalMasterKey, encryptPayload, decryptPayload, saveDraftLocally, getLocalDraft, clearLocalDraft } from "@/utils/crypto";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

interface JournalEntry {
  id: string;
  user_id: string;
  encrypted_payload: string;
  iv: string;
  entry_date: string;
  created_at: string;
  decrypted_title?: string;
  decrypted_content?: string;
  is_failed_decryption?: boolean;
}

// Custom hook to debounce search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function VaultPage() {
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Editor State
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [placeholderPrompt, setPlaceholderPrompt] = useState("What's on your mind? Everything you write here is encrypted before it leaves your device...");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isSealed, setIsSealed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Calendar & Feed State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [entryDates, setEntryDates] = useState<Set<string>>(new Set());
  const [feedEntries, setFeedEntries] = useState<JournalEntry[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  
  // ZK Search State
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<JournalEntry[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Global Error State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState<Set<string>>(new Set());

  const supabase = createClient();

  // Load Key, Auth, and Entry Dates on mount
  useEffect(() => {
    const fetchEntryDates = async (uid: string) => {
      try {
        const { data, error } = await supabase
          .from("journal_entries")
          .select("entry_date")
          .eq("user_id", uid);
          
        if (error) throw new Error("DB Error: " + error.message);
        
        const dates = new Set<string>();
        data?.forEach(row => {
          if (row.entry_date) dates.add(row.entry_date);
        });
        setEntryDates(dates);
      } catch (err) {
        console.error("Failed to fetch calendar dates", err);
        setErrorMsg(err instanceof Error ? err.message : "Failed to fetch calendar dates.");
      }
    };

    async function init() {
      try {
        setErrorMsg(null);
        
        const key = await getLocalMasterKey();
        if (!key) throw new Error("Master key not found. Please set up your vault first.");
        setMasterKey(key);
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw new Error("Auth Error: " + authError.message);
        if (!user) throw new Error("User not authenticated.");
        setUserId(user.id);
        
        await fetchEntryDates(user.id);
      } catch (err) {
        console.error("Initialization error:", err);
        setErrorMsg(err instanceof Error ? err.message : "Failed to initialize vault.");
      }
    }
    init();
  }, [supabase]);

  const decryptEntries = async (entries: JournalEntry[], key: CryptoKey): Promise<JournalEntry[]> => {
    return Promise.all(
      entries.map(async (entry) => {
        try {
          const rawString = await decryptPayload(entry.encrypted_payload, entry.iv, key);
          const parsed = JSON.parse(rawString);
          return {
            ...entry,
            decrypted_title: parsed.title || "",
            decrypted_content: parsed.content || "",
            is_failed_decryption: false
          };
        } catch (e) {
          console.error("Decryption failed for entry", entry.id, e);
          return {
            ...entry,
            decrypted_title: "⚠️ Decryption Failed",
            decrypted_content: "Data might be tampered or master key is invalid.",
            is_failed_decryption: true
          };
        }
      })
    );
  };

  // Hydrate draft or fetch from Supabase when entryDate changes
  useEffect(() => {
    async function loadEntryForDate() {
      if (!masterKey || !entryDate || !userId) return;
      const dateStr = format(entryDate, "yyyy-MM-dd");
      
      setIsDecrypting(true);
      try {
        // 1. Prioritize Local Draft
        const draft = await getLocalDraft(dateStr);
        if (draft) {
          const rawString = await decryptPayload(draft.ciphertext, draft.iv, masterKey);
          const parsed = JSON.parse(rawString);
          setTitle(parsed.title || "");
          setContent(parsed.content || "");
          return;
        }
        
        // 2. Fetch from Supabase
        const { data, error } = await supabase
          .from("journal_entries")
          .select("encrypted_payload, iv")
          .eq("user_id", userId)
          .eq("entry_date", dateStr)
          .maybeSingle();
          
        if (error) {
          console.error("Supabase fetch error:", error);
          setTitle("");
          setContent("");
        } else if (data) {
          const rawString = await decryptPayload(data.encrypted_payload, data.iv, masterKey);
          const parsed = JSON.parse(rawString);
          setTitle(parsed.title || "");
          setContent(parsed.content || "");
        } else {
          setTitle("");
          setContent("");
        }
      } catch (err) {
        console.error("Failed to load entry", err);
        setTitle("");
        setContent("");
      } finally {
        setIsDecrypting(false);
      }
    }
    loadEntryForDate();
  }, [entryDate, masterKey, userId, supabase]);

  // Debounced auto-save for drafts
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!masterKey || !entryDate || !userId) return;
      const dateStr = format(entryDate, "yyyy-MM-dd");
      
      if (!content.trim() && !title.trim()) {
        await clearLocalDraft(dateStr);
        return;
      }
      
      try {
        const rawData = JSON.stringify({ title: title.trim(), content: content.trim() });
        const { ciphertext, iv } = await encryptPayload(rawData, masterKey);
        await saveDraftLocally(dateStr, ciphertext, iv);
      } catch (err) {
        console.error("Failed to auto-save draft", err);
      }
    }, 2000);

    return () => clearTimeout(handler);
  }, [title, content, entryDate, masterKey, userId]);

  // Blank Page Syndrome idle timer
  useEffect(() => {
    if (content.trim() !== "") {
      setPlaceholderPrompt("What's on your mind? Everything you write here is encrypted before it leaves your device...");
      return;
    }
    const handler = setTimeout(() => {
      setPlaceholderPrompt("What is the minimum viable day today?");
    }, 10000);
    return () => clearTimeout(handler);
  }, [content]);

  // Fetch standard feed when selectedDate changes (and we aren't searching)
  useEffect(() => {
    async function loadFeed() {
      if (!selectedDate || !userId || !masterKey || debouncedSearch.trim() !== "") return;
      
      setIsLoadingFeed(true);
      setErrorMsg(null);
      
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        
        const { data, error } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("user_id", userId)
          .eq("entry_date", dateStr)
          .order("created_at", { ascending: false });
          
        if (error) throw new Error("DB Error: " + error.message);
        
        const decrypted = await decryptEntries(data || [], masterKey);
        setFeedEntries(decrypted);
      } catch (err) {
        console.error("Failed to load feed", err);
        setErrorMsg(err instanceof Error ? err.message : "Failed to load journal entries.");
      } finally {
        setIsLoadingFeed(false);
      }
    }
    
    loadFeed();
  }, [selectedDate, userId, masterKey, debouncedSearch, supabase]);

  // ZK Search Effect
  useEffect(() => {
    async function performSearch() {
      if (!userId || !masterKey) return;
      
      if (debouncedSearch.trim() === "") {
        setIsSearching(false);
        setHasSearched(false);
        return;
      }
      
      setIsSearching(true);
      setHasSearched(true);
      setErrorMsg(null);
      
      try {
        const { data, error } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
          
        if (error) throw new Error("DB Search Error: " + error.message);
        
        // Decrypt ALL entries locally
        const decrypted = await decryptEntries(data || [], masterKey);
        
        // Filter in RAM
        const query = debouncedSearch.toLowerCase();
        const results = decrypted.filter(entry => {
          if (entry.is_failed_decryption) return false;
          const matchTitle = entry.decrypted_title?.toLowerCase().includes(query) || false;
          const matchContent = entry.decrypted_content?.toLowerCase().includes(query) || false;
          return matchTitle || matchContent;
        });
        
        setSearchResults(results);
      } catch(err) {
        console.error("Search failed", err);
        setErrorMsg(err instanceof Error ? err.message : "Local ZK Search failed.");
      } finally {
        setIsSearching(false);
      }
    }
    
    performSearch();
  }, [debouncedSearch, userId, masterKey, supabase]);

  const handleSealEntry = async () => {
    if (!content.trim() || !entryDate) return;
    
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      console.log("1. Starting Seal process...");
      
      console.log("2. Fetching Supabase session...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("User not authenticated.");
      }
      console.log("3. Session retrieved:", user.id);
      
      if (!masterKey) {
        throw new Error("Encryption failed. Missing local key.");
      }

      console.log("4. Encrypting payload...");
      const rawData = JSON.stringify({ title: title.trim(), content: content.trim() });
      const { ciphertext, iv } = await encryptPayload(rawData, masterKey);
      
      if (!ciphertext || !iv) {
        throw new Error("Encryption failed. Missing local key.");
      }
      
      console.log("5. Payload encrypted. IV:", iv);
      console.log("6. Pushing to Supabase...");
      
      const dateStr = format(entryDate, "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("journal_entries")
        .upsert(
          { 
            user_id: user.id,
            encrypted_payload: ciphertext, 
            iv,
            entry_date: dateStr
          },
          { onConflict: 'user_id, entry_date' }
        )
        .select()
        .single();
        
      if (error) throw new Error("Upsert Error: " + error.message);
      
      const newEntry: JournalEntry = {
        ...data,
        decrypted_title: title.trim(),
        decrypted_content: content.trim(),
        is_failed_decryption: false
      };
      
      const selectedStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
      if (dateStr === selectedStr && debouncedSearch === "") {
        setFeedEntries(prev => {
          const existsIndex = prev.findIndex(e => e.entry_date === dateStr);
          if (existsIndex >= 0) {
            const next = [...prev];
            next[existsIndex] = { ...newEntry, created_at: new Date().toISOString() };
            return next;
          } else {
            return [{ ...newEntry, created_at: new Date().toISOString() }, ...prev];
          }
        });
      }
      
      setEntryDates(prev => {
        const next = new Set(prev);
        next.add(dateStr);
        return next;
      });
      
      if (!selectedDate || selectedStr !== dateStr) {
        setSelectedDate(entryDate);
      }
      
      await clearLocalDraft(dateStr);
      setIsSealed(true);
      setTimeout(() => setIsSealed(false), 2000);
      console.log("7. Seal process complete!");
    } catch (err) {
      console.error("Failed to seal entry:", err);
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRaw = (id: string) => {
    setShowRaw(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const entryDatesArray = useMemo(() => {
    return Array.from(entryDates).map(dateStr => {
      const [year, month, day] = dateStr.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    });
  }, [entryDates]);

  const displayEntries = hasSearched ? searchResults : feedEntries;

  return (
    <div className="min-h-screen bg-[#0f172a] text-soft-cream p-4 md:p-8 lg:p-12 font-sans selection:bg-soft-indigo/30 selection:text-soft-cream relative z-0">
      
      {/* Ambient background mesh */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-indigo-950/20 blur-[100px] rounded-full scale-150"
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        {/* Header */}
        <header className="space-y-4 pt-2 md:pt-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-soft-indigo/10 text-soft-indigo border border-soft-indigo/20 text-sm">
            <Lock size={14} />
            <span className="font-medium tracking-wide text-xs uppercase">{"Zero-Knowledge Vault"}</span>
          </div>
          <h1 className={`${playfair.className} text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white`}>
            {"Your Secure Journal"}
          </h1>
          <p className="text-soft-cream/60 text-lg md:text-xl font-light">
            {"Encrypted locally. Only you hold the key."}
          </p>
        </header>

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-medium flex items-center space-x-2">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Editor */}
          <div className="lg:col-span-7 space-y-6">
            <section className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-soft-indigo/20 to-sage-green/20 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000" />
              <div className="relative flex flex-col bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-300 space-y-6">
                
                {/* Editor Header: Date Selector & Title */}
                <div className="space-y-4">
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] justify-start text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",
                          !entryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {entryDate ? format(entryDate, "PPP") : <span>{"Pick a date"}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-white/10 bg-[#0f172a]" align="start">
                      <Calendar
                        mode="single"
                        selected={entryDate}
                        onSelect={(date) => {
                          if (date) {
                            setEntryDate(date);
                            setIsDatePickerOpen(false);
                          }
                        }}
                        className="text-white"
                        classNames={{
                          weekday: "text-soft-cream/50",
                          day_button: "hover:bg-white/10 w-9 h-9 p-0 flex items-center justify-center font-normal rounded-md text-slate-400 transition-colors",
                          button_previous: "hover:bg-white/10 border border-white/10 bg-transparent h-7 w-7 rounded-md flex items-center justify-center transition-colors mr-2",
                          button_next: "hover:bg-white/10 border border-white/10 bg-transparent h-7 w-7 rounded-md flex items-center justify-center transition-colors",
                        }}
                        modifiersClassNames={{
                          today: "bg-soft-indigo/20 text-white",
                          selected: "bg-soft-indigo text-[#0f172a] hover:bg-soft-indigo hover:text-[#0f172a] focus:bg-soft-indigo focus:text-[#0f172a]",
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <Input
                    type="text"
                    placeholder="Journal Title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="text-2xl md:text-3xl font-medium bg-transparent border-0 px-0 rounded-none focus-visible:ring-0 focus-visible:border-b focus-visible:border-soft-indigo/50 placeholder:text-soft-cream/20 text-white transition-all shadow-none"
                  />
                </div>

                <div className="relative w-full min-h-[300px]">
                  {isDecrypting ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 py-12 animate-pulse bg-white/[0.01] rounded-xl border border-white/5">
                      <div className="w-full space-y-4 px-8 opacity-40">
                        <div className="h-4 bg-slate-800/50 rounded-full w-3/4"></div>
                        <div className="h-4 bg-slate-800/50 rounded-full w-full"></div>
                        <div className="h-4 bg-slate-800/50 rounded-full w-5/6"></div>
                        <div className="h-4 bg-slate-800/50 rounded-full w-4/5"></div>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-500 mt-8">
                        <Lock className="w-4 h-4 animate-pulse" />
                        <span className="text-sm tracking-wide">Decrypting sanctuary...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={content ? "" : (placeholderPrompt === "What is the minimum viable day today?" ? "" : "What's on your mind? Everything you write here is encrypted before it leaves your device...")}
                        className="w-full h-full min-h-[300px] bg-transparent text-lg font-serif leading-loose tracking-wide placeholder:text-soft-cream/30 focus-visible:ring-1 focus-visible:ring-soft-indigo/50 border-white/10 rounded-xl resize-none transition-all relative z-10"
                      />
                      {!content && placeholderPrompt === "What is the minimum viable day today?" && (
                        <div className="absolute top-[9px] left-[13px] pointer-events-none z-0">
                          <span className="text-soft-cream/30 text-lg leading-relaxed animate-in fade-in duration-1000">
                            What is the minimum viable day today?
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-white/5 space-y-4 sm:space-y-0">
                  <span className="text-xs text-soft-cream/40 flex items-center space-x-1.5 font-mono">
                    <Shield size={14} className="text-soft-indigo/60" />
                    <span>{"AES-GCM 256-bit"}</span>
                  </span>
                  <motion.div whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                    <Button
                      onClick={handleSealEntry}
                      disabled={isSubmitting || isDecrypting || (!content.trim() && !title.trim()) || !masterKey || !userId}
                      className={cn(
                        "w-full px-8 h-12 font-semibold rounded-full transition-all shadow-[0_0_20px_rgba(129,140,248,0.2)] hover:shadow-[0_0_30px_rgba(129,140,248,0.4)]",
                        isSealed ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-soft-indigo text-[#0f172a] hover:bg-indigo-400"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin mr-2" />
                          <span>{"Sealing..."}</span>
                        </>
                      ) : isSealed ? (
                        <>
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Check size={18} className="mr-2" />
                          </motion.div>
                          <span>{"Sealed"}</span>
                        </>
                      ) : (
                        <>
                          <Lock size={18} className="mr-2" />
                          <span>{"Seal Entry"}</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Calendar & Feed & Search */}
          <div className={cn("lg:col-span-5 space-y-6 flex flex-col transition-opacity duration-700", isFocused ? "opacity-40" : "opacity-100")}>
            
            {/* ZK Search Bar */}
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
              <div className="relative flex items-center">
                <Search className="absolute left-3 text-soft-cream/40" size={18} />
                <Input
                  type="text"
                  placeholder="Search titles and entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 focus-visible:ring-soft-indigo/50 text-white placeholder:text-soft-cream/30 rounded-xl"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 ml-1 flex items-start">
                <AlertCircle size={12} className="mr-1 mt-0.5 shrink-0" />
                <span>{"Searching decrypts your entire vault locally. This may take a moment depending on your vault size."}</span>
              </p>
            </div>

            {/* Calendar */}
            <section className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-6 shadow-2xl">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={hasSearched ? undefined : selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setSearchQuery(""); // Clear search when picking a date
                    }
                  }}
                  modifiers={{ booked: entryDatesArray }}
                  className="text-white w-full max-w-sm"
                  classNames={{
                    month_grid: "w-full border-collapse space-y-1",
                    weekdays: "flex w-full justify-between",
                    week: "flex w-full justify-between mt-2",
                    day: "w-10 h-10 text-center relative p-0 flex items-center justify-center mx-auto",
                    day_button: "w-10 h-10 p-0 font-normal hover:bg-white/10 rounded-md transition-colors text-slate-400 aria-selected:opacity-100 flex items-center justify-center",
                    button_previous: "hover:bg-white/10 border border-white/10 bg-transparent opacity-70 hover:opacity-100 h-7 w-7 rounded-md flex items-center justify-center transition-colors absolute left-0 top-0",
                    button_next: "hover:bg-white/10 border border-white/10 bg-transparent opacity-70 hover:opacity-100 h-7 w-7 rounded-md flex items-center justify-center transition-colors absolute right-0 top-0",
                  }}
                  modifiersClassNames={{
                    today: "ring-1 ring-indigo-500/50 text-white",
                    selected: "bg-indigo-600 text-white font-bold hover:bg-indigo-600 hover:text-white focus:bg-indigo-600 focus:text-white shadow-lg",
                  }}
                  components={{
                    DayContent: ((props: React.HTMLAttributes<HTMLDivElement> & { date: Date, activeModifiers?: Record<string, boolean> }) => {
                      const isBooked = props.activeModifiers?.booked;
                      return (
                        <div className="relative flex items-center justify-center h-full w-full">
                          <span>{props.date.getDate()}</span>
                          {isBooked && (
                            <motion.div 
                              initial={{ scale: 0 }} 
                              animate={{ scale: 1 }}
                              className="absolute bottom-1 w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_5px_theme(colors.indigo.500)]" 
                            />
                          )}
                        </div>
                      );
                    })
                  } as unknown as React.ComponentProps<typeof Calendar>["components"]}
                />
              </div>
              <div className="flex justify-center mt-4">
                <button 
                  onClick={() => {
                    setSelectedDate(new Date());
                    setSearchQuery("");
                  }} 
                  className="text-xs text-slate-400 hover:text-indigo-400 transition-colors font-medium"
                >
                  Return to Today
                </button>
              </div>
            </section>

            {/* Feed */}
            <section className="space-y-4 flex-1 flex flex-col min-h-[300px]">
              <h3 className="text-sm font-medium tracking-widest text-soft-cream/40 uppercase pl-2 flex items-center">
                {hasSearched ? `Search Results (${searchResults.length})` : 
                  (selectedDate ? format(selectedDate, "EEEE, MMM d, yyyy") : 'Select a date')}
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-12 [mask-image:linear-gradient(to_bottom,transparent,black_5%,black_95%,transparent)]">
                {isSearching || isLoadingFeed ? (
                  <div className="flex items-center py-8 text-soft-cream/50 pl-2">
                    <Loader2 className="animate-spin mr-3" size={18} />
                    <span className="text-sm animate-pulse">{isSearching ? "Decrypting vault for search..." : "Decrypting feed..."}</span>
                  </div>
                ) : displayEntries.length === 0 ? (
                  <div className="py-8 text-soft-cream/30 italic text-sm pl-2">
                    {hasSearched ? "No matching entries found." : "No entries for this date."}
                  </div>
                ) : (
                  displayEntries.map((entry) => (
                    <div key={entry.id} className="group bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors shadow-lg">
                      <div className="prose prose-invert max-w-none mb-4">
                        {showRaw.has(entry.id) ? (
                          <div className="font-mono text-xs text-soft-indigo/70 break-all bg-[#080b14] p-4 rounded-xl border border-white/5 shadow-inner">
                            <div className="mb-2"><span className="text-soft-cream/30 select-none mr-2">{"IV:"}</span> {entry.iv}</div>
                            <div><span className="text-soft-cream/30 select-none mr-2">{"PAYLOAD:"}</span> {entry.encrypted_payload}</div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {entry.decrypted_title && (
                              <h4 className={`${playfair.className} text-xl font-medium text-white`}>
                                {entry.decrypted_title}
                              </h4>
                            )}
                            <p className="whitespace-pre-wrap text-soft-cream/90 text-base leading-relaxed font-light">
                              {entry.decrypted_content}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center border-t border-white/5 pt-3">
                        <span className="text-xs text-soft-cream/30">
                          {format(new Date(entry.created_at), "h:mm a")} 
                          {hasSearched && ` • ${format(new Date(entry.entry_date + "T12:00:00Z"), "MMM d, yyyy")}`}
                        </span>
                        <button 
                          onClick={() => toggleRaw(entry.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1.5 text-soft-cream/30 hover:text-soft-indigo hover:bg-soft-indigo/10 rounded-full"
                          title="Toggle ZK Proof View"
                        >
                          {showRaw.has(entry.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
