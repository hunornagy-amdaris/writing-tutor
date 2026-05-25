'use client';

import { create } from 'zustand';
import { FLOW_STEPS, DEFAULT_PROMPT } from '@/modules/writing-flow/constants/steps.constants';
import { hasSentenceIssues } from '@/modules/writing-flow/lib/sentence-fix';
import type {
  BrainstormMode,
  BrainstormState,
  ChatMessage,
  FlowAnalysis,
  FlowScores,
  FlowStep,
  ReviewChatMessage,
  TutorMode,
} from '@/modules/writing-flow/types/flow.types';
import type {
  QuizQuestions,
  QuizState,
} from '@/modules/writing-flow/types/quiz.types';

type FlowState = {
  step: FlowStep;
  maxStep: FlowStep;
  prompt: string;
  brainstorm: BrainstormState;
  essay: string;
  analysis: FlowAnalysis | null;
  edits: Record<number, string>;
  scoreAfterEdits: FlowScores | null;
  selectedSentenceIndex: number | null;
  tutorMode: TutorMode;
  quiz: QuizState;
  editMode: boolean;
  editingSentenceIndex: number | null;
  fixedSentenceIndices: number[];
  reviewMessages: ReviewChatMessage[];
};

type FlowActions = {
  setStep: (step: FlowStep) => void;
  setPrompt: (prompt: string) => void;
  setBrainstormMode: (mode: BrainstormMode) => void;
  addBrainstormMessage: (message: ChatMessage) => void;
  setVoiceActive: (active: boolean) => void;
  setEssay: (essay: string) => void;
  setAnalysis: (analysis: FlowAnalysis | null) => void;
  setEdit: (index: number, value: string) => void;
  setScoreAfterEdits: (scores: FlowScores | null) => void;
  setSelectedSentenceIndex: (index: number | null) => void;
  setTutorMode: (mode: TutorMode) => void;
  openQuiz: (sentenceIndex: number) => void;
  closeQuiz: () => void;
  setQuizQuestions: (questions: QuizQuestions) => void;
  setMcChoice: (choice: string) => void;
  setGapAnswer: (answer: string) => void;
  submitMc: () => void;
  submitGap: () => void;
  nextQuestion: () => void;
  setEditMode: (value: boolean) => void;
  setEditingSentenceIndex: (index: number | null) => void;
  commitSentenceEdit: (index: number, text: string) => void;
  addReviewMessage: (message: ReviewChatMessage) => void;
  reset: () => void;
};

const stepOrder = FLOW_STEPS.map((s) => s.id);

const stepRank = (step: FlowStep): number => stepOrder.indexOf(step);

const initialState: FlowState = {
  step: 'brainstorm',
  maxStep: 'brainstorm',
  prompt: DEFAULT_PROMPT,
  brainstorm: {
    mode: 'type',
    messages: [],
    isVoiceActive: false,
  },
  essay: '',
  analysis: null,
  edits: {},
  scoreAfterEdits: null,
  selectedSentenceIndex: null,
  tutorMode: 'type',
  quiz: {
    isOpen: false,
    sentenceIndex: null,
    questionIndex: 0,
    mcChoice: null,
    gapAnswer: '',
    mcCorrect: null,
    gapCorrect: null,
    isChecking: false,
    stage: 'mc',
    questions: null,
  },
  editMode: false,
  editingSentenceIndex: null,
  fixedSentenceIndices: [],
  reviewMessages: [],
};

const freshQuiz = (sentenceIndex: number): QuizState => ({
  isOpen: true,
  sentenceIndex,
  questionIndex: 0,
  mcChoice: null,
  gapAnswer: '',
  mcCorrect: null,
  gapCorrect: null,
  isChecking: false,
  stage: 'mc',
  questions: null,
});

