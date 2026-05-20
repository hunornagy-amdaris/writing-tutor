import { z } from 'zod';

export const writeTutorMessageSchema = z.object({
  role: z.enum(['user', 'ai']),
  content: z.string().min(1),
});

export const writeTutorRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  essay: z.string().max(20000),
  messages: z.array(writeTutorMessageSchema).max(50),
});

export const writeTutorResponseSchema = z.object({
  reply: z.string().min(1),
});

export type WriteTutorRequest = z.infer<typeof writeTutorRequestSchema>;
export type WriteTutorResponse = z.infer<typeof writeTutorResponseSchema>;
