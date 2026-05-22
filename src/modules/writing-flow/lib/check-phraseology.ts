import 'server-only';

import { env } from '@/lib/env';
import type { PhraseologyFlag } from '@/modules/writing-flow/types/analysis.types';

// Spec: a phraseology flag fires when the original token's rank in the
// roberta-base MLM distribution at that position is > 80. We request the top
// 100 predictions, look up the original word's rank, and flag anything that
// either ranks > 80 or doesn't appear in the top 100 at all.
const TOP_K = 100;
const RANK_THRESHOLD = 80;

const MAX_PARALLEL = 6;

// Tokens that aren't worth masking — function words always rank high, and very
// short or non-alphabetic tokens have no useful naturalness signal.
const STOP_WORDS = new Set([
  'the','a','an','is','are','was','were','am','be','been','being','i','my','me',
  'of','in','to','for','on','at','by','with','as','from','about','into','onto',
  'and','or','but','so','if','then','than','that','this','these','those','such',
  'it','its','he','she','they','them','their','his','her','your','our','we','us','you',
  'will','would','can','could','should','may','might','must','shall','do','does','did',
  'have','has','had','having','not','no','yes','very','too','also','only','just',
  'one','two','three','many','some','any','all','each','every','few','several','more','most','less',
]);

type HfPrediction = {
  score: number;
  token: number;
  token_str: string;
  sequence: string;
};

type WordHit = { word: string; raw: string; cleanLower: string; index: number };

function isCheckable(clean: string): boolean {
  if (clean.length < 3 || clean.length > 10) return false;
  if (!/^[a-z']+$/.test(clean)) return false;
  if (STOP_WORDS.has(clean)) return false;
  return true;
}

function tokeniseWords(sentence: string): WordHit[] {
  // Split keeping whitespace runs so we can rebuild the sentence with a single
  // <mask> replacement that preserves punctuation attached to the word.
  const parts = sentence.split(/(\s+)/);
  const hits: WordHit[] = [];
  parts.forEach((raw, index) => {
    const cleanLower = raw.replace(/[^a-zA-Z']/g, '').toLowerCase();
    if (!cleanLower) return;
    if (!isCheckable(cleanLower)) return;
    hits.push({ word: raw, raw, cleanLower, index });
  });
  return hits;
}

function buildMaskedSentence(parts: string[], index: number): string {
  const original = parts[index];
  const masked = original.replace(/[a-zA-Z']+/, '<mask>');
  return [...parts.slice(0, index), masked, ...parts.slice(index + 1)].join('');
}

async function callFillMask(maskedSentence: string): Promise<HfPrediction[] | null> {
  let res: Response;
  try {
    res = await fetch(env.HUGGINGFACE_FILL_MASK_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: maskedSentence,
        parameters: { top_k: TOP_K },
        options: { wait_for_model: true },
      }),
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const json: unknown = await res.json().catch(() => null);
  if (!Array.isArray(json)) return null;
  // HF can return Array<Prediction> for a single <mask>, or Array<Array<Prediction>>
  // if multiple masks. We always send exactly one mask.
  const list = Array.isArray(json[0]) ? (json[0] as unknown[]) : (json as unknown[]);
  const preds: HfPrediction[] = [];
  for (const item of list) {
    if (
      typeof item === 'object' &&
      item !== null &&
      'score' in item &&
      'token' in item &&
      'token_str' in item
    ) {
      const it = item as Record<string, unknown>;
      preds.push({
        score: typeof it.score === 'number' ? it.score : 0,
        token: typeof it.token === 'number' ? it.token : 0,
        token_str: typeof it.token_str === 'string' ? it.token_str : '',
        sequence: typeof it.sequence === 'string' ? it.sequence : '',
      });
    }
  }
  return preds;
}

function rankOf(preds: HfPrediction[], cleanLower: string): number {
  const idx = preds.findIndex((p) => p.token_str.trim().toLowerCase() === cleanLower);
  if (idx === -1) return TOP_K + 1;
  return idx + 1; // 1-based rank
}

function topSuggestions(preds: HfPrediction[], cleanLower: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of preds) {
    const candidate = p.token_str.trim();
    const lower = candidate.toLowerCase();
    if (!candidate || lower === cleanLower || seen.has(lower)) continue;
    if (!/^[a-zA-Z']+$/.test(candidate)) continue;
    seen.add(lower);
    out.push(candidate);
    if (out.length >= 3) break;
  }
  return out;
}

function round05(n: number): number {
  return Math.round(n * 2) / 2;
}

async function inParallel<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

export type PhraseologyResult = {
  flags: PhraseologyFlag[];
  score: number;
};

export async function checkPhraseology(
  sentence: string,
  grammarTokens: ReadonlySet<string> = new Set(),
): Promise<PhraseologyResult> {
  const parts = sentence.split(/(\s+)/);
  const hits = tokeniseWords(sentence);

  // Per spec merge rule: don't double-flag a token already covered by the
  // grammar checker.
  const candidates = hits.filter((h) => !grammarTokens.has(h.cleanLower));

  if (candidates.length === 0) {
    return { flags: [], score: 5 };
  }

  const predictions = await inParallel(candidates, MAX_PARALLEL, async (hit) => {
    const masked = buildMaskedSentence(parts, hit.index);
    const preds = await callFillMask(masked);
    return { hit, preds };
  });

  const flags: PhraseologyFlag[] = [];
  for (const { hit, preds } of predictions) {
    if (!preds || preds.length === 0) continue;
    const rank = rankOf(preds, hit.cleanLower);
    if (rank <= RANK_THRESHOLD) continue;
    flags.push({
      token: hit.raw.replace(/[^a-zA-Z']/g, ''),
      rank,
      suggestions: topSuggestions(preds, hit.cleanLower),
    });
  }

  // Score: 5.0 with no flags, drops 0.5 per flag, floored at 1.0.
  const raw = Math.max(1, 5 - flags.length * 0.5);
  return { flags, score: round05(raw) };
}
