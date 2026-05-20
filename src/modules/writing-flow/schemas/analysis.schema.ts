import { z } from 'zod';
import type { AnalysisResult } from '@/modules/writing-flow/types/analysis.types';

export const grammarEditSchema = z.object({
  type: z.enum(['replace', 'delete', 'insert']),
  token: z.string(),
  correction: z.string().optional(),
});

export const phraseologyFlagSchema = z.object({
  token: z.string(),
  rank: z.number().finite(),
  suggestions: z.array(z.string()),
});

export const essayScoresSchema = z.object({
  cohesion: z.number().finite(),
  syntax: z.number().finite(),
  vocabulary: z.number().finite(),
  phraseology: z.number().finite(),
  grammar: z.number().finite(),
  conventions: z.number().finite(),
  overall: z.number().finite(),
});

export const analyzedSentenceSchema = z.object({
  original: z.string(),
  corrected: z.string(),
  has_errors: z.boolean(),
  grammar_edits: z.array(grammarEditSchema),
  phraseology_flags: z.array(phraseologyFlagSchema),
  phraseology_score: z.number().finite().optional(),
});

export const paragraphLabelSchema = z.union([
  z.literal('Introduction'),
  z.literal('Conclusion'),
  z.custom<`Body ${number}`>(
    (val) => typeof val === 'string' && /^Body \d+$/.test(val),
  ),
]);

export const paragraphSchema = z.object({
  label: paragraphLabelSchema,
  sentenceIndices: z.array(z.number().int().nonnegative()),
});

export const analysisResultSchema = z.object({
  scores: essayScoresSchema,
  sentences: z.array(analyzedSentenceSchema),
  paragraphs: z.array(paragraphSchema).optional(),
}) satisfies z.ZodType<AnalysisResult>;

export type AnalysisResultInferred = z.infer<typeof analysisResultSchema>;
