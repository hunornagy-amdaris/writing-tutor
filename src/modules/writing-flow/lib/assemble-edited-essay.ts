import type { AnalysisResult } from '@/modules/writing-flow/types/analysis.types';

export function assembleEditedEssay(
  analysis: AnalysisResult,
  edits: Record<number, string>,
): string {
  const sentenceTextAt = (index: number): string | null => {
    const sentence = analysis.sentences[index];
    if (!sentence) return null;
    const edited = edits[index];
    const text = typeof edited === 'string' ? edited : sentence.original;
    const trimmed = text.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  if (analysis.paragraphs && analysis.paragraphs.length > 0) {
    const usedIndices = new Set<number>();
    const paragraphTexts: string[] = [];
    for (const paragraph of analysis.paragraphs) {
      const parts: string[] = [];
      for (const i of paragraph.sentenceIndices) {
        const t = sentenceTextAt(i);
        if (t === null) continue;
        usedIndices.add(i);
        parts.push(t);
      }
      if (parts.length > 0) paragraphTexts.push(parts.join(' '));
    }
    const leftover: string[] = [];
    for (let i = 0; i < analysis.sentences.length; i += 1) {
      if (usedIndices.has(i)) continue;
      const t = sentenceTextAt(i);
      if (t !== null) leftover.push(t);
    }
    if (leftover.length > 0) paragraphTexts.push(leftover.join(' '));
    return paragraphTexts.join('\n\n');
  }

  const parts: string[] = [];
  for (let i = 0; i < analysis.sentences.length; i += 1) {
    const t = sentenceTextAt(i);
    if (t !== null) parts.push(t);
  }
  return parts.join(' ');
}
