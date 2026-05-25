import { NextResponse } from 'next/server';
import { z } from 'zod';
import { openai, OPENAI_MODEL } from '@/lib/openai';
import { analysisResultSchema } from '@/modules/writing-flow/schemas/analysis.schema';
import { buildAnalyzerPrompt } from '@/modules/writing-flow/constants/analyzer-prompt';
import { checkPhraseology } from '@/modules/writing-flow/lib/check-phraseology';
import { scoreKevSun } from '@/modules/writing-flow/lib/score-kevsun';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const requestSchema = z.object({
  text: z.string().min(1).max(10000),
  prompt: z.string().min(1).max(2000),
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
    const openaiPromise = openai.chat.completions.create({
      model: OPENAI_MODEL,
      max_completion_tokens: 4000,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: buildAnalyzerPrompt(parsed.data.text, parsed.data.prompt),
        },
      ],
    });

    const kevsunPromise = scoreKevSun(parsed.data.text);

    const [completion, kevsun] = await Promise.all([openaiPromise, kevsunPromise]);

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

    // Enrich every sentence with real phraseology data from FacebookAI/roberta-base.
    // Serial over sentences to keep HF concurrency bounded (per-sentence parallelism
    // lives inside checkPhraseology); the route's maxDuration is 60s.
    const enrichedSentences = [];
    for (const sentence of validated.data.sentences) {
      const grammarTokens = new Set(
        sentence.grammar_edits.map((e) => e.token.toLowerCase()),
      );
      const phraseology = await checkPhraseology(sentence.original, grammarTokens);
      enrichedSentences.push({
        ...sentence,
        phraseology_flags: phraseology.flags,
        phraseology_score: phraseology.score,
      });
    }

    const scores = kevsun
      ? (() => {
          const merged = {
            ...validated.data.scores,
            cohesion: kevsun.dims.cohesion,
            syntax: kevsun.dims.syntax,
            vocabulary: kevsun.dims.vocabulary,
            phraseology: kevsun.dims.phraseology,
            grammar: kevsun.dims.grammar,
            conventions: kevsun.dims.conventions,
          };
          const glr = (merged.syntax + merged.phraseology) / 2;
          const pteMean =
            (merged.content +
              merged.cohesion +
              merged.grammar +
              glr +
              merged.vocabulary +
              merged.conventions) /
            6;
          merged.overall = Math.round(pteMean * 2) / 2;
          return merged;
        })()
      : validated.data.scores;

    return NextResponse.json(
      {
        ...validated.data,
        scores,
        sentences: enrichedSentences,
        ...(kevsun ? { raw_kevsun: kevsun.raw } : {}),
      },
      { status: 200 },
    );
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
