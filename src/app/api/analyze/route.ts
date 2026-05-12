import { NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/lib/env';
import { analysisResultSchema } from '@/modules/essay-tutor/schemas/analysis.schema';
import { buildAnalyzerPrompt } from '@/modules/essay-tutor/constants/analyzer-prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  text: z.string().min(1).max(10000),
});

const openRouterResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({ content: z.string() }),
      }),
    )
    .min(1),
});

function stripCodeFences(input: string): string {
  let out = input.trim();
  if (out.startsWith('```')) {
    out = out.replace(/^```(?:json)?\s*\n?/i, '');
    out = out.replace(/\n?```\s*$/i, '');
  }
  return out.trim();
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

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
        max_tokens: 4000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'user', content: buildAnalyzerPrompt(parsed.data.text) },
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

    const stripped = stripCodeFences(orParsed.data.choices[0].message.content);

    let json: unknown;
    try {
      json = JSON.parse(stripped);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse analysis' },
        { status: 500 },
      );
    }

    const validated = analysisResultSchema.safeParse(json);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Failed to validate analysis' },
        { status: 500 },
      );
    }

    return NextResponse.json(validated.data, { status: 200 });
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
