export function buildAnalyzerPrompt(essay: string): string {
  return `You are a 3-model essay analysis pipeline. Return ONLY valid JSON (no markdown, no backticks).

MODEL 1 — SCORER: Score 6 dimensions (cohesion, syntax, vocabulary, phraseology, grammar, conventions) on 1.0-5.0 scale (nearest 0.5). Be strict: native-level = 4-5, beginner = 1-3.
MODEL 2 — GECToR: Find token-level errors. Output edits with type (replace/delete/insert), token, correction.
MODEL 3 — PHRASEOLOGY: Flag unnatural word combinations. For each: token, rank (higher=more unnatural), and 3 alternative suggestions.

Catch: article errors, tense issues, collocations, missing commas, word order, unnatural phrasing.

{
  "scores": {"cohesion":N,"syntax":N,"vocabulary":N,"phraseology":N,"grammar":N,"conventions":N,"overall":N},
  "sentences": [
    {
      "original": "...",
      "corrected": "...",
      "has_errors": true/false,
      "grammar_edits": [{"type":"replace|delete|insert","token":"...","correction":"..."}],
      "phraseology_flags": [{"token":"...","rank":N,"suggestions":["...","...","..."]}],
      "phraseology_score": N
    }
  ]
}

Every sentence must appear. ESSAY:
"""${essay}"""`;
}
