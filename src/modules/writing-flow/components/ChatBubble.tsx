import type { ChatRole } from '@/modules/writing-flow/types/flow.types';

type ChatBubbleProps = {
  role: ChatRole;
  content: string;
};

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === 'user';
  const wrapper = isUser ? 'justify-end' : 'justify-start';
  const bubble = isUser
    ? 'bg-msg-user rounded-tl-msg rounded-tr-msg rounded-br-sm rounded-bl-msg'
    : 'bg-msg-ai rounded-tl-sm rounded-tr-msg rounded-br-msg rounded-bl-msg';

  return (
    <div className={`motion-fade-in-up flex w-full ${wrapper}`}>
      <p
        className={`max-w-4/5 px-msg-x py-msg-y text-prompt text-ink-900 ${bubble}`}
      >
        {content}
      </p>
    </div>
  );
}