export const useFlowStore = create<FlowState & FlowActions>((set) => ({
  ...initialState,
  setStep: (step) =>
    set((state) => ({
      step,
      maxStep: stepRank(step) > stepRank(state.maxStep) ? step : state.maxStep,
    })),
  setPrompt: (prompt) => set({ prompt }),
  setBrainstormMode: (mode) =>
    set((state) => ({ brainstorm: { ...state.brainstorm, mode } })),
  addBrainstormMessage: (message) =>
    set((state) => ({
      brainstorm: {
        ...state.brainstorm,
        messages: [...state.brainstorm.messages, message],
      },
    })),
  setVoiceActive: (active) =>
    set((state) => ({ brainstorm: { ...state.brainstorm, isVoiceActive: active } })),
  setEssay: (essay) => set({ essay }),
  setAnalysis: (analysis) => set({ analysis }),
  setEdit: (index, value) =>
    set((state) => ({ edits: { ...state.edits, [index]: value } })),
  setScoreAfterEdits: (scores) => set({ scoreAfterEdits: scores }),
  setSelectedSentenceIndex: (index) => set({ selectedSentenceIndex: index }),
  setTutorMode: (mode) => set({ tutorMode: mode }),
  openQuiz: (sentenceIndex) => set({ quiz: freshQuiz(sentenceIndex) }),
  closeQuiz: () => set({ quiz: initialState.quiz }),
  setQuizQuestions: (questions) =>
    set((state) => ({ quiz: { ...state.quiz, questions } })),
  setMcChoice: (choice) =>
    set((state) => ({ quiz: { ...state.quiz, mcChoice: choice } })),
  setGapAnswer: (answer) =>
    set((state) => ({ quiz: { ...state.quiz, gapAnswer: answer } })),
  submitMc: () =>
    set((state) => {
      const { quiz } = state;
      if (!quiz.questions || quiz.mcChoice === null) return state;
      const correctOption = quiz.questions.mc.options[quiz.questions.mc.correctIndex];
      const isCorrect = quiz.mcChoice === correctOption;
      return { quiz: { ...quiz, mcCorrect: isCorrect } };
    }),
  submitGap: () =>
    set((state) => {
      const { quiz } = state;
      if (!quiz.questions) return state;
      const expected = quiz.questions.gap.correctAnswer.trim().toLowerCase();
      const given = quiz.gapAnswer.trim().toLowerCase();
      const isCorrect = expected === given;
      return { quiz: { ...quiz, gapCorrect: isCorrect } };
    }),
  nextQuestion: () =>
    set((state) => {
      const { quiz } = state;
      if (quiz.stage === 'mc') {
        return {
          quiz: { ...quiz, stage: 'gap', questionIndex: 1 },
        };
      }
      if (quiz.stage === 'gap') {
        return { quiz: { ...quiz, stage: 'complete' } };
      }
      return state;
    }),
  setEditMode: (value) => set({ editMode: value }),
  setEditingSentenceIndex: (index) => set({ editingSentenceIndex: index }),
  commitSentenceEdit: (index, text) =>
    set((state) => ({
      edits: { ...state.edits, [index]: text },
      fixedSentenceIndices: state.fixedSentenceIndices.includes(index)
        ? state.fixedSentenceIndices
        : [...state.fixedSentenceIndices, index],
      editingSentenceIndex: null,
    })),
  addReviewMessage: (message) =>
    set((state) => ({
      reviewMessages: [...state.reviewMessages, message],
    })),
  reset: () => set({ ...initialState }),
}));

export const selectStep = (s: FlowState & FlowActions): FlowStep => s.step;
export const selectMaxStep = (s: FlowState & FlowActions): FlowStep => s.maxStep;
export const selectPrompt = (s: FlowState & FlowActions): string => s.prompt;
export const selectBrainstorm = (s: FlowState & FlowActions): BrainstormState => s.brainstorm;
export const selectEssay = (s: FlowState & FlowActions): string => s.essay;
export const selectAnalysis = (s: FlowState & FlowActions): FlowAnalysis | null => s.analysis;
export const selectEdits = (s: FlowState & FlowActions): Record<number, string> => s.edits;
export const selectScoreAfterEdits = (s: FlowState & FlowActions): FlowScores | null =>
  s.scoreAfterEdits;
export const selectSelectedSentenceIndex = (
  s: FlowState & FlowActions,
): number | null => s.selectedSentenceIndex;
export const selectTutorMode = (s: FlowState & FlowActions): TutorMode => s.tutorMode;
export const selectQuiz = (s: FlowState & FlowActions): QuizState => s.quiz;
export const selectReviewMessages = (
  s: FlowState & FlowActions,
): ReviewChatMessage[] => s.reviewMessages;
export const selectEditMode = (s: FlowState & FlowActions): boolean => s.editMode;
export const selectEditingSentenceIndex = (s: FlowState & FlowActions): number | null =>
  s.editingSentenceIndex;
export const selectFixedSentenceIndices = (s: FlowState & FlowActions): number[] =>
  s.fixedSentenceIndices;

export type FixProgress = { fixed: number; total: number; remaining: number };

export const selectFixProgress = (s: FlowState & FlowActions): FixProgress => {
  const total = s.analysis
    ? s.analysis.sentences.filter(hasSentenceIssues).length
    : 0;
  const fixed = s.fixedSentenceIndices.length;
  return { fixed, total, remaining: Math.max(0, total - fixed) };
};

export const isStepReachable = (current: FlowStep, target: FlowStep): boolean =>
  stepRank(target) <= stepRank(current);
