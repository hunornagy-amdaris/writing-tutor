import { NextResponse } from 'next/server';
import { openai, OPENAI_MODEL } from '@/lib/openai';
import { brainstormChatRequestSchema } from '@/modules/writing-flow/schemas/brainstorm-chat.schema';
import { buildBrainstormSystemPrompt } from '@/modules/writing-flow/lib/brainstorm-system-prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const parsed = brainstormChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { prompt, messages } = parsed.data;

  const systemPrompt = buildBrainstormSystemPrompt({
    writingTaskPrompt: prompt,
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

    return NextResponse.json({ message: content.trim() }, { status: 200 });
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
