import { NextResponse } from 'next/server';
import { openai, OPENAI_MODEL } from '@/lib/openai';
import { writeTutorRequestSchema } from '@/modules/writing-flow/schemas/write-tutor.schema';
import { WRITE_TUTOR_SYSTEM_PROMPT } from '@/modules/writing-flow/lib/write-tutor-system-prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const parsed = writeTutorRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { prompt, essay, messages } = parsed.data;

  const conversation = messages.map((m) => ({
    role: m.role === 'ai' ? ('assistant' as const) : ('user' as const),
    content: m.content,
  }));

  const contextBlock = [
    `Writing prompt: ${prompt}`,
    '',
    `Student essay so far (may be empty):`,
    essay.trim().length > 0 ? essay : '(empty)',
  ].join('\n');

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      max_completion_tokens: 600,
      messages: [
        { role: 'system', content: WRITE_TUTOR_SYSTEM_PROMPT },
        { role: 'system', content: contextBlock },
        ...conversation,
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'Unexpected OpenAI response shape' },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply: content.trim() }, { status: 200 });
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
