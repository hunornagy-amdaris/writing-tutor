import { NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/lib/env';
import { brainstormChatRequestSchema } from '@/modules/writing-flow/schemas/brainstorm-chat.schema';
import { buildBrainstormSystemPrompt } from '@/modules/writing-flow/lib/brainstorm-system-prompt';

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

  const parsed = brainstormChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { prompt, messages } = parsed.data;

  const systemPrompt = buildBrainstormSystemPrompt({
    writingTaskPrompt: prompt,
  });

  const openRouterMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === 'ai' ? ('assistant' as const) : ('user' as const),
      content: m.content,
    })),
  ];

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
        max_tokens: 400,
        messages: openRouterMessages,
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

    const message = orParsed.data.choices[0].message.content.trim();
    return NextResponse.json({ message }, { status: 200 });
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
