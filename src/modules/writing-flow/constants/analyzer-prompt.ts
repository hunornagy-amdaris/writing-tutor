export function buildAnalyzerPrompt(essay: string, essayPrompt: string): string {
  return `You are a 3-component PTE Academic Write Essay scorer. Return ONLY valid JSON (no markdown, no backticks).

COMPONENT 1 — HOLISTIC SCORER (essay-level). Score each dimension on a 1.0–5.0 scale, rounded to the nearest 0.5. Be absolute, not relative: a near-native essay earns 4.5–5.0, a clearly L2 essay with frequent errors earns 1.0–2.0.

Output six KevSun-style raw dimensions reflecting the full essay:
- cohesion: paragraph structure, transitions, logical flow
- syntax: sentence-structure variety and accuracy
- vocabulary: range, precision, topic-appropriateness
- phraseology: naturalness of word combinations and collocations
- grammar: tense, agreement, articles, prepositions, word form
- conventions: spelling, capitalization, punctuation

Then output Content separately by comparing the essay against the writing prompt:
- 5.0: comprehensively addresses every aspect of the prompt with well-developed, relevant ideas
- 4.0–4.5: addresses the prompt well; most ideas relevant and developed
- 3.0–3.5: addresses adequately but misses one aspect or includes some irrelevant content
- 2.0–2.5: partially addresses; significant gaps or one-sided when "both views" is requested
- 1.0–1.5: barely addresses the prompt; mostly irrelevant
- 0–0.5: does not address the prompt at all

Then compute "overall" as the mean of the six PTE criteria below, rounded to the nearest 0.5:
- Content                              = content
- Development, Structure & Coherence   = cohesion
- Grammar                              = grammar
- General Linguistic Range             = (syntax + phraseology) / 2
- Vocabulary Range                     = vocabulary
- Spelling                             = conventions

COMPONENT 2 — GRAMMAR CHECKER (per sentence). For every sentence, list token-level edits as {type: "replace"|"delete"|"insert", token, correction}. Catch: subject-verb agreement ("it make"→"it makes"), redundant subject pronouns ("people they"→"people"), wrong word ("do a decision"→"make a decision"), wrong form ("for save"→"for saving"), wrong adverb ("sleep good"→"sleep well"), missing/incorrect articles, plural/singular ("many problem"→"many problems"), and "am/is/are + bare verb" ("I am not agree"→"I do not agree"). Every sentence MUST appear in "sentences", including correct ones (with has_errors=false and empty grammar_edits).

(Phraseology is computed downstream by a real FacebookAI/roberta-base masked-LM run; you do NOT emit phraseology flags or scores. Each sentence object MUST include "phraseology_flags": [] and omit "phraseology_score" — the orchestrator fills them in.)

COMPONENT 3 — PARAGRAPH SEGMENTER. Group the sentences into paragraphs. Allowed labels: "Introduction", "Body 1", "Body 2", "Body 3" (etc.), "Conclusion". Only emit labels actually present. Indices into "sentences" MUST be contiguous, non-overlapping, and cover every sentence exactly once.

OUTPUT FORMAT (strict):
{
  "scores": {
    "cohesion": N, "syntax": N, "vocabulary": N, "phraseology": N, "grammar": N, "conventions": N,
    "content": N,
    "overall": N
  },
  "sentences": [
    {
      "original": "...",
      "corrected": "...",
      "has_errors": true,
      "grammar_edits": [{"type":"replace|delete|insert","token":"...","correction":"..."}],
      "phraseology_flags": []
    }
  ],
  "paragraphs": [
    {"label":"Introduction","sentenceIndices":[0,1]},
    {"label":"Body 1","sentenceIndices":[2,3,4]},
    {"label":"Conclusion","sentenceIndices":[5]}
  ]
}

WRITING PROMPT:
"""${essayPrompt}"""

ESSAY:
"""${essay}"""`;
}
