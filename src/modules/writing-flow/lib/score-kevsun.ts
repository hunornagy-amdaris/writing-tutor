import 'server-only';

import { env } from '@/lib/env';

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

function postprocess(raw: readonly number[]): number[] {
  return raw.map((v) => {
    const scaledToTen = 2.25 * v - 1.25;
    return clamp(round05(scaledToTen / 2), 1, 5);
  });
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
  if (!url) return null;

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
        options: { wait_for_model: true },
      }),
    });
  } catch {
    clearTimeout(timer);
    return null;
  }
  clearTimeout(timer);

  if (!res.ok) return null;
  const json: unknown = await res.json().catch(() => null);
  const rawScores = extractScores(json);
  if (!rawScores) return null;

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

  return {
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
}
