import type { z } from 'zod';
import type {
  quizMcQuestionSchema,
  quizGapQuestionSchema,
  quizQuestionsSchema,
  quizGenerationRequestSchema,
  quizGenerationResponseSchema,
} from '@/modules/writing-flow/schemas/quiz.schema';

export type QuizMcQuestion = z.infer<typeof quizMcQuestionSchema>;
export type QuizGapQuestion = z.infer<typeof quizGapQuestionSchema>;
export type QuizQuestions = z.infer<typeof quizQuestionsSchema>;
export type QuizGenerationRequest = z.infer<typeof quizGenerationRequestSchema>;
export type QuizGenerationResponse = z.infer<typeof quizGenerationResponseSchema>;

export type QuizStage = 'mc' | 'gap' | 'complete';

export type QuizState = {
  isOpen: boolean;
  sentenceIndex: number | null;
  questionIndex: 0 | 1;
  mcChoice: string | null;
  gapAnswer: string;
  mcCorrect: boolean | null;
  gapCorrect: boolean | null;
  isChecking: boolean;
  stage: QuizStage;
  questions: QuizQuestions | null;
};
