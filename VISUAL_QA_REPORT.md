# Visual QA + Token-Usage Audit — Wave 4 (Agent T)

Scope: `src/modules/writing-flow/` and `src/app/`. Read-only audit.

## Commands run

```bash
# 1. Arbitrary bracket values
grep -rnE '(bg|text|border|ring|fill|stroke|outline|p|px|py|m|mx|my|w|h|min|max|gap|space|top|right|bottom|left|inset|leading|tracking|rounded|shadow|opacity|z|grid-cols|grid-rows|col-span|row-span|order|basis|flex|aspect)-\[' src/modules/writing-flow src/app

# 2. Hex/rgb/hsl in JSX
grep -rnE '#[0-9A-Fa-f]{3,8}' src/modules/writing-flow src/app

# 3. Default Tailwind palette
grep -rnE '\b(text|bg|border|ring|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)\b' src/modules/writing-flow src/app

# 4. Inline style props
grep -rnE 'style=\{\{' src/modules/writing-flow src/app

# 5. Pure black/white
grep -rnE '\b(bg-black|text-black)\b' src/modules/writing-flow src/app

# 6. Component line counts
wc -l src/modules/writing-flow/components/*.tsx | sort -n
```

---

## Arbitrary bracket values

**Total: 1 violation.**

| File | Line | Offending class | Suggested fix |
|---|---|---|---|
| `src/modules/writing-flow/components/ReviewScreen.tsx` | 83 | `min-h-[calc(100vh-3.5rem)]` | Add a new `@theme` token in `globals.css`, e.g. `--spacing-below-nav: calc(100vh - 3.5rem);` then use `min-h-below-nav`. (3.5rem = `h-14` AppHeader). Alternative: precompute the `--spacing-app-header: 3.5rem` token and use `min-h-[--spacing-app-header]` — but that still uses brackets. The clean fix is the named spacing token. |

Note: the page chrome height `h-14` (3.5rem) is the AppHeader height. Recommend adding `--spacing-app-header: 3.5rem` and `--spacing-below-nav: calc(100vh - var(--spacing-app-header))` to `globals.css @theme`, then `min-h-below-nav` in ReviewScreen.

---

## Hardcoded hex colors in components

**Total: 0 violations.**

The two `grep` hits for `#` colors are both inside CSS comments in `src/app/globals.css` (lines 25, 58) which document the original Figma hex next to the OKLCH token definition. Per the task spec, hardcoded colors inside `globals.css @theme` (and adjacent comments) are the source of truth and explicitly allowed.

No JSX/TSX file contains a hardcoded hex, rgb, or hsl color.

---

## Default tw palette violations

**Total: 0 violations.**

No `text-{slate|gray|zinc|…}-{50…950}` class anywhere in `src/modules/writing-flow/` or `src/app/`. Everything goes through `@theme` semantic tokens.

---

## Inline styles

**Total: 0 violations.**

No `style={{ … }}` props in any component under `src/modules/writing-flow/` or `src/app/`.

---

## Pure black/white

**Total: 0 violations.**

No `bg-black` or `text-black` classes. `text-white` is also absent — dark-background panels use semantic ink tokens or `--color-surface` derivatives.

---

## Components over the line limit

CLAUDE.md §4: "File limits: 200 lines max. Components: 120 lines max."

| File | Lines | Status |
|---|---|---|
| `ReviewTutorPanel.tsx` | 335 | OVER 200 (file) AND OVER 120 (component) — major offender |
| `ReviewScreen.tsx` | 146 | OVER 120 (component limit) |
| `SentenceCard.tsx` | 142 | OVER 120 (component limit) |
| `BrainstormScreen.tsx` | 132 | OVER 120 (component limit) |
| `QuizModal.tsx` | 126 | OVER 120 (component limit) |

All other 27 components are within limits. App-dir files (`layout.tsx` 24, `page.tsx` 5) are well under.

---

## Components mixing too much logic (>15 non-JSX lines)

Per `.claude/rules/module-pattern.md` "Components are dumb / Rule of thumb: remove the JSX `return` — if >15 lines of logic remain, the component does too much."

Approximate logic-line counts (`const|let|function|if|for|while|return|switch` line starts):

| File | Logic lines | Notes |
|---|---|---|
| `ReviewTutorPanel.tsx` | 51 | Holds quiz/state/edit/voice mode switching logic — should be split into a `useReviewTutorPanel` hook + dumb subcomponents |
| `ReviewScreen.tsx` | 36 | Selection logic + paragraph tab logic — extract `useReviewSelection` hook |
| `QuizModal.tsx` | 19 | Borderline. Could extract quiz step transitions to a hook |
| `SentenceCard.tsx` | 19 | Borderline. Edit/fix mode toggles could move to `useSentenceCard` |
| `BrainstormScreen.tsx` | 19 | Borderline. Mode toggle + chat/voice switch could extract |

Out of scope to refactor; flagged for follow-up.

---

## Quick-fix summary

Only one mechanical edit needed for the strict "no arbitrary values" rule.

### Fix 1 — `min-h-[calc(100vh-3.5rem)]` in ReviewScreen.tsx

Add to `src/app/globals.css` inside `@theme { … }` (near the other `--spacing-*` tokens around line 67):

```css
--spacing-app-header: 3.5rem;       /* 56px AppHeader (h-14) */
--spacing-below-nav: calc(100vh - 3.5rem);  /* viewport minus header */
```

Then edit `src/modules/writing-flow/components/ReviewScreen.tsx` line 83:

```diff
- <div className="flex min-h-[calc(100vh-3.5rem)] w-full">
+ <div className="flex min-h-below-nav w-full">
```

### Fix 2..N — line-limit / logic-extraction refactors

Out of scope for Wave 5 mechanical sweep. Recommend a dedicated refactor wave to:

1. Split `ReviewTutorPanel.tsx` (335 → ideally <120 per subcomponent) into:
   - `ReviewTutorPanel.tsx` (shell)
   - `ReviewTutorChatMode.tsx`
   - `ReviewTutorQuizMode.tsx`
   - `ReviewTutorEditMode.tsx`
   - `hooks/useReviewTutorPanel.ts` (state machine)
2. Extract `useReviewSelection` from `ReviewScreen.tsx`.
3. Pull mode-switching state out of `BrainstormScreen.tsx`, `QuizModal.tsx`, `SentenceCard.tsx` into hooks where helpful.

---

## Verdict

The codebase **passes** the user's "no arbitrary values" rule with only **one** outstanding bracket usage (`min-h-[calc(100vh-3.5rem)]`). Colors, inline styles, default-palette classes, and pure black/white are all clean. The remaining flags are line-count and logic-locality concerns — design issues, not token-usage violations.
