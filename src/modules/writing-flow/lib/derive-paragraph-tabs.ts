import type {
  AnalysisResult,
  Paragraph,
  ParagraphLabel,
} from '@/modules/writing-flow/types/analysis.types';
import type { ParagraphTabStatus } from '@/modules/writing-flow/types/review.types';
import { hasSentenceIssues } from '@/modules/writing-flow/lib/sentence-fix';

export type DerivedParagraphTab = {
  label: ParagraphLabel;
  status: ParagraphTabStatus;
  sentenceIndices: number[];
};

export function deriveParagraphTabs(
  analysis: AnalysisResult,
  fixedSentenceIndices: number[],
): DerivedParagraphTab[] {
  const paragraphs: Paragraph[] = analysis.paragraphs ?? [
    {
      label: 'Introduction',
      sentenceIndices: analysis.sentences.map((_, i) => i),
    },
  ];

  return paragraphs.map((p) => {
    const issueIndices = p.sentenceIndices.filter((i) => {
      const sentence = analysis.sentences[i];
      return sentence ? hasSentenceIssues(sentence) : false;
    });
    const status: ParagraphTabStatus =
      issueIndices.length === 0
        ? 'none'
        : issueIndices.every((i) => fixedSentenceIndices.includes(i))
          ? 'fixed'
          : 'errors';
    return { label: p.label, sentenceIndices: p.sentenceIndices, status };
  });
}
