import { z } from 'zod';

export const CurriculumModuleSchema = z.object({
  slug: z.string(),
  layerIndex: z.number().optional().default(0),
  layerTitle: z.string().optional().default('Autonomic Foundations'),
  trackId: z.enum([
    'foundation',
    'sleep',
    'work',
    'stress',
    'relationships',
    'emotions',
    'habits',
    'somatic-health'
  ]).optional().default('foundation'),
  trackTitle: z.string().optional().default('Autonomic Foundations'),
  trackIcon: z.string().optional(),
  moduleIndex: z.number(),
  title: z.string(),
  summary: z.string().optional(),
  durationMinutes: z.number(),
  prerequisites: z.array(z.string()).optional(),
  targetQuadrant: z.enum(['Reactive Survival', 'Stabilized Baseline', 'Dynamic Regulation', 'Antifragile State']),
  telemetryTag: z.string(),
  researchPaperDoi: z.string(),
  difficulty: z.enum(['Foundational', 'Intermediate', 'Advanced']).optional().default('Foundational'),
});

export type CurriculumModuleMeta = z.infer<typeof CurriculumModuleSchema>;

