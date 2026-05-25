import { NextResponse } from 'next/server';
import { openai, OPENAI_MODEL } from '@/lib/openai';
import {
  quizGenerationRequestSchema,
  quizQuestionsSchema,
} from '@/modules/writing-flow/schemas/quiz.schema';
import { buildQuizSystemPrompt } from '@/modules/writing-flow/lib/quiz-system-prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

  const parsed = quizGenerationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      max_completion_tokens: 1500,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'user', content: buildQuizSystemPrompt(parsed.data) },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'Unexpected OpenAI response shape' },
        { status: 502 },
      );
    }

    const stripped = stripCodeFences(content);

    let json: unknown;
    try {
      json = JSON.parse(stripped);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse quiz' },
        { status: 500 },
      );
    }

    const validated = quizQuestionsSchema.safeParse(json);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Failed to validate quiz' },
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
