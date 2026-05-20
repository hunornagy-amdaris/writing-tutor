import type { AnalyzedSentence } from '@/modules/essay-tutor/types/analysis.types';
import type {
  SentenceBadgeKind,
  SentenceFixPair,
} from '@/modules/writing-flow/types/review.types';

// Returns the badge kind for a flagged sentence (grammar takes precedence over vocab).
export const getSentenceBadgeKind = (s: AnalyzedSentence): SentenceBadgeKind => {
  if (!s.has_errors) return null;
  if (s.grammar_edits.length > 0) return 'grammar';
  if (s.phraseology_flags.length > 0) return 'vocab';
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
