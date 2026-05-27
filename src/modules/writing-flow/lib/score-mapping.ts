import type { EssayScores } from '@/modules/writing-flow/types/analysis.types';
import type {
  ScoreBarCellKey,
  ScoreBarCellValue,
  ScoreBarData,
} from '@/modules/writing-flow/types/review.types';

// PTE-criterion → UI-cell bridge. The analyzer returns six raw KevSun dims
// (cohesion/syntax/vocabulary/phraseology/grammar/conventions) plus a Claude-graded
// content score; this file folds them into the six PTE criteria and lays them out
// across the eight Figma cells. Form is UI-enforced (word-count gate), so it always
// gets full marks once an essay reaches this stage.

// Display denominators are 5 across the board so each PTE cell shows the
// exact 1:1 equivalent of its source (KevSun-postprocessed dim or LLM content),
// e.g. KevSun cohesion 3.5 → "3.5/5". Form is UI-enforced (200–300 words gate)
// and always 5/5 once the essay reaches this stage.
const DENOMINATORS: Record<ScoreBarCellKey, number> = {
  content: 5,
  form: 5,
  develop: 5,
  grammar: 5,
  ling: 5,
  vocab: 5,
  spelling: 5,
  conv: 5,
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

// Subset shown in the score-bar (Score screen will show all 8 incl. Conv.)
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

const cellFrom = (key: ScoreBarCellKey, pteScore: number): ScoreBarCellValue => {
  const denom = DENOMINATORS[key];
  const numerator = clamp(Math.round(pteScore * 2) / 2, 0, denom);
  return { key, label: LABELS[key], numerator, denominator: denom };
};

// PTE criteria derived from the analyzer's raw KevSun dims + Claude content score.
// - Content                = content (Claude vs writing prompt)
// - Development/Structure/Coherence = cohesion
// - Grammar                = grammar
// - General Linguistic Range = avg(syntax, phraseology)
// - Vocabulary Range       = vocabulary
// - Spelling               = conventions
const linguisticRange = (s: EssayScores): number => (s.syntax + s.phraseology) / 2;

const mapToCells = (s: EssayScores): Record<ScoreBarCellKey, ScoreBarCellValue> => {
  const formDenom = DENOMINATORS.form;
  return {
    content: cellFrom('content', s.content),
    form: { key: 'form', label: LABELS.form, numerator: formDenom, denominator: formDenom },
    develop: cellFrom('develop', s.cohesion),
    grammar: cellFrom('grammar', s.grammar),
    ling: cellFrom('ling', linguisticRange(s)),
    vocab: cellFrom('vocab', s.vocabulary),
    spelling: cellFrom('spelling', s.conventions),
    conv: cellFrom('conv', s.conventions),
  };
};

// PTE Academic overall is reported on a 10–90 scale (10 is the floor, not 0).
// The analyzer pipeline produces "overall" on a 1.0–5.0 scale; we map linearly
// so 1.0 → 10 and 5.0 → 90.
const toPteOverall = (overall1To5: number): number =>
  clamp(10 + Math.round(((overall1To5 - 1) / 4) * 80), 10, 90);

export const buildScoreBarData = (scores: EssayScores): ScoreBarData => {
  const cells = mapToCells(scores);
  const overallOutOf = 90;
  const overall = toPteOverall(scores.overall);
  return {
    overall,
    overallOutOf,
    cells: SCORE_BAR_CELL_KEYS.map((k) => cells[k]),
  };
};

// Score screen needs all 8 cells (incl. Conv.) with short labels matching Figma 4.
export const RUBRIC_CELL_KEYS: readonly ScoreBarCellKey[] = [
  'content',
  'form',
  'develop',
  'grammar',
  'ling',
  'vocab',
  'spelling',
  'conv',
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
  const overallOutOf = 90;
  const overall = toPteOverall(scores.overall);
  return {
    overall,
    overallOutOf,
    cells: RUBRIC_CELL_KEYS.map((k) => ({
      key: k,
      label: RUBRIC_SHORT_LABELS[k],
      numerator: cells[k].numerator,
      denominator: cells[k].denominator,
    })),
  };
};
