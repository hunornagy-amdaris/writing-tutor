'use client';

import { useEffect, useRef, useState } from 'react';
import { DEV_CHEAT_TRIGGER } from '@/modules/writing-flow/constants/dev.constants';

function isTypingInField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useDevCheatTrigger(): {
  isOpen: boolean;
  close: () => void;
} {
  const [isOpen, setIsOpen] = useState(false);
  const bufferRef = useRef('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.length !== 1) return;
      if (isTypingInField(event.target)) return;
      const next = (bufferRef.current + event.key).slice(-DEV_CHEAT_TRIGGER.length);
      bufferRef.current = next;
      if (next === DEV_CHEAT_TRIGGER) {
        bufferRef.current = '';
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, close: () => setIsOpen(false) };
}
