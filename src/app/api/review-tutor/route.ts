import { NextResponse } from 'next/server';
import { openai, OPENAI_MODEL } from '@/lib/openai';
import { buildReviewTutorSystemPrompt } from '@/modules/writing-flow/lib/review-tutor-system-prompt';
import { reviewTutorRequestSchema } from '@/modules/writing-flow/schemas/review-tutor.schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const parsed = reviewTutorRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { prompt, sentence, messages } = parsed.data;

  const systemPrompt = buildReviewTutorSystemPrompt({
    writingTaskPrompt: prompt,
    sentence: {
      original: sentence.original,
      corrected: sentence.corrected,
      index: sentence.index,
    },
    edits: sentence.grammarEdits,
    flags: sentence.phraseologyFlags,
  });

  const chatMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === 'ai' ? ('assistant' as const) : ('user' as const),
      content: m.content,
    })),
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      max_tokens: 400,
      messages: chatMessages,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'Unexpected OpenAI response shape' },
        { status: 502 },
      );
    }

    const message = content.trim();
    return NextResponse.json({ message }, { status: 200 });
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
