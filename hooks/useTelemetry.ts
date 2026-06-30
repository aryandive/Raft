import { useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { db, pruneOldData } from '@/lib/db';
import { useAuthStore } from '@/store/useAuthStore';
import { z } from 'zod';

// Strict Zod validation for data pulled out of Dexie/Supabase
const TelemetryLogSchema = z.object({
  date: z.string(),
  encryptedPayload: z.string(),
});

const TelemetryLogArraySchema = z.array(TelemetryLogSchema);

export type EncryptedTelemetryLog = z.infer<typeof TelemetryLogSchema>;

export function useTelemetry() {
  const supabase = createClient();
  const { session, isPremium } = useAuthStore();

  const saveTelemetryLog = useCallback(async (date: string, encryptedPayload: string) => {
    if (!isPremium) {
      // Free tier logic: Save locally and prune
      await db.telemetryLogs.put({ date, encryptedPayload });
      await pruneOldData();
    } else {
      // Premium tier logic: Push to Supabase
      if (!session?.user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('telemetry_logs')
        .upsert({
          user_id: session.user.id,
          date,
          encrypted_payload: encryptedPayload
        }, { onConflict: 'user_id, date' });

      if (error) {
        console.error("Failed to save to Supabase", error);
        throw error;
      }
    }
  }, [isPremium, session, supabase]);

  const loadTelemetryLogs = useCallback(async (): Promise<EncryptedTelemetryLog[]> => {
    if (!isPremium) {
      // Free tier: read purely from Dexie
      const localData = await db.telemetryLogs.toArray();
      return TelemetryLogArraySchema.parse(localData);
    } else {
      // Premium tier: Merge & Flush
      if (!session?.user?.id) throw new Error("User not authenticated");

      // 1. Fetch cloud data
      const { data: cloudDataRaw, error } = await supabase
        .from('telemetry_logs')
        .select('date, encrypted_payload')
        .eq('user_id', session.user.id);
        
      if (error) {
        console.error("Failed to fetch cloud data", error);
        throw error;
      }

      const parsedCloudData = cloudDataRaw ? cloudDataRaw.map(row => ({
        date: row.date,
        encryptedPayload: row.encrypted_payload
      })) : [];

      let cloudData = TelemetryLogArraySchema.parse(parsedCloudData);

      // 2. Fetch local data
      const localDataRaw = await db.telemetryLogs.toArray();
      const localData = TelemetryLogArraySchema.parse(localDataRaw);

      if (localData.length > 0) {
        // 3. Push local data to Supabase (Merge)
        const { error: upsertError } = await supabase
          .from('telemetry_logs')
          .upsert(
            localData.map(log => ({
              user_id: session.user.id,
              date: log.date,
              encrypted_payload: log.encryptedPayload
            })),
            { onConflict: 'user_id, date' }
          );

        if (upsertError) {
          console.error("Failed to sync local data to Supabase", upsertError);
          throw upsertError;
        }

        // 4. Delete the local data (Flush) to prevent split-brain
        await db.telemetryLogs.clear();
        
        // Replace overlapping cloud data with the synced local data
        const mergedData = [
          ...cloudData.filter(c => !localData.some(l => l.date === c.date)),
          ...localData
        ];
        cloudData = mergedData;
      }

      return cloudData;
    }
  }, [isPremium, session, supabase]);

  return { saveTelemetryLog, loadTelemetryLogs };
}
