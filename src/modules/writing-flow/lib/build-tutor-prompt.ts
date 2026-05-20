import type { AnalyzedSentence } from '@/modules/writing-flow/types/analysis.types';

export function buildGrammarData(sentence: AnalyzedSentence): string {
  if (sentence.grammar_edits.length === 0) return 'No grammar issues detected.';
  return sentence.grammar_edits
    .map((edit) => {
      if (edit.type === 'replace') {
        return `- Replace "${edit.token}" with "${edit.correction ?? ''}"`;
      }
      if (edit.type === 'delete') {
        return `- Delete unnecessary word "${edit.token}"`;
      }
      return `- Insert "${edit.token}" (missing word)`;
    })
    .join('\n');
}

export function buildPhraseologyData(sentence: AnalyzedSentence): string {
  if (sentence.phraseology_flags.length === 0) return 'No phraseology issues detected.';
  return sentence.phraseology_flags
    .map(
      (flag) =>
        `- "${flag.token}" sounds unnatural (rank ${flag.rank}) — native speakers would more likely use: ${flag.suggestions.join(', ')}`,
    )
    .join('\n');
}

export function buildSessionHistoryData(sessionHistory: string[]): string {
  if (sessionHistory.length === 0) return 'This is the first sentence we are discussing.';
  return sessionHistory.join('\n');
}

export function buildSpecialNote(sentence: AnalyzedSentence): string {
  if (!sentence.has_errors && sentence.phraseology_flags.length === 0) {
    return 'This sentence has no errors! Praise the student and confirm the sentence sounds natural.';
  }
  return '';
}
