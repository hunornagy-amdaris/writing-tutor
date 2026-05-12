import { create } from 'zustand';
import type { AnalysisResult } from '@/modules/essay-tutor/types/analysis.types';

type TutorState = {
  analysis: AnalysisResult | null;
  activeIndex: number | null;
  completedIndices: Set<number>;
  sessionHistory: string[];
};

type TutorActions = {
  setAnalysis: (analysis: AnalysisResult | null) => void;
  setActiveIndex: (index: number | null) => void;
  markCompleted: (index: number) => void;
  addToHistory: (entry: string) => void;
  reset: () => void;
};

const initialState: TutorState = {
  analysis: null,
  activeIndex: null,
  completedIndices: new Set<number>(),
  sessionHistory: [],
};

export const useTutorStore = create<TutorState & TutorActions>((set) => ({
  ...initialState,
  setAnalysis: (analysis) => set({ analysis }),
  setActiveIndex: (index) => set({ activeIndex: index }),
  markCompleted: (index) =>
    set((state) => ({
      completedIndices: new Set(state.completedIndices).add(index),
    })),
  addToHistory: (entry) =>
    set((state) => ({ sessionHistory: [...state.sessionHistory, entry] })),
  reset: () =>
    set({
      analysis: null,
      activeIndex: null,
      completedIndices: new Set<number>(),
      sessionHistory: [],
    }),
}));
