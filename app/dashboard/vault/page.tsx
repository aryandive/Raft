"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Playfair_Display } from "next/font/google";
import { Eye, EyeOff, Lock, Shield, Loader2, CalendarIcon, Search, AlertCircle, Activity, BookOpen, Wind, ChevronRight } from "lucide-react";
import { format, formatDistanceToNow, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { getLocalMasterKey, encryptPayload, decryptPayload } from "@/utils/crypto";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export type VaultEventType = 'manual_note' | 'breathing_session' | 'telemetry_checkin' | 'curriculum_read';

interface VaultEventMetadata {
  delta?: string;
  sessionDuration?: number;
  activityName?: string;
  time?: string;
  [key: string]: any;
}

interface JournalEntry {
  id: string;
  user_id: string;
  encrypted_payload: string;
  iv: string;
  entry_date: string;
  created_at: string;
  event_type: VaultEventType;
  metadata: VaultEventMetadata;
  decrypted_title?: string;
  decrypted_content?: string;
  is_failed_decryption?: boolean;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function VaultPage() {
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Quick Log State
  const [quickNote, setQuickNote] = useState("");
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);
  
  // Feed State
  const [feedEntries, setFeedEntries] = useState<JournalEntry[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [globalPulse, setGlobalPulse] = useState(1420);
  
  // Search & Calendar State
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Edit State (Inline)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState<Set<string>>(new Set());

  const supabase = createClient();

  useEffect(() => {
    async function init() {
      try {
        const key = await getLocalMasterKey();
        if (!key) throw new Error("Master key not found. Please set up your vault first.");
        setMasterKey(key);
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("User not authenticated.");
        setUserId(user.id);
        
        loadFeed(user.id, key);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Initialization failed.");
        setIsLoadingFeed(false);
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

  const loadFeed = async (uid: string, key: CryptoKey) => {
    setIsLoadingFeed(true);
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(200); // Increased limit to allow searching and calendar filtering locally
        
      if (error) {
        if (error.message.includes("Could not find the 'event_type' column")) {
           throw new Error("Missing 'event_type' in database. Please run the SQL migration in your Supabase dashboard and reload the schema cache.");
        }
        throw new Error(error.message);
      }
      
      const decrypted = await decryptEntries(data || [], key);
      setFeedEntries(decrypted);
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to load feed.");
    } finally {
      setIsLoadingFeed(false);
    }
  };

  const handleSealQuickNote = async () => {
    if (!quickNote.trim() || !userId || !masterKey) return;
    setIsSubmittingQuick(true);
    setErrorMsg(null);
    
    try {
      const rawData = JSON.stringify({ title: "", content: quickNote.trim() });
      const { ciphertext, iv } = await encryptPayload(rawData, masterKey);
      
      const dateStr = format(new Date(), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({ 
          user_id: userId,
          encrypted_payload: ciphertext, 
          iv,
          entry_date: dateStr,
          event_type: 'manual_note',
          metadata: { time: format(new Date(), "h:mm a") }
        })
        .select()
        .single();
        
      if (error) {
         if (error.message.includes("Could not find the 'event_type' column")) {
           throw new Error("Missing 'event_type' in database. Please run the SQL migration in your Supabase dashboard and reload the schema cache.");
         }
         throw new Error(error.message);
      }
      
      const newEntry: JournalEntry = {
        ...data,
        decrypted_content: quickNote.trim(),
        decrypted_title: "",
        is_failed_decryption: false
      };
      
      setFeedEntries(prev => [newEntry, ...prev]);
      setQuickNote("");
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to seal quick note.");
    } finally {
      setIsSubmittingQuick(false);
    }
  };

  const handleSaveInlineEdit = async (entryId: string) => {
    if (!userId || !masterKey) return;
    setIsSubmittingEdit(true);
    try {
      const entry = feedEntries.find(e => e.id === entryId);
      if (!entry) throw new Error("Entry not found.");
      
      const rawData = JSON.stringify({ title: entry.decrypted_title || "", content: editContent.trim() });
      const { ciphertext, iv } = await encryptPayload(rawData, masterKey);
      
      // Optimistic update
      setFeedEntries(prev => prev.map(e => {
        if (e.id === entryId) {
          return { ...e, encrypted_payload: ciphertext, iv, decrypted_content: editContent.trim() };
        }
        return e;
      }));
      setEditingId(null);
      
      const { error } = await supabase
        .from("journal_entries")
        .update({
          encrypted_payload: ciphertext,
          iv
        })
        .eq("id", entryId);
        
      if (error) throw new Error(error.message);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update entry.");
      // Rollback would happen here in a full implementation
    } finally {
      setIsSubmittingEdit(false);
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

  const applySentenceStarter = (text: string) => {
    setQuickNote(prev => prev ? `${prev} ${text}` : text);
  };

  // Filter entries based on search query or selected date
  const displayEntries = useMemo(() => {
    let filtered = feedEntries;
    
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(entry => 
        (entry.decrypted_content && entry.decrypted_content.toLowerCase().includes(query)) ||
        (entry.metadata?.activityName && entry.metadata.activityName.toLowerCase().includes(query))
      );
    } else if (selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      filtered = filtered.filter(entry => entry.entry_date === dateStr);
    }
    
    return filtered;
  }, [feedEntries, debouncedSearch, selectedDate]);

  const activeDays = useMemo(() => {
    const dates = new Set<string>();
    feedEntries.forEach(entry => dates.add(entry.entry_date));
    return Array.from(dates).map(dateStr => new Date(dateStr + "T12:00:00"));
  }, [feedEntries]);

  // Derived Stats
  const telemetryCount = feedEntries.filter(e => e.event_type === 'telemetry_checkin').length;
  const curriculumCount = feedEntries.filter(e => e.event_type === 'curriculum_read').length;
  const sessionsCount = feedEntries.filter(e => e.event_type === 'breathing_session').length;

  const renderIcon = (type: VaultEventType) => {
    switch (type) {
      case 'breathing_session': return <Wind size={16} className="text-sage-green" />;
      case 'telemetry_checkin': return <Activity size={16} className="text-rose-400" />;
      case 'curriculum_read': return <BookOpen size={16} className="text-blue-400" />;
      default: return <Lock size={16} className="text-soft-indigo" />;
    }
  };

  const renderCard = (entry: JournalEntry) => {
    const isEditing = editingId === entry.id;
    const isAutoEvent = entry.event_type !== 'manual_note';
    const showDecryptedContent = entry.decrypted_content && entry.decrypted_content.trim() !== "";

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={entry.id} 
        className="group relative bg-white/[0.02] backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-3xl p-5 md:p-7 shadow-2xl transition-all"
      >
        <div className="absolute top-4 right-4 flex space-x-2">
          <button 
            onClick={() => toggleRaw(entry.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-soft-cream/30 hover:text-soft-indigo hover:bg-soft-indigo/10 rounded-full"
            title="Toggle ZK Proof View"
          >
            {showRaw.has(entry.id) ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        {isAutoEvent && (
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-full bg-white/5 border border-white/10">
              {renderIcon(entry.event_type)}
            </div>
            <div>
              <h3 className="text-white font-medium">
                {entry.metadata?.activityName || (entry.event_type === 'telemetry_checkin' ? "Telemetry Check-in" : "Activity")}
              </h3>
              <div className="flex items-center text-xs text-soft-cream/50 space-x-2 mt-0.5">
                {entry.metadata?.delta && <span>Delta: {entry.metadata.delta}</span>}
                {entry.metadata?.delta && entry.metadata?.sessionDuration && <span>•</span>}
                {entry.metadata?.sessionDuration && <span>{Math.floor(entry.metadata.sessionDuration / 60)} mins</span>}
                <span>•</span>
                <span>{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        )}

        {!isAutoEvent && (
          <div className="flex items-center space-x-2 text-xs text-soft-cream/40 mb-3">
            <CalendarIcon size={12} />
            <span>{format(new Date(entry.created_at), "h:mm a")} • {format(new Date(entry.created_at), "MMM d, yyyy")}</span>
          </div>
        )}

        {showRaw.has(entry.id) ? (
          <div className="font-mono text-xs text-soft-indigo/70 break-all bg-[#080b14] p-4 rounded-xl border border-white/5 mt-4">
            <div className="mb-2"><span className="text-soft-cream/30 select-none mr-2">IV:</span> {entry.iv}</div>
            <div><span className="text-soft-cream/30 select-none mr-2">PAYLOAD:</span> {entry.encrypted_payload}</div>
          </div>
        ) : (
          <div className="mt-2">
            {isEditing ? (
              <div className="space-y-3 mt-4">
                <Textarea 
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-black/20 border-white/10 text-white min-h-[100px] resize-none focus-visible:ring-1 focus-visible:ring-soft-indigo"
                  placeholder="Add a private thought to this event..."
                  autoFocus
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="text-soft-cream/50">Cancel</Button>
                  <Button size="sm" onClick={() => handleSaveInlineEdit(entry.id)} disabled={isSubmittingEdit} className="bg-soft-indigo text-[#0f172a] hover:bg-indigo-400">
                    {isSubmittingEdit ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} className="mr-2" />}
                    Save Securely
                  </Button>
                </div>
              </div>
            ) : showDecryptedContent ? (
              <div className="space-y-2 mt-2">
                <p className="whitespace-pre-wrap text-soft-cream/90 text-base leading-relaxed font-serif">
                  {entry.decrypted_content}
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => {
                      setEditContent(entry.decrypted_content || "");
                      setEditingId(entry.id);
                    }}
                    className="text-xs text-soft-indigo/60 hover:text-soft-indigo transition-colors"
                  >
                    Edit note
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setEditContent("");
                  setEditingId(entry.id);
                }}
                className="mt-2 text-sm text-soft-cream/40 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg px-4 py-2 w-full text-left transition-colors flex items-center"
              >
                <Lock size={14} className="mr-2 text-soft-indigo/50" />
                Add a private thought to this event...
              </button>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-soft-cream p-4 md:p-8 font-sans selection:bg-soft-indigo/30 selection:text-soft-cream relative z-0">
      
      {/* Ambient background mesh */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <motion.div 
          className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-indigo-950/20 blur-[120px] rounded-full mix-blend-screen"
          animate={{ x: [0, 50, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] bg-sage-green/10 blur-[100px] rounded-full mix-blend-screen"
          animate={{ x: [0, -30, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header & Global Pulse */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
          <div className="space-y-2">
            <h1 className={`${playfair.className} text-4xl md:text-5xl font-medium tracking-tight text-white`}>
              The Vault
            </h1>
            <p className="text-soft-cream/50 text-base font-light flex items-center">
              <Shield size={14} className="mr-2 text-soft-indigo" />
              Your encrypted personal timeline.
            </p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-xs text-soft-cream/60">
              <strong className="text-white">{globalPulse.toLocaleString()}</strong> nervous systems regulating today.
            </span>
          </div>
        </header>

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-medium flex items-center space-x-3 shadow-lg">
            <AlertCircle size={20} className="shrink-0" />
            <div className="flex flex-col">
               <span className="font-semibold">Database Error</span>
               <span className="text-sm opacity-90">{errorMsg}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Feed & Quick Log */}
          <div className="lg:col-span-7 space-y-8">
             {/* Quick Log Bar */}
             <section className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-2xl relative overflow-hidden group transition-all duration-300 hover:bg-white/[0.05]">
              <div className="absolute inset-0 bg-gradient-to-r from-soft-indigo/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="text-xs font-medium bg-white/5 px-3 py-1.5 rounded-full text-soft-cream/70 border border-white/5 flex items-center">
                    <Activity size={12} className="mr-1.5 text-soft-indigo" /> 
                    Current State: Neutral
                  </div>
                  <button onClick={() => applySentenceStarter("My chest felt tight when ")} className="text-xs font-medium bg-soft-indigo/10 hover:bg-soft-indigo/20 text-soft-indigo px-3 py-1.5 rounded-full transition-colors border border-soft-indigo/20">
                    "My chest felt tight when..."
                  </button>
                  <button onClick={() => applySentenceStarter("What triggered this was ")} className="text-xs font-medium bg-soft-indigo/10 hover:bg-soft-indigo/20 text-soft-indigo px-3 py-1.5 rounded-full transition-colors border border-soft-indigo/20">
                    "What triggered this was..."
                  </button>
                </div>
                
                <div className="relative">
                  <Textarea 
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    placeholder="Drop a thought. It gets encrypted instantly..."
                    className="w-full bg-transparent border-0 text-lg md:text-xl font-serif text-white placeholder:text-soft-cream/20 min-h-[60px] resize-none focus-visible:ring-0 px-0 pb-12 shadow-none"
                  />
                  <div className="absolute bottom-0 right-0 flex justify-end">
                    <Button 
                      onClick={handleSealQuickNote}
                      disabled={!quickNote.trim() || isSubmittingQuick || !masterKey}
                      className="rounded-full h-10 px-6 bg-soft-indigo text-[#0f172a] hover:bg-indigo-400 font-semibold shadow-[0_0_15px_rgba(129,140,248,0.2)]"
                    >
                      {isSubmittingQuick ? <Loader2 size={16} className="animate-spin" /> : (
                        <>
                          <Lock size={14} className="mr-2" />
                          Seal
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Unified Stream */}
            <section className="space-y-8 pb-20">
              {isLoadingFeed ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50 space-y-4">
                  <Loader2 className="animate-spin text-soft-indigo" size={32} />
                  <span className="text-sm tracking-widest uppercase text-soft-cream/40">Decrypting Stream...</span>
                </div>
              ) : displayEntries.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
                  <p className="text-soft-cream/30 font-medium">Your timeline is empty.</p>
                  <p className="text-sm text-soft-cream/20 mt-2">Log an activity or drop a thought above to begin.</p>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-white/10 before:to-transparent">
                  {displayEntries.map(renderCard)}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Search, Stats, Calendar */}
          <div className="lg:col-span-5 space-y-6 sticky top-6">
            
            {/* Search */}
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
              <div className="relative flex items-center">
                <Search className="absolute left-3 text-soft-cream/40" size={18} />
                <Input
                  type="text"
                  placeholder="Search encrypted entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 focus-visible:ring-soft-indigo/50 text-white placeholder:text-soft-cream/30 rounded-xl shadow-inner"
                />
              </div>
            </div>

            {/* Premium Stats Dashboard */}
            <div className="bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
              <h3 className="text-xs font-bold tracking-widest uppercase text-soft-cream/50 flex items-center">
                <Activity size={14} className="mr-2 text-soft-indigo" />
                Your Impact
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors">
                  <Wind size={20} className="text-sage-green mb-3" />
                  <div>
                    <div className="text-2xl font-semibold text-white">{sessionsCount}</div>
                    <div className="text-xs text-soft-cream/50">Breathing Sessions</div>
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors">
                  <BookOpen size={20} className="text-blue-400 mb-3" />
                  <div>
                    <div className="text-2xl font-semibold text-white">{curriculumCount}</div>
                    <div className="text-xs text-soft-cream/50">Curriculum Read</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <Activity size={20} className="text-rose-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{telemetryCount} Check-ins</div>
                    <div className="text-xs text-soft-cream/50">View Topology Map</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-soft-cream/30 group-hover:text-soft-indigo transition-colors" />
              </div>
            </div>

            {/* Calendar Widget */}
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between mb-2 px-2">
                <h3 className="text-xs font-bold tracking-widest uppercase text-soft-cream/50">Timeline Filter</h3>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{ booked: activeDays }}
                className="text-white mx-auto w-full max-w-[280px]"
                classNames={{
                  month_grid: "w-full border-collapse space-y-1",
                  weekdays: "flex w-full justify-between mb-2 text-xs text-soft-cream/40 font-medium",
                  week: "flex w-full justify-between mt-2",
                  day: "w-9 h-9 text-center relative p-0 flex items-center justify-center mx-auto",
                  day_button: "w-9 h-9 p-0 font-normal hover:bg-white/10 rounded-full transition-colors text-slate-300 aria-selected:opacity-100 flex items-center justify-center",
                  button_previous: "hover:bg-white/10 border border-white/10 bg-transparent opacity-70 hover:opacity-100 h-7 w-7 rounded-md flex items-center justify-center transition-colors absolute left-0 top-0",
                  button_next: "hover:bg-white/10 border border-white/10 bg-transparent opacity-70 hover:opacity-100 h-7 w-7 rounded-md flex items-center justify-center transition-colors absolute right-0 top-0",
                }}
                modifiersClassNames={{
                  today: "text-white font-bold ring-1 ring-white/20 rounded-full",
                  selected: "bg-soft-indigo text-[#0f172a] font-bold hover:bg-soft-indigo hover:text-[#0f172a] focus:bg-soft-indigo focus:text-[#0f172a] shadow-[0_0_15px_rgba(129,140,248,0.4)]",
                }}
                components={{
                  DayContent: ((props: React.HTMLAttributes<HTMLDivElement> & { date: Date, activeModifiers?: Record<string, boolean> }) => {
                    const isBooked = props.activeModifiers?.booked;
                    const isSelected = props.activeModifiers?.selected;
                    return (
                      <div className="relative flex items-center justify-center h-full w-full">
                        <span>{props.date.getDate()}</span>
                        {isBooked && (
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }}
                            className={cn(
                              "absolute bottom-[2px] w-1.5 h-1.5 rounded-full transition-colors",
                              isSelected ? "bg-[#0f172a]" : "bg-emerald-400 shadow-[0_0_8px_theme(colors.emerald.400)]"
                            )}
                          />
                        )}
                      </div>
                    );
                  })
                } as unknown as React.ComponentProps<typeof Calendar>["components"]}
              />
              
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedDate(new Date())}
                  className="text-xs text-soft-cream/60 hover:text-white hover:bg-white/10 h-8 px-3 rounded-full"
                >
                  Jump to Today
                </Button>
                
                <AnimatePresence>
                  {selectedDate && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedDate(undefined)}
                        className="text-xs text-rose-300/70 hover:text-rose-300 hover:bg-rose-500/10 h-8 px-3 rounded-full"
                      >
                        Clear Filter
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
