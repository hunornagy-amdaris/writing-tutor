import type { AnalysisResult, EssayScores } from '@/modules/writing-flow/types/analysis.types';

export type FlowStep = 'brainstorm' | 'write' | 'review' | 'score';

export type BrainstormMode = 'type' | 'voice';

export type TutorMode = 'type' | 'voice';

export type ChatRole = 'user' | 'ai';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type ReviewChatMessage = ChatMessage & {
  sentenceIndex: number;
};

export type BrainstormState = {
  mode: BrainstormMode;
  messages: ChatMessage[];
  isVoiceActive: boolean;
};

export type FlowAnalysis = AnalysisResult;
export type FlowScores = EssayScores;
