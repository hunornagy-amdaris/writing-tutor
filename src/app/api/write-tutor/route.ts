import { NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/lib/env';
import { writeTutorRequestSchema } from '@/modules/writing-flow/schemas/write-tutor.schema';
import { WRITE_TUTOR_SYSTEM_PROMPT } from '@/modules/writing-flow/lib/write-tutor-system-prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const openRouterResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({ content: z.string() }),
      }),
    )
    .min(1),
});

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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'X-Title': env.OPENROUTER_APP_NAME,
    };
    if (env.OPENROUTER_SITE_URL) {
      headers['HTTP-Referer'] = env.OPENROUTER_SITE_URL;
    }

    const res = await fetch(`${env.OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: env.OPENROUTER_MODEL,
        max_tokens: 600,
        messages: [
          { role: 'system', content: WRITE_TUTOR_SYSTEM_PROMPT },
          { role: 'system', content: contextBlock },
          ...conversation,
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `OpenRouter ${res.status}` },
        { status: 502 },
      );
    }

    const rawJson: unknown = await res.json();
    const orParsed = openRouterResponseSchema.safeParse(rawJson);
    if (!orParsed.success) {
      return NextResponse.json(
        { error: 'Unexpected OpenRouter response shape' },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { reply: orParsed.data.choices[0].message.content.trim() },
      { status: 200 },
    );
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
