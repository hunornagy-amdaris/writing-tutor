import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    OPENAI_API_KEY: z.string().min(1),
    OPENAI_MODEL: z.string().default('gpt-5.4-mini'),
    HUGGINGFACE_API_KEY: z.string().min(1),
    HUGGINGFACE_FILL_MASK_URL: z
      .string()
      .url()
      .default('https://router.huggingface.co/hf-inference/models/FacebookAI/roberta-base'),
    HUGGINGFACE_KEVSUN_ENDPOINT_URL: z.string().url().optional(),
  },
  client: {
    NEXT_PUBLIC_ELEVENLABS_AGENT_ID: z.string().min(1),
    NEXT_PUBLIC_ELEVENLABS_BRAINSTORM_AGENT_ID: z.string().min(1).optional(),
  },
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
    HUGGINGFACE_FILL_MASK_URL: process.env.HUGGINGFACE_FILL_MASK_URL,
    HUGGINGFACE_KEVSUN_ENDPOINT_URL: process.env.HUGGINGFACE_KEVSUN_ENDPOINT_URL,
    NEXT_PUBLIC_ELEVENLABS_AGENT_ID: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
    NEXT_PUBLIC_ELEVENLABS_BRAINSTORM_AGENT_ID:
      process.env.NEXT_PUBLIC_ELEVENLABS_BRAINSTORM_AGENT_ID,
  },
  emptyStringAsUndefined: true,
});
