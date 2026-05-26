// Deep-diagnostic logging for the essay analyze/resubmit SCORE pipeline.
// Every step is logged with the "[WT]" tag on BOTH the server terminal
// (route handler / scoring libs) and the browser console (client hooks +
// the __debug block returned by /api/analyze). Grep "[WT]" to find or strip
// these once the score-reliability bug is resolved.

const TAG = '[WT]';

export function wtLog(step: string, data?: unknown): void {
  if (data === undefined) {
    console.log(`${TAG} ${step}`);
    return;
  }
  console.log(`${TAG} ${step}`, data);
}

export function wtRunId(): string {
  return `r${Math.random().toString(36).slice(2, 8)}`;
}

export function essayFingerprint(text: string): {
  length: number;
  words: number;
  preview: string;
} {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return {
    length: text.length,
    words,
    preview: text.length > 200 ? `${text.slice(0, 200)}…` : text,
  };
}
