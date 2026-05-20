import { z } from 'zod';

export const reviewTutorMessageSchema = z.object({
  role: z.enum(['user', 'ai']),
  content: z.string().min(1).max(4000),
});

export const reviewTutorGrammarEditSchema = z.object({
  type: z.enum(['replace', 'delete', 'insert']),
  token: z.string(),
  correction: z.string().optional(),
});

export const reviewTutorPhraseologyFlagSchema = z.object({
  token: z.string(),
  rank: z.number(),
  suggestions: z.array(z.string()),
});

export const reviewTutorSentenceSchema = z.object({
  original: z.string().min(1).max(2000),
  corrected: z.string().max(2000),
  grammarEdits: z.array(reviewTutorGrammarEditSchema).max(50),
  phraseologyFlags: z.array(reviewTutorPhraseologyFlagSchema).max(50),
  index: z.number().int().min(0),
});

export const reviewTutorRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  sentence: reviewTutorSentenceSchema,
  messages: z.array(reviewTutorMessageSchema).max(50),
});

export const reviewTutorResponseSchema = z.object({
  message: z.string().min(1),
});

export type ReviewTutorRequest = z.infer<typeof reviewTutorRequestSchema>;
export type ReviewTutorResponse = z.infer<typeof reviewTutorResponseSchema>;
