import { NextResponse } from 'next/server';
import { z } from 'zod';
import { openai, OPENAI_MODEL } from '@/lib/openai';
import { analysisResultSchema } from '@/modules/writing-flow/schemas/analysis.schema';
import { buildAnalyzerPrompt } from '@/modules/writing-flow/constants/analyzer-prompt';
import { checkPhraseology } from '@/modules/writing-flow/lib/check-phraseology';
import { scoreKevSun } from '@/modules/writing-flow/lib/score-kevsun';
import {
  essayFingerprint,
  wtLog,
  wtRunId,
} from '@/modules/writing-flow/lib/debug-log';

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
  const requestId = wtRunId();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    wtLog(`analyze[${requestId}] ◀ rejected: invalid input`);
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const receivedKevsunAnchor =
    typeof body === 'object' && body !== null && 'kevsun_anchor' in body;
  wtLog(`analyze[${requestId}] ◀ request received`, {
    ...essayFingerprint(parsed.data.text),
    promptLength: parsed.data.prompt.length,
    receivedKevsunAnchor,
    anchorNote: receivedKevsunAnchor
      ? 'kevsun_anchor present in body but the route schema STRIPS it — ignored'
      : undefined,
  });

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

    wtLog(
      `analyze[${requestId}] kevsun result`,
      kevsun
        ? { source: 'kevsun', raw: kevsun.raw, dims: kevsun.dims }
        : {
            source: 'llm-fallback',
            reason:
              'scoreKevSun returned null — no endpoint URL, timeout, non-200, or bad shape',
          },
    );

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

    wtLog(
      `analyze[${requestId}] LLM raw scores (linguistic dims discarded when kevsun present)`,
      validated.data.scores,
    );

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

    // PTE scoring map: LLM provides ONLY content; the five linguistic dims
    // come straight from KevSun's postprocessed values (1:1 mapping, no merge
    // with the LLM's dim guesses). Overall is the mean of the six PTE criteria.
    const scores = kevsun
      ? (() => {
          const pte = {
            ...validated.data.scores,
            cohesion: kevsun.dims.cohesion,
            syntax: kevsun.dims.syntax,
            vocabulary: kevsun.dims.vocabulary,
            phraseology: kevsun.dims.phraseology,
            grammar: kevsun.dims.grammar,
            conventions: kevsun.dims.conventions,
          };
          const glr = (pte.syntax + pte.phraseology) / 2;
          const pteMean =
            (pte.content +
              pte.cohesion +
              pte.grammar +
              glr +
              pte.vocabulary +
              pte.conventions) /
            6;
          pte.overall = Math.round(pteMean * 2) / 2;
          return pte;
        })()
      : validated.data.scores;

    const scoringSource = kevsun ? 'kevsun' : 'llm-fallback';
    const phraseologyTotalFlags = enrichedSentences.reduce(
      (n, s) => n + s.phraseology_flags.length,
      0,
    );

    const debug = {
      requestId,
      scoringSource,
      inputText: essayFingerprint(parsed.data.text),
      receivedKevsunAnchor,
      kevsunRaw: kevsun?.raw ?? null,
      kevsunDims: kevsun?.dims ?? null,
      llmContent: validated.data.scores.content,
      llmRawScores: validated.data.scores,
      computedScores: scores,
      overall1to5: scores.overall,
      phraseologyTotalFlags,
    };

    wtLog(`analyze[${requestId}] ▶ final scores`, {
      scoringSource,
      overall1to5: scores.overall,
      scores,
      phraseologyTotalFlags,
    });

    return NextResponse.json(
      {
        ...validated.data,
        scores,
        sentences: enrichedSentences,
        ...(kevsun ? { raw_kevsun: kevsun.raw } : {}),
        __debug: debug,
      },
      { status: 200 },
    );
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : 'Unknown error';
    wtLog(`analyze[${requestId}] ✕ error`, messageText);
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
