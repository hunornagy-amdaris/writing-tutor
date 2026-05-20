export type GrammarEditType = 'replace' | 'delete' | 'insert';
export type GrammarEdit = { type: GrammarEditType; token: string; correction?: string };
export type PhraseologyFlag = { token: string; rank: number; suggestions: string[] };
export type EssayScores = {
  cohesion: number;
  syntax: number;
  vocabulary: number;
  phraseology: number;
  grammar: number;
  conventions: number;
  overall: number;
};
export type AnalyzedSentence = {
  original: string;
  corrected: string;
  has_errors: boolean;
  grammar_edits: GrammarEdit[];
  phraseology_flags: PhraseologyFlag[];
  phraseology_score?: number;
};
export type ParagraphLabel = 'Introduction' | 'Conclusion' | `Body ${number}`;
export type Paragraph = {
  label: ParagraphLabel;
  sentenceIndices: number[];
};
export type AnalysisResult = {
  scores: EssayScores;
  sentences: AnalyzedSentence[];
  paragraphs?: Paragraph[];
};
