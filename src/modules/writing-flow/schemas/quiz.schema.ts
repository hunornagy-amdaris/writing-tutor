import { z } from 'zod';

export const quizMcQuestionSchema = z.object({
  stem: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(4),
  correctIndex: z.number().int().min(0).max(3),
});

export const quizGapQuestionSchema = z.object({
  before: z.string(),
  after: z.string(),
  correctAnswer: z.string().min(1),
});

export const quizQuestionsSchema = z.object({
  mc: quizMcQuestionSchema,
  gap: quizGapQuestionSchema,
  rule: z.string().min(1),
});

export const quizGrammarEditSchema = z.object({
  type: z.enum(['replace', 'delete', 'insert']),
  token: z.string(),
  correction: z.string().optional(),
});

export const quizPhraseologyFlagSchema = z.object({
  token: z.string(),
  rank: z.number(),
  suggestions: z.array(z.string()),
});

export const quizGenerationRequestSchema = z.object({
  sentence: z.string().min(1),
  grammarEdits: z.array(quizGrammarEditSchema),
  phraseologyFlags: z.array(quizPhraseologyFlagSchema),
  prompt: z.string().min(1),
});

export const quizGenerationResponseSchema = quizQuestionsSchema;
