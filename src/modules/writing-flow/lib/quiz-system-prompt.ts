import type { z } from 'zod';
import type {
  quizGenerationRequestSchema,
  quizGrammarEditSchema,
  quizPhraseologyFlagSchema,
} from '@/modules/writing-flow/schemas/quiz.schema';

type QuizGenerationRequest = z.infer<typeof quizGenerationRequestSchema>;
type QuizGrammarEdit = z.infer<typeof quizGrammarEditSchema>;
type QuizPhraseologyFlag = z.infer<typeof quizPhraseologyFlagSchema>;

const formatGrammarEdit = (edit: QuizGrammarEdit): string => {
  const parts: string[] = [`type=${edit.type}`, `token="${edit.token}"`];
  if (edit.correction !== undefined) {
    parts.push(`correction="${edit.correction}"`);
  }
  return `- grammar: ${parts.join(', ')}`;
};

const formatPhraseologyFlag = (flag: QuizPhraseologyFlag): string => {
  const suggestions = flag.suggestions.map((s) => `"${s}"`).join(', ');
  return `- phraseology: token="${flag.token}", suggestions=[${suggestions}]`;
};

const formatErrorInfo = (input: QuizGenerationRequest): string => {
  const lines: string[] = [];
  for (const edit of input.grammarEdits) {
    lines.push(formatGrammarEdit(edit));
  }
  for (const flag of input.phraseologyFlags) {
    lines.push(formatPhraseologyFlag(flag));
  }
  if (lines.length === 0) {
    lines.push(
      '- no explicit edit info; infer the single most important learner-relevant error in the sentence.',
    );
  }
  return lines.join('\n');
};

export const buildQuizSystemPrompt = (input: QuizGenerationRequest): string => {
  const errorInfo = formatErrorInfo(input);

  return [
    'You are an English writing coach generating two short practice questions for a PTE student who made a specific error.',
    '',
    'WRITING TASK PROMPT (for context only — do not quiz on the topic):',
    input.prompt,
    '',
    'STUDENT SENTENCE (contains the error):',
    input.sentence,
    '',
    'ERROR INFO:',
    errorInfo,
    '',
    'TASK — produce EXACTLY two questions targeting the single most important error above:',
    '',
    '1. MULTIPLE CHOICE (mc):',
    '   - "stem": always exactly "Which sentence is correct?".',
    '   - "options": EXACTLY 2 FULL SENTENCES. Index 0 must be the student\'s original (incorrect) sentence verbatim. Index 1 must be the corrected version of that sentence.',
    '   - "correctIndex": always exactly 1.',
    '',
    '2. GAP-FILL (gap):',
    '   - Take the corrected version of the sentence and replace ONLY the corrected word or phrase with a blank.',
    '   - "before": the exact text of the corrected sentence up to (but not including) the blank. Preserve original spacing — include the trailing space if one naturally precedes the blank.',
    '   - "after": the exact text of the corrected sentence after the blank. Preserve original spacing.',
    '   - "correctAnswer": the exact word or phrase that fills the blank (matches the corrected form).',
    '',
    '3. RULE (rule):',
    '   - 1–2 sentences explaining the underlying English rule the student missed.',
    '   - Include 2–3 concrete EXAMPLE words or phrases that follow the same rule (e.g. for uncountables: "energy, information, advice, research").',
    '',
    'OUTPUT FORMAT — STRICT JSON only, no markdown, no prose, no code fences. Shape:',
    '{',
    '  "mc": { "stem": string, "options": string[], "correctIndex": number },',
    '  "gap": { "before": string, "after": string, "correctAnswer": string },',
    '  "rule": string',
    '}',
  ].join('\n');
};
