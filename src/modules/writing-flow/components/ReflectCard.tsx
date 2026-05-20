type ReflectCardProps = {
  eyebrow: string;
  body: string;
};

export function ReflectCard({ eyebrow, body }: ReflectCardProps) {
  return (
    <article className="motion-fade-in-up w-reflect-card h-reflect-card-h flex flex-col items-start gap-1.5 rounded-button border border-line bg-surface px-4 py-3">
      <p className="text-eyebrow font-bold text-ink-300">{eyebrow}</p>
      <p className="text-cell-num font-normal text-ink-900">{body}</p>
    </article>
  );
}
