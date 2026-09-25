import { useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { db, pruneOldData } from '@/lib/db';
import { useAuthStore } from '@/store/useAuthStore';
import { z } from 'zod';

// Strict Zod validation for data pulled out of Dexie/Supabase
const JournalEntrySchema = z.object({
  id: z.string().uuid(),
  timestamp: z.number(),
  encryptedContent: z.string(),
});

const JournalEntryArraySchema = z.array(JournalEntrySchema);

export type EncryptedJournalEntry = z.infer<typeof JournalEntrySchema>;

export function useVault() {
  const supabase = createClient();
  const { session, isPremium } = useAuthStore();

  const saveJournalEntry = useCallback(async (encryptedContent: string) => {
    // Generate standard v4 UUID on the client side
    const id = crypto.randomUUID();
    const timestamp = Date.now();

    if (!isPremium) {
      // Free tier logic: Save locally and prune
      await db.journalEntries.put({ id, timestamp, encryptedContent });
      await pruneOldData();
    } else {
      // Premium tier logic: Push directly to Supabase
      if (!session?.user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('journal_entries')
        .insert({
          id,
          user_id: session.user.id,
          created_at: new Date(timestamp).toISOString(),
          encrypted_content: encryptedContent
        });

      if (error) {
        console.error("Failed to save journal entry to Supabase", error);
        throw error;
      }
    }

    return { id, timestamp, encryptedContent };
  }, [isPremium, session, supabase]);

  const loadJournalEntries = useCallback(async (): Promise<EncryptedJournalEntry[]> => {
    if (!isPremium) {
      // Free tier: read purely from Dexie
      const localDataRaw = await db.journalEntries.toArray();
      const localData = JournalEntryArraySchema.parse(localDataRaw);
      
      // Return sorted by date, newest first
      return localData.sort((a, b) => b.timestamp - a.timestamp);
    } else {
      // Premium tier: Merge & Flush
      if (!session?.user?.id) throw new Error("User not authenticated");

      // 1. Fetch cloud data
      const { data: cloudDataRaw, error } = await supabase
        .from('journal_entries')
        .select('id, created_at, encrypted_content')
        .eq('user_id', session.user.id);

      if (error) {
        console.error("Failed to fetch cloud data", error);
        throw error;
      }

      const parsedCloudData = cloudDataRaw ? cloudDataRaw.map(row => ({
        id: row.id,
        timestamp: new Date(row.created_at).getTime(),
        encryptedContent: row.encrypted_content
      })) : [];

      let cloudData = JournalEntryArraySchema.parse(parsedCloudData);

      // 2. Fetch local data
      const localDataRaw = await db.journalEntries.toArray();
      const localData = JournalEntryArraySchema.parse(localDataRaw);

      if (localData.length > 0) {
        // 3. Sync local data to Supabase (Merge)
        const { error: upsertError } = await supabase
          .from('journal_entries')
          .upsert(
            localData.map(entry => ({
              id: entry.id,
              user_id: session.user.id,
              created_at: new Date(entry.timestamp).toISOString(),
              encrypted_content: entry.encryptedContent
            })),
            { onConflict: 'id' } 
          );

        if (upsertError) {
          console.error("Failed to sync local data to Supabase", upsertError);
          throw upsertError;
        }

        // 4. Delete local data (Flush) to prevent split-brain
        await db.journalEntries.clear();

        // Replace overlapping cloud data with the synced local data
        const mergedData = [
          ...cloudData.filter(c => !localData.some(l => l.id === c.id)),
          ...localData
        ];
        cloudData = mergedData;
      }

      // Return merged dataset, sorted by date (newest first)
      return cloudData.sort((a, b) => b.timestamp - a.timestamp);
    }
  }, [isPremium, session, supabase]);

  return { saveJournalEntry, loadJournalEntries };
}
