import type { AnalyzedSentence } from '@/modules/essay-tutor/types/analysis.types';

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

export function buildFirstMessage(sentence: AnalyzedSentence): string {
  if (!sentence.has_errors && sentence.phraseology_flags.length === 0) {
    return `Okay, let's look at your next sentence: "${sentence.original}" — this one sounds great! Nice work.`;
  }
  return `Okay, let's look at your next sentence: "${sentence.original}" — can you hear anything that sounds a bit off?`;
}

export function buildSentenceSummary(sentence: AnalyzedSentence, index: number): string {
  const issues: string[] = [];
  for (const edit of sentence.grammar_edits) {
    if (edit.type === 'replace') {
      issues.push(`${edit.token} → ${edit.correction ?? ''}`);
    } else if (edit.type === 'delete') {
      issues.push(`removed "${edit.token}"`);
    } else {
      issues.push(`added "${edit.token}"`);
    }
  }
  for (const flag of sentence.phraseology_flags) {
    issues.push(`"${flag.token}" flagged as unnatural (rank ${flag.rank})`);
  }
  const issuesText = issues.join('; ') || 'none (clean sentence)';
  return `- Sentence ${index + 1}: "${sentence.original.substring(0, 50)}..." — Issues discussed: ${issuesText}`;
}

export type TutorDynamicVariables = {
  current_sentence_original: string;
  current_sentence_corrected: string;
  grammar_data: string;
  phraseology_data: string;
  session_history: string;
  special_note: string;
};

export function buildDynamicVariables(
  sentence: AnalyzedSentence,
  sessionHistory: string[],
): TutorDynamicVariables {
  return {
    current_sentence_original: sentence.original,
    current_sentence_corrected: sentence.corrected,
    grammar_data: buildGrammarData(sentence),
    phraseology_data: buildPhraseologyData(sentence),
    session_history: buildSessionHistoryData(sessionHistory),
    special_note: buildSpecialNote(sentence),
  };
}
