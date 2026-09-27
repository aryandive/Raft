import { useCallback, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getLocalMasterKey, encryptPayload } from '@/utils/crypto';
import { format } from 'date-fns';

export type VaultEventType = 'manual_note' | 'breathing_session' | 'telemetry_checkin' | 'curriculum_read';

export interface VaultEventMetadata {
  delta?: string;
  sessionDuration?: number;
  activityName?: string;
  time?: string;
  [key: string]: any;
}

interface LogEventOptions {
  eventType: VaultEventType;
  metadata?: VaultEventMetadata;
  plaintextTitle?: string;
  plaintextContent?: string;
}

export function useVaultStream() {
  const supabase = createClient();
  const [isLogging, setIsLogging] = useState(false);

  const logEvent = useCallback(async ({
    eventType,
    metadata = {},
    plaintextTitle = "",
    plaintextContent = ""
  }: LogEventOptions) => {
    setIsLogging(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("User not authenticated.");

      const masterKey = await getLocalMasterKey();
      if (!masterKey) throw new Error("Encryption failed. Missing local key. Please setup your vault.");

      const rawData = JSON.stringify({ title: plaintextTitle.trim(), content: plaintextContent.trim() });
      const { ciphertext, iv } = await encryptPayload(rawData, masterKey);

      // Using the current date as entry_date to keep it aligned with the calendar view 
      // although we might move away from calendar in the unified stream.
      const dateStr = format(new Date(), "yyyy-MM-dd");

      // Generate time metadata automatically if not provided
      if (!metadata.time) {
        metadata.time = format(new Date(), "h:mm a");
      }

      // Instead of an upsert which overwrites a single daily entry, 
      // the new stream requires inserting multiple distinct events per day.
      // So we use standard insert instead of upsert based on user_id and entry_date.
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          encrypted_payload: ciphertext,
          iv,
          entry_date: dateStr,
          event_type: eventType,
          metadata: metadata
        })
        .select()
        .single();

      if (error) throw new Error("Failed to log event: " + error.message);
      
      return data;
    } catch (err) {
      console.error("useVaultStream error:", err);
      throw err;
    } finally {
      setIsLogging(false);
    }
  }, [supabase]);

  return { logEvent, isLogging };
}
