import Dexie, { type EntityTable } from 'dexie';

export interface TelemetryLog {
  id?: number;
  date: string; // ISO date string "YYYY-MM-DD"
  encryptedPayload: string;
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  encryptedContent: string;
}

export class RaftLocalDB extends Dexie {
  telemetryLogs!: EntityTable<TelemetryLog, 'id'>;
  journalEntries!: EntityTable<JournalEntry, 'id'>;

  constructor() {
    super('RaftVaultDB');
    this.version(1).stores({
      telemetryLogs: '++id, date', // Indexed by id and date
      journalEntries: 'id, timestamp' // Indexed by id (UUID) and timestamp
    });
  }
}

export const db = new RaftLocalDB();

/**
 * Prunes old data to enforce Free tier limits (removes records older than 14 days).
 */
export async function pruneOldData() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 14);
  
  const cutoffTimestamp = cutoffDate.getTime();
  const cutoffDateString = cutoffDate.toISOString().split('T')[0];

  try {
    await db.transaction('rw', db.telemetryLogs, db.journalEntries, async () => {
      // Prune telemetry logs older than 14 days
      await db.telemetryLogs
        .where('date')
        .below(cutoffDateString)
        .delete();

      // Prune journal entries older than 14 days
      await db.journalEntries
        .where('timestamp')
        .below(cutoffTimestamp)
        .delete();
    });
    console.log('Successfully pruned local data older than 14 days.');
  } catch (error) {
    console.error('Failed to prune old local data:', error);
  }
}
