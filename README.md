# Writing Tutor

An AI essay-writing tutor for L2 English learners: scores submissions, finds grammar errors, flags unnatural phrasing, then walks the student through corrections one sentence at a time via a voice tutor.

## Stack

- Next.js 16 (App Router) · React 19 · Tailwind v4 (Pearson design tokens)
- **Analysis:** OpenRouter (OpenAI-compatible API) → Google Gemini
- **Voice tutor:** ElevenLabs Conversational AI (`@elevenlabs/react`) — public agent + dynamic variables
- State: Zustand · Validation: Zod · Env: `@t3-oss/env-nextjs`

## Setup

```bash
pnpm install
cp .env.example .env.local
# fill in the values below
pnpm dev
```

## Environment variables

| Name | Required | Default | Description |
| --- | --- | --- | --- |
| `OPENROUTER_API_KEY` | yes | — | OpenRouter API key (`sk-or-v1-...`). |
| `OPENROUTER_MODEL` | no | `google/gemini-2.5-flash` | Any OpenRouter model slug. |
| `OPENROUTER_BASE_URL` | no | `https://openrouter.ai/api/v1` | Override for proxies / self-hosted gateways. |
| `OPENROUTER_APP_NAME` | no | `Writing Tutor` | Sent as `X-Title` for OpenRouter analytics. |
| `OPENROUTER_SITE_URL` | no | — | Sent as `HTTP-Referer` for OpenRouter analytics (set to your deployment URL). |
| `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` | yes | — | Public agent ID for the per-sentence Review voice tutor (step 3). |
| `NEXT_PUBLIC_ELEVENLABS_BRAINSTORM_AGENT_ID` | yes | — | Public agent ID for the Brainstorm voice tutor (different agent from the per-sentence Review tutor). |

No `ELEVENLABS_API_KEY` is required — the app talks directly to the public agent and passes per-sentence context via **dynamic variables**.

## Create the ElevenLabs agents

The app uses **two distinct** ElevenLabs Conversational AI agents — both need to be created separately in the ElevenLabs dashboard.

### Create the Review agent

See [`ELEVENLABS_AGENT_PROMPT.md`](./ELEVENLABS_AGENT_PROMPT.md) — system prompt, `{{placeholder}}` variables, and dashboard checklist for the per-sentence Review tutor (step 3).

### Create the Brainstorm agent

See [`BRAINSTORM_AGENT_PROMPT.md`](./BRAINSTORM_AGENT_PROMPT.md) — system prompt, dynamic variables, and dashboard checklist for the Brainstorm tutor (step 1). This is a separate agent from the Review one — both need to be created in the ElevenLabs dashboard, and their agent IDs go in different env vars.

## Verify

```bash
pnpm tsc --noEmit && pnpm lint
```

## Deploy (Vercel)

1. Import the repository on Vercel.
2. **Project Settings → Environment Variables** — set the six variables above (only `OPENROUTER_API_KEY` and `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` are strictly required).
3. Push to `main` — Vercel builds with Turbopack and deploys.

`next.config.ts` already outputs `standalone`, so the same build runs in any container.
