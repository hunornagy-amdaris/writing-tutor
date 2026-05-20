# ElevenLabs Agent Setup — Brainstorm Tutor

Create a **second Conversational AI agent** in the ElevenLabs dashboard (separate from the per-sentence Review tutor in `ELEVENLABS_AGENT_PROMPT.md`). This one runs **step 1 — Brainstorm**: it helps the student think through the PTE Writing Task 2 prompt BEFORE writing.

## 1. Basic settings

- **Name:** Brainstorm Tutor (PTE Writing Task 2)
- **Language:** Multilingual (set primary to English; the agent will mirror the student's L1 — see prompt)
- **LLM:** GPT-4o-mini or Gemini Flash (latency matters more than depth — turns are short)
- **Voice:** any warm, conversational voice (recommend Aria, Sarah, or a calm mid-tone)
- **Visibility:** **Public** (agent ID is used client-side, no signed URL)
- **Privacy / overrides:** enable **"First message override"** so the client can pass a per-task opener
- **Max conversation duration:** 10 minutes (brainstorming should be brief; cap forces focus)
- **Turn timeout / latency:** lowest available — keep voice responsive
- **Interruption sensitivity:** high (students often think aloud and self-correct mid-sentence)

After creation, copy the agent ID and put it in `.env.local`:

```
NEXT_PUBLIC_ELEVENLABS_BRAINSTORM_AGENT_ID=agent_xxxxxxxxxxxxxxxxxxxxxxxxx
```

This is **distinct** from `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`, which is the Review-step agent.

---

## 2. System prompt (paste into Agent → System prompt)

```

```

---

## 3. First message

Leave the agent's default First Message blank, or use a generic fallback:

```
When you read this prompt — what's your gut reaction?
```

The Next.js client **overrides this** via `overrides.agent.firstMessage` on `startSession` so the live opener is tuned to the current task (and to whether the student is resuming a prior text session).

---

## 4. Dynamic variables — register these in the dashboard

Agent → **Dynamic Variables** → add each (all type `string`). Names must match exactly — the client sends them on `startSession`:

| Variable | Required | Description | Example value |
|---|---|---|---|
| `writing_task_prompt` | yes | The full PTE Writing Task 2 prompt the student is brainstorming about | `Some people think daylight saving time should be abolished. Others believe it still serves a useful purpose. Discuss both views and give your own opinion.` |
| `student_first_language` | no | ISO code or language name if known; agent infers from first message if empty | `es`, `Hindi`, `pt-BR` |
| `cefr_level` | no | Approximate CEFR level — informs how the AI calibrates its OWN vocab (not the suggested essay wording) | `B2`, `C1` |
| `prior_chat_summary` | no | One-paragraph recap if the student is resuming a voice session after a text session; empty otherwise | `Student leans toward abolishing DST, citing sleep disruption; hasn't found a counter-argument yet.` |

> Lean setup: only `writing_task_prompt` is strictly required. The others render blank if unset and the prompt still works.

---

## 5. Override permissions

Agent → **Security / Overrides** → enable:

- [x] **First message override** — client passes a tuned opener per task / per resume state
- [ ] System prompt override — NOT needed (dynamic variables cover all per-session context)

---

## 6. Test it

1. Save the agent → copy the agent ID into `.env.local` as `NEXT_PUBLIC_ELEVENLABS_BRAINSTORM_AGENT_ID`.
2. `pnpm dev` → open `localhost:3000` → start a new essay → enter the Brainstorm step → switch to Voice mode.
3. The tutor should open with a short, pointed question about the actual task prompt. Reply in a non-English language — it should switch.
4. Say "I'm done brainstorming" — it should close in one short turn and stop asking questions.

Common pitfalls:
- Variable names in the dashboard must match exactly (case-sensitive, snake_case).
- First-message override must be enabled, or the per-task opener won't apply.
- If voice latency feels slow, drop to a faster LLM (Gemini Flash) — the prompt does not need a strong model; it needs a fast one.
- This agent ID must be different from the Review agent's ID. Verify both env vars point to different `agent_...` strings.
