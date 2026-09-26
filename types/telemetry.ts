export type EventType = 
  | 'module_started' 
  | 'biometric_delta_logged' 
  | 'protocol_completed'
  | 'vault_reflection_saved';

export interface CurriculumTelemetryEvent {
  eventType: EventType;
  timestamp: string;
  moduleSlug: string;
  telemetryTag: string;
  payload: Record<string, any>; // Encrypted prior to storage
}
