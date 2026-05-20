import type { AnalyzedSentence } from '@/modules/essay-tutor/types/analysis.types';
import {
  buildGrammarData,
  buildPhraseologyData,
  buildSessionHistoryData,
  buildSpecialNote,
} from '@/modules/essay-tutor/lib/build-tutor-prompt';

export type ReviewVoiceDynamicVariables = {
  current_sentence_original: string;
  current_sentence_corrected: string;
  grammar_data: string;
  phraseology_data: string;
  session_history: string;
  special_note: string;
  writing_task_prompt: string;
};

export function buildReviewVoiceDynamicVars(
  sentence: AnalyzedSentence,
  prompt: string,
): ReviewVoiceDynamicVariables {
  return {
    current_sentence_original: sentence.original,
    current_sentence_corrected: sentence.corrected,
    grammar_data: buildGrammarData(sentence),
    phraseology_data: buildPhraseologyData(sentence),
    session_history: buildSessionHistoryData([]),
    special_note: buildSpecialNote(sentence),
    writing_task_prompt: prompt,
  };
}
