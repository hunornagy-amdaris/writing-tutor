import type {
  AnalysisResult,
  Paragraph,
  ParagraphLabel,
} from '@/modules/writing-flow/types/analysis.types';
import { hasSentenceIssues } from '@/modules/writing-flow/lib/sentence-fix';

export type DerivedParagraphTab = {
  label: ParagraphLabel;
  hasErrors: boolean;
  sentenceIndices: number[];
};

export function deriveParagraphTabs(
  analysis: AnalysisResult,
): DerivedParagraphTab[] {
  const paragraphs: Paragraph[] = analysis.paragraphs ?? [
    {
      label: 'Introduction',
      sentenceIndices: analysis.sentences.map((_, i) => i),
    },
  ];

  return paragraphs.map((p) => ({
    label: p.label,
    sentenceIndices: p.sentenceIndices,
    hasErrors: p.sentenceIndices.some(
      (i) => {
        const sentence = analysis.sentences[i];
        return sentence ? hasSentenceIssues(sentence) : false;
      },
    ),
  }));
}
