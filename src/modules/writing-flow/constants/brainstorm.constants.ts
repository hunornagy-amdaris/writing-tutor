export type BrainstormChip = {
  id: 'position' | 'argument' | 'counter';
  emoji: string;
  label: string;
  text: string;
};

export const BRAINSTORM_CHIPS: readonly BrainstormChip[] = [
  {
    id: 'position',
    emoji: '🤔',
    label: 'Help me take a position',
    text: 'Help me take a position',
  },
  {
    id: 'argument',
    emoji: '💡',
    label: 'Suggest an argument',
    text: 'Suggest an argument',
  },
  {
    id: 'counter',
    emoji: '⚖️',
    label: "What's the counter-view?",
    text: "What's the counter-view?",
  },
] as const;

export const BRAINSTORM_OPENER =
  'When you read this prompt — gut reaction. Keep DST or scrap it?';

export const BRAINSTORM_INPUT_PLACEHOLDER = 'Ask anything in your language…';

export const BRAINSTORM_HELPER_TEXT =
  'You can write in English, Spanish, Portuguese, Hindi, or any language';

export const VOICE_PANEL_TITLE = 'AI tutor is listening…';

export const VOICE_PANEL_HELPER =
  'Discuss the prompt out loud in any language. When you’re ready to write, say "I’m done brainstorming" or tap below.';
