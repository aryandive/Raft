export interface TrackDefinition {
  id: string;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  accentColor: string;
}

export const CURRICULUM_TRACKS: TrackDefinition[] = [
  {
    id: 'all',
    title: 'All Tracks',
    shortTitle: 'All Protocols',
    icon: 'Sparkles',
    description: 'Explore the full clinical curriculum across all nervous system regulation domains.',
    accentColor: '#818cf8',
  },
  {
    id: 'foundation',
    title: 'Autonomic Foundations',
    shortTitle: 'Foundations',
    icon: 'Brain',
    description: 'Polyvagal grounding, vagal brake engagement, and baseline stabilization.',
    accentColor: '#81b29a',
  },
  {
    id: 'sleep',
    title: 'Circadian & Deep Sleep Architecture',
    shortTitle: 'Sleep & Night',
    icon: 'Moon',
    description: 'Sympathetic withdrawal, insomnia cortisol downshift, and restorative slow-wave triggers.',
    accentColor: '#38bdf8',
  },
  {
    id: 'work',
    title: 'Executive Focus & Work Overload',
    shortTitle: 'Work & Focus',
    icon: 'Briefcase',
    description: 'Ultradian pacing, email apnea de-escalation, and post-work psychological detachment.',
    accentColor: '#f59e0b',
  },
  {
    id: 'stress',
    title: 'Acute Stress & Burnout Recovery',
    shortTitle: 'Stress & Burnout',
    icon: 'Flame',
    description: 'Allostatic load deceleration, dorsal vagal thaw, and acute somatic brakes.',
    accentColor: '#e07a5f',
  },
  {
    id: 'relationships',
    title: 'Relational Co-Regulation & Boundaries',
    shortTitle: 'Relationships',
    icon: 'Users',
    description: 'Social engagement system, diffuse arousal mitigation, and non-reactive conflict repair.',
    accentColor: '#ec4899',
  },
  {
    id: 'emotions',
    title: 'Affective Granularity & Agility',
    shortTitle: 'Emotions',
    icon: 'HeartHandshake',
    description: 'Lisa Feldman Barrett interoceptive decoding, wave surfing, and shame dissolution.',
    accentColor: '#a855f7',
  },
  {
    id: 'habits',
    title: 'Impulse Control & Dopamine Reset',
    shortTitle: 'Impulse & Habits',
    icon: 'Zap',
    description: 'Marlatt urge surfing, digital de-stimulation, and boredom tolerance.',
    accentColor: '#10b981',
  },
];
