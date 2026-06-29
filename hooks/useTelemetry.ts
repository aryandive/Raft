import { useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getLocalMasterKey, encryptPayload, decryptPayload } from '@/utils/crypto';
import { z } from 'zod';

export const TelemetryPointSchema = z.object({
  x: z.number(),
  y: z.number(),
  timestamp: z.string(), // ISO format
  comment: z.string().optional()
});

export const TelemetryArraySchema = z.array(TelemetryPointSchema);

export type TelemetryPoint = z.infer<typeof TelemetryPointSchema>;

export function useTelemetry() {
  const supabase = createClient();

  const fetchTodayLogs = useCallback(async (): Promise<TelemetryPoint[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('telemetry_logs')
        .select('encrypted_payload, iv')
        .eq('user_id', user.id)
        .eq('entry_date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Fetch error", error);
        return [];
      }

      if (!data) return [];

      const masterKey = await getLocalMasterKey();
      if (!masterKey) throw new Error("Master key not found");

      const decryptedStr = await decryptPayload(data.encrypted_payload, data.iv, masterKey);
      const parsedArray = JSON.parse(decryptedStr);
      
      return TelemetryArraySchema.parse(parsedArray);
    } catch (err) {
      console.error("Failed to fetch today's logs", err);
      return [];
    }
  }, [supabase]);

  const handleLogMood = async (x: number, y: number, comment?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const masterKey = await getLocalMasterKey();
    if (!masterKey) throw new Error("Master key not found in local vault");

    const newPoint: TelemetryPoint = {
      x,
      y,
      timestamp: new Date().toISOString(),
      ...(comment ? { comment } : {})
    };

    const today = new Date().toISOString().split('T')[0];

    // Fetch existing first to append
    let currentLogs: TelemetryPoint[] = [];
    const { data: existingData, error: fetchError } = await supabase
      .from('telemetry_logs')
      .select('encrypted_payload, iv')
      .eq('user_id', user.id)
      .eq('entry_date', today)
      .maybeSingle();

    if (!fetchError && existingData) {
      try {
        const decryptedStr = await decryptPayload(existingData.encrypted_payload, existingData.iv, masterKey);
        currentLogs = TelemetryArraySchema.parse(JSON.parse(decryptedStr));
      } catch (err) {
        console.error("Failed to parse existing payload, starting fresh", err);
      }
    }

    currentLogs.push(newPoint);

    // Encrypt updated array
    const plaintext = JSON.stringify(currentLogs);
    const { ciphertext, iv } = await encryptPayload(plaintext, masterKey);

    // Upsert to supabase
    const { error: upsertError } = await supabase
      .from('telemetry_logs')
      .upsert({
        user_id: user.id,
        entry_date: today,
        encrypted_payload: ciphertext,
        iv,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, entry_date' });

    if (upsertError) {
      throw upsertError;
    }
  };

  const handleDeleteMood = async (timestampToDelete: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const masterKey = await getLocalMasterKey();
    if (!masterKey) throw new Error("Master key not found");

    const today = new Date().toISOString().split('T')[0];

    const { data: existingData, error: fetchError } = await supabase
      .from('telemetry_logs')
      .select('encrypted_payload, iv')
      .eq('user_id', user.id)
      .eq('entry_date', today)
      .maybeSingle();

    if (fetchError || !existingData) return;

    let currentLogs: TelemetryPoint[] = [];
    try {
      const decryptedStr = await decryptPayload(existingData.encrypted_payload, existingData.iv, masterKey);
      currentLogs = TelemetryArraySchema.parse(JSON.parse(decryptedStr));
    } catch (err) {
      console.error("Failed to decrypt for deletion", err);
      return;
    }

    const updatedLogs = currentLogs.filter(log => log.timestamp !== timestampToDelete);

    const plaintext = JSON.stringify(updatedLogs);
    const { ciphertext, iv } = await encryptPayload(plaintext, masterKey);

    const { error: upsertError } = await supabase
      .from('telemetry_logs')
      .upsert({
        user_id: user.id,
        entry_date: today,
        encrypted_payload: ciphertext,
        iv,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, entry_date' });

    if (upsertError) throw upsertError;
  };

  const bridgeToVault = async (log: TelemetryPoint, emotion: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const masterKey = await getLocalMasterKey();
    if (!masterKey) throw new Error("Master key not found");

    const today = new Date().toISOString().split('T')[0];
    const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const markdownBlock = `### Emotional Log: ${emotion}\n**Time:** ${time}\n**Context:** ${log.comment || "No context provided"}`;

    let currentTitle = `Telemetry Log - ${today}`;
    let currentContent = "";
    
    const { data: journalData, error: journalFetchError } = await supabase
      .from("journal_entries")
      .select("encrypted_payload, iv")
      .eq("user_id", user.id)
      .eq("entry_date", today)
      .maybeSingle();

    if (!journalFetchError && journalData) {
      try {
        const decryptedStr = await decryptPayload(journalData.encrypted_payload, journalData.iv, masterKey);
        const parsed = JSON.parse(decryptedStr);
        currentTitle = parsed.title || currentTitle;
        currentContent = parsed.content ? `${parsed.content}\n\n` : "";
      } catch (err) {
        console.error("Failed to decrypt existing journal, appending to new content", err);
      }
    }

    const updatedContent = currentContent + markdownBlock;
    const rawData = JSON.stringify({ title: currentTitle, content: updatedContent });
    const { ciphertext, iv } = await encryptPayload(rawData, masterKey);

    const { error: upsertError } = await supabase
      .from("journal_entries")
      .upsert(
        { 
          user_id: user.id,
          encrypted_payload: ciphertext, 
          iv,
          entry_date: today
        },
        { onConflict: 'user_id, entry_date' }
      );

    if (upsertError) throw upsertError;
  };

  return { handleLogMood, fetchTodayLogs, handleDeleteMood, bridgeToVault };
}
