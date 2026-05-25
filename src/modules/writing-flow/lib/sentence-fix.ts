import type { AnalyzedSentence } from '@/modules/writing-flow/types/analysis.types';
import type {
  SentenceBadgeKind,
  SentenceFixPair,
} from '@/modules/writing-flow/types/review.types';

export const hasSentenceIssues = (s: AnalyzedSentence): boolean =>
  s.grammar_edits.length > 0 || s.phraseology_flags.length > 0;

export const getSentenceBadgeKind = (s: AnalyzedSentence): SentenceBadgeKind => {
  const hasGrammar = s.grammar_edits.length > 0;
  const hasPhrasing = s.phraseology_flags.length > 0;
  if (hasGrammar && hasPhrasing) return 'grammar + phrasing';
  if (hasGrammar) return 'grammar';
  if (hasPhrasing) return 'phrasing';
  return null;
};

// Extracts the YOURS / BETTER fragment pair for the comparison card.
// Uses the first grammar edit if present, else the first phraseology flag.
export const getSentenceFixPair = (s: AnalyzedSentence): SentenceFixPair => {
  const edit = s.grammar_edits[0];
  if (edit) {
    if (edit.type === 'replace' && edit.correction) {
      return { yours: edit.token, better: edit.correction };
    }
    if (edit.type === 'delete') {
      return { yours: edit.token, better: '' };
    }
    if (edit.type === 'insert' && edit.correction) {
      return { yours: '', better: edit.correction };
    }
  }
  const flag = s.phraseology_flags[0];
  if (flag) {
    const suggestion = flag.suggestions[0];
    if (suggestion) {
      return { yours: flag.token, better: suggestion };
    }
  }
  return null;
};

export const getSentencePracticeCorrection = (s: AnalyzedSentence): string => {
  if (s.grammar_edits.length > 0) return s.corrected;
  const flag = s.phraseology_flags[0];
  const suggestion = flag?.suggestions[0];
  if (!flag || !suggestion) return s.corrected;
  const escaped = flag.token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
  return s.original.replace(pattern, suggestion);
};
