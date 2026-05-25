export type ScoreBarCellKey =
  | 'content'
  | 'form'
  | 'develop'
  | 'grammar'
  | 'ling'
  | 'vocab'
  | 'spelling'
  | 'conv';

export type ScoreBarCellValue = {
  key: ScoreBarCellKey;
  label: string;
  numerator: number;
  denominator: number;
};

export type ScoreBarData = {
  overall: number;
  overallOutOf: number;
  cells: ScoreBarCellValue[];
};

import type { ParagraphLabel } from '@/modules/writing-flow/types/analysis.types';

export type { ParagraphLabel };

export type ParagraphTab = {
  label: ParagraphLabel;
  hasErrors: boolean;
};

export type SentenceBadgeKind = 'grammar' | 'phrasing' | 'grammar + phrasing' | null;

export type SentenceFixPair = {
  yours: string;
  better: string;
} | null;

export type TutorPanelStage = 'initial' | 'socratic' | 'explained';
