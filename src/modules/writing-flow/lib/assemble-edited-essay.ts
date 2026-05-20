import type { AnalysisResult } from '@/modules/writing-flow/types/analysis.types';

export function assembleEditedEssay(
  analysis: AnalysisResult,
  edits: Record<number, string>,
): string {
  return analysis.sentences
    .map((sentence, index) => {
      const edited = edits[index];
      const text = typeof edited === 'string' ? edited : sentence.original;
      return text.trim();
    })
    .filter((text) => text.length > 0)
    .join(' ');
}
