import 'server-only';

import { env } from '@/lib/env';
import { wtLog } from '@/modules/writing-flow/lib/debug-log';

// KevSun/Engessay_grading_ML is a roberta-large regression head producing six
// outputs in this fixed order (per the spec's reference Python):
//   0: cohesion · 1: syntax · 2: vocabulary · 3: phraseology · 4: grammar · 5: conventions
//
// We hit a paid HF Inference Endpoint over HTTP from the Next.js route handler
// (Vercel-friendly: no model weights in the lambda). When the endpoint URL is
// unset, this returns null so the caller can fall back to the LLM emulator.

export type KevSunDims = {
  cohesion: number;
  syntax: number;
  vocabulary: number;
  phraseology: number;
  grammar: number;
  conventions: number;
};

export type KevSunResult = {
  dims: KevSunDims;
  raw: KevSunDims;
};

type HfScore = { label: string; score: number };

const COLD_START_TIMEOUT_MS = 120_000;

function round05(n: number): number {
  return Math.round(n * 2) / 2;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(Math.max(n, lo), hi);
}

// The model card documents the affine map scaled = 2.25 * x - 1.25 for the raw
// regression logits. We apply it per dimension, then clamp to the app's 1.0–5.0
// scale and snap to 0.5.
function postprocess(raw: readonly number[]): number[] {
  return raw.map((v) => clamp(round05(2.25 * v - 1.25), 1, 5));
}

function parseLabelIndex(label: string): number {
  const m = /(\d+)$/.exec(label);
  return m ? Number(m[1]) : -1;
}

function extractScores(json: unknown): number[] | null {
  if (!Array.isArray(json)) return null;
  const flat: unknown[] = Array.isArray(json[0]) ? (json[0] as unknown[]) : json;
  const pairs: HfScore[] = [];
  for (const item of flat) {
    if (
      typeof item === 'object' &&
      item !== null &&
      'label' in item &&
      'score' in item &&
      typeof (item as { label: unknown }).label === 'string' &&
      typeof (item as { score: unknown }).score === 'number'
    ) {
      pairs.push(item as HfScore);
    }
  }
  if (pairs.length !== 6) return null;
  pairs.sort((a, b) => parseLabelIndex(a.label) - parseLabelIndex(b.label));
  return pairs.map((p) => p.score);
}

export async function scoreKevSun(essay: string): Promise<KevSunResult | null> {
  const url = env.HUGGINGFACE_KEVSUN_ENDPOINT_URL;
  if (!url) {
    wtLog(
      'kevsun ✕ no HUGGINGFACE_KEVSUN_ENDPOINT_URL set — LINGUISTIC DIMS COME FROM THE LLM FALLBACK (non-deterministic)',
    );
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), COLD_START_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: essay,
        parameters: { function_to_apply: 'none', truncation: true },
        options: { wait_for_model: true, use_cache: false },
      }),
    });
  } catch (err) {
    clearTimeout(timer);
    wtLog('kevsun ✕ fetch failed/aborted (timeout?) — falling back to LLM scores', {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
  clearTimeout(timer);

  if (!res.ok) {
    wtLog('kevsun ✕ non-200 — falling back to LLM scores', {
      status: res.status,
    });
    return null;
  }
  const json: unknown = await res.json().catch(() => null);
  const rawScores = extractScores(json);
  if (!rawScores) {
    wtLog('kevsun ✕ unexpected response shape — falling back to LLM scores');
    return null;
  }

  const sum = rawScores.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1) < 0.02 && rawScores.every((v) => v < 0.5)) {
    wtLog(
      'kevsun ✕ endpoint returned SOFTMAX (values sum to ≈1, not raw regression logits) — absolute scoring impossible; redeploy the endpoint to return raw logits — falling back',
      { sum, rawScores },
    );
    return null;
  }

  const [cohesion, syntax, vocabulary, phraseology, grammar, conventions] =
    postprocess(rawScores);

  const [
    rawCohesion,
    rawSyntax,
    rawVocabulary,
    rawPhraseology,
    rawGrammar,
    rawConventions,
  ] = rawScores;

  const result = {
    dims: { cohesion, syntax, vocabulary, phraseology, grammar, conventions },
    raw: {
      cohesion: rawCohesion,
      syntax: rawSyntax,
      vocabulary: rawVocabulary,
      phraseology: rawPhraseology,
      grammar: rawGrammar,
      conventions: rawConventions,
    },
  };
  wtLog('kevsun ✓ scored (deterministic per identical input)', {
    rawModelScores: rawScores,
    raw: result.raw,
    dims: result.dims,
  });
  return result;
}
