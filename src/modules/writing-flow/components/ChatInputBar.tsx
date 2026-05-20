'use client';

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type ChatInputBarProps = {
  placeholder: string;
  disabled?: boolean;
  isPending?: boolean;
  onSubmit: (text: string) => void;
};

export function ChatInputBar({
  placeholder,
  disabled = false,
  isPending = false,
  onSubmit,
}: ChatInputBarProps) {
  const [value, setValue] = useState<string>('');
  const isDisabled = disabled || isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isDisabled) return;
    onSubmit(trimmed);
    setValue('');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-input-bar w-full items-center gap-2 rounded-pill border-2 border-line bg-surface pr-2 pl-4"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={isDisabled}
        className="h-full flex-1 bg-transparent text-input text-ink-900 placeholder:text-ink-400 focus:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isDisabled || value.trim().length === 0}
        aria-label="Send message"
        className="motion-press flex size-7 items-center justify-center rounded-pill bg-nav-bg text-surface disabled:opacity-50"
      >
        <ArrowRight className="size-4" aria-hidden />
      </button>
    </form>
  );
}
