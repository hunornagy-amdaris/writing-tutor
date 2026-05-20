import type { EssayScores } from '@/modules/essay-tutor/types/analysis.types';
import type {
  ScoreBarCellKey,
  ScoreBarCellValue,
  ScoreBarData,
} from '@/modules/writing-flow/types/review.types';

// TODO Wave 3: replace mapping when /api/analyze returns new rubric
// The legacy EssayScores rubric (cohesion/syntax/vocabulary/phraseology/grammar/conventions/overall)
// uses a 0..5 scale. The new Figma rubric has 8 cells with per-cell denominators and an overall /90.
// This file bridges the two until the analyzer is upgraded.

const DENOMINATORS: Record<ScoreBarCellKey, number> = {
  content: 3,
  form: 2,
  develop: 6,
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

const cellFrom = (key: ScoreBarCellKey, legacy: number): ScoreBarCellValue => {
  const denom = DENOMINATORS[key];
  const numerator = clamp(Math.round((legacy / 5) * denom), 0, denom);
  return { key, label: LABELS[key], numerator, denominator: denom };
};

// Legacy → new-rubric mapping (provisional).
// Choices are intentionally simple and deterministic.
const mapLegacyToCells = (s: EssayScores): Record<ScoreBarCellKey, ScoreBarCellValue> => ({
  content: cellFrom('content', s.cohesion),
  form: cellFrom('form', s.syntax),
  develop: cellFrom('develop', s.cohesion),
  grammar: cellFrom('grammar', s.grammar),
  ling: cellFrom('ling', s.syntax),
  vocab: cellFrom('vocab', s.vocabulary),
  spelling: cellFrom('spelling', s.conventions),
  conv: cellFrom('conv', s.conventions),
});

export const buildScoreBarData = (scores: EssayScores): ScoreBarData => {
  const cells = mapLegacyToCells(scores);
  const overallOutOf = 90;
  const overall = clamp(Math.round((scores.overall / 5) * 18), 0, overallOutOf);
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
  const cells = mapLegacyToCells(scores);
  const overallOutOf = 90;
  const overall = clamp(Math.round((scores.overall / 5) * overallOutOf), 0, overallOutOf);
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
