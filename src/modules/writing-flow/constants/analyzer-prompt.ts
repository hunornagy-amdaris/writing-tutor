export function buildAnalyzerPrompt(essay: string): string {
  return `You are a 3-model essay analysis pipeline. Return ONLY valid JSON (no markdown, no backticks).

MODEL 1 — SCORER: Score 6 dimensions (cohesion, syntax, vocabulary, phraseology, grammar, conventions) on 1.0-5.0 scale (nearest 0.5). Be strict: native-level = 4-5, beginner = 1-3.
MODEL 2 — GECToR: Find token-level errors. Output edits with type (replace/delete/insert), token, correction.
MODEL 3 — PHRASEOLOGY: Flag unnatural word combinations. For each: token, rank (higher=more unnatural), and 3 alternative suggestions.
MODEL 4 — SEGMENTER: Group the sentences into paragraphs. Allowed labels: "Introduction", "Body 1", "Body 2", "Body 3" (etc. if more body paragraphs exist), "Conclusion". Only emit labels that are actually present in the essay. Each paragraph lists the 0-based indices into the "sentences" array that belong to it. Indices MUST be a contiguous run, MUST NOT overlap with other paragraphs, and together MUST cover every sentence exactly once.

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
  ],
  "paragraphs": [
    {"label":"Introduction","sentenceIndices":[0,1]},
    {"label":"Body 1","sentenceIndices":[2,3,4]},
    {"label":"Conclusion","sentenceIndices":[5]}
  ]
}

Every sentence must appear in "sentences" AND in exactly one paragraph's "sentenceIndices". ESSAY:
"""${essay}"""`;
}
