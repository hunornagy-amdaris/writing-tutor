import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    OPENROUTER_API_KEY: z.string().min(1),
    OPENROUTER_MODEL: z.string().default('google/gemini-2.5-flash'),
    OPENROUTER_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
    OPENROUTER_SITE_URL: z.string().url().optional(),
    OPENROUTER_APP_NAME: z.string().default('Writing Tutor'),
    HUGGINGFACE_API_KEY: z.string().min(1),
    HUGGINGFACE_FILL_MASK_URL: z
      .string()
      .url()
      .default('https://router.huggingface.co/hf-inference/models/FacebookAI/roberta-base'),
  },
  client: {
    NEXT_PUBLIC_ELEVENLABS_AGENT_ID: z.string().min(1),
    NEXT_PUBLIC_ELEVENLABS_BRAINSTORM_AGENT_ID: z.string().min(1).optional(),
  },
  runtimeEnv: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
    OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL,
    OPENROUTER_SITE_URL: process.env.OPENROUTER_SITE_URL,
    OPENROUTER_APP_NAME: process.env.OPENROUTER_APP_NAME,
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
    HUGGINGFACE_FILL_MASK_URL: process.env.HUGGINGFACE_FILL_MASK_URL,
    NEXT_PUBLIC_ELEVENLABS_AGENT_ID: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
    NEXT_PUBLIC_ELEVENLABS_BRAINSTORM_AGENT_ID:
      process.env.NEXT_PUBLIC_ELEVENLABS_BRAINSTORM_AGENT_ID,
  },
  emptyStringAsUndefined: true,
});
