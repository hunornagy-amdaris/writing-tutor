import type { EssayScores } from '@/modules/writing-flow/types/analysis.types';
import type {
  ScoreBarCellKey,
  ScoreBarCellValue,
  ScoreBarData,
} from '@/modules/writing-flow/types/review.types';

// Real PTE Academic "Write Essay" trait rubric (raw total 15):
//   Content 0–3 · Formal Requirement 0–2 · Development, Structure & Coherence 0–2 ·
//   Grammar 0–2 · General Linguistic Range 0–2 · Vocabulary Range 0–2 · Spelling 0–2
// The analyzer produces each dim on a 1.0–5.0 scale (KevSun linguistic dims +
// Claude content). Each is linearly remapped onto its trait band (1.0 → 0,
// 5.0 → band max) and snapped to the nearest 0.5. Form is word-count-gated, so
// it always earns full marks once an essay reaches this stage.
const DENOMINATORS: Record<ScoreBarCellKey, number> = {
  content: 3,
  form: 2,
  develop: 2,
  grammar: 2,
  ling: 2,
  vocab: 2,
  spelling: 2,
  conv: 2,
};

const LABELS: Record<ScoreBarCellKey, string> = {
  content: 'Content',
  form: 'Form',
  develop: 'Develop.',
  grammar: 'Grammar',
  ling: 'Ling. range',
  vocab: 'Vocab',
  spelling: 'Spelling',
  conv: 'Conv.',
};

// The seven PTE traits, in display order. The legacy 'conv' key is retained in
// the maps above (Spelling already covers conventions) but is no longer shown
// as its own trait.
export const SCORE_BAR_CELL_KEYS: readonly ScoreBarCellKey[] = [
  'content',
  'form',
  'develop',
  'grammar',
  'ling',
  'vocab',
  'spelling',
] as const;

const clamp = (n: number, min: number, max: number): number =>
  Math.min(Math.max(n, min), max);

const round05 = (n: number): number => Math.round(n * 2) / 2;

// Linear remap of a 1.0–5.0 analyzer dim onto a 0–max trait band, snapped to 0.5.
const toBand = (score1to5: number, max: number): number =>
  clamp(round05(((score1to5 - 1) / 4) * max), 0, max);

const cellFrom = (key: ScoreBarCellKey, score1to5: number): ScoreBarCellValue => {
  const denom = DENOMINATORS[key];
  return {
    key,
    label: LABELS[key],
    numerator: toBand(score1to5, denom),
    denominator: denom,
  };
};

// PTE criteria derived from the analyzer's KevSun dims + Claude content score.
// - Content                          = content (Claude vs writing prompt)
// - Formal Requirement               = full marks (word-count gated)
// - Development/Structure/Coherence  = cohesion
// - Grammar                          = grammar
// - General Linguistic Range         = avg(syntax, phraseology)
// - Vocabulary Range                 = vocabulary
// - Spelling                         = conventions
const linguisticRange = (s: EssayScores): number => (s.syntax + s.phraseology) / 2;

const mapToCells = (s: EssayScores): Record<ScoreBarCellKey, ScoreBarCellValue> => ({
  content: cellFrom('content', s.content),
  form: {
    key: 'form',
    label: LABELS.form,
    numerator: DENOMINATORS.form,
    denominator: DENOMINATORS.form,
  },
  develop: cellFrom('develop', s.cohesion),
  grammar: cellFrom('grammar', s.grammar),
  ling: cellFrom('ling', linguisticRange(s)),
  vocab: cellFrom('vocab', s.vocabulary),
  spelling: cellFrom('spelling', s.conventions),
  conv: cellFrom('conv', s.conventions),
});

// PTE Write Essay raw trait total: the sum of the seven traits, out of 15.
const OVERALL_OUT_OF = 15;

const overallFromCells = (
  cells: Record<ScoreBarCellKey, ScoreBarCellValue>,
): number => SCORE_BAR_CELL_KEYS.reduce((sum, k) => sum + cells[k].numerator, 0);

export const buildScoreBarData = (scores: EssayScores): ScoreBarData => {
  const cells = mapToCells(scores);
  return {
    overall: overallFromCells(cells),
    overallOutOf: OVERALL_OUT_OF,
    cells: SCORE_BAR_CELL_KEYS.map((k) => cells[k]),
  };
};

// Score screen shows the same seven traits with short labels matching Figma 4.
export const RUBRIC_CELL_KEYS: readonly ScoreBarCellKey[] = [
  'content',
  'form',
  'develop',
  'grammar',
  'ling',
  'vocab',
  'spelling',
] as const;

const RUBRIC_SHORT_LABELS: Record<ScoreBarCellKey, string> = {
  content: 'Content',
  form: 'Form',
  develop: 'Develop.',
  grammar: 'Grammar',
  ling: 'Ling.',
  vocab: 'Vocab',
  spelling: 'Spell.',
  conv: 'Conv.',
};

export type RubricCell = {
  key: ScoreBarCellKey;
  label: string;
  numerator: number;
  denominator: number;
};

export type RubricScores = {
  overall: number;
  overallOutOf: number;
  cells: RubricCell[];
};

export const mapToRubric = (scores: EssayScores): RubricScores => {
  const cells = mapToCells(scores);
  return {
    overall: overallFromCells(cells),
    overallOutOf: OVERALL_OUT_OF,
    cells: RUBRIC_CELL_KEYS.map((k) => ({
      key: k,
      label: RUBRIC_SHORT_LABELS[k],
      numerator: cells[k].numerator,
      denominator: cells[k].denominator,
    })),
  };
};
