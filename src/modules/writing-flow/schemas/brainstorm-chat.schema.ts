import { z } from 'zod';

export const chatMessageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(['user', 'ai']),
  content: z.string().min(1).max(4000),
});

export const brainstormChatRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  messages: z.array(chatMessageSchema).max(50),
});

export const brainstormChatResponseSchema = z.object({
  message: z.string().min(1),
});

export type BrainstormChatRequest = z.infer<typeof brainstormChatRequestSchema>;
export type BrainstormChatResponse = z.infer<typeof brainstormChatResponseSchema>;
