import type {
  AnalysisResult,
  Paragraph,
  ParagraphLabel,
} from '@/modules/writing-flow/types/analysis.types';

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
      (i) => analysis.sentences[i]?.has_errors === true,
    ),
  }));
}
