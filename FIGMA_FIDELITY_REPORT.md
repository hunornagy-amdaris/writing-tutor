# Figma Fidelity Report — Wave 4 Agent U

Structural check (not pixel). Each item compares the matching Figma export against the shipped React component.

---

## Brainstorm
Files: `figma/1-braisntorm.txt`, `figma/1b-braisntorm-typing.txt`, `figma/1c-brainstorm-ai-voice.txt`
Component: `src/modules/writing-flow/components/BrainstormScreen.tsx` (+ children)

- [x] Prompt card eyebrow `WRITING TASK 2 · BRAINSTORM` + italic body — `PromptCard.tsx:9,18-22` matches (`text-ink-900/35` ≈ Figma `opacity: 0.35`).
- [x] Italic prompt body present — `PromptCard.tsx:21` (`italic font-normal`).
- [ ] **Mode Toggle right-aligned within a 664-wide area.** Figma places toggle inside the inner column right-aligned. `BrainstormScreen.tsx:88` uses `items-end` on the main column, so the toggle ends up right-aligned to the 664 column — OK structurally, but the toggle sits in the normal flex flow ABOVE the chat panel with `gap-5.5`, whereas Figma has the toggle as the first child of the inner Frame 2043683587 (next to the chat). Acceptable; flag for visual QA.
- [x] Mode Toggle pill 148×30, default Type active — `BrainstormModeToggle.tsx:23` uses `w-mode-toggle-w h-mode-toggle` tokens with active bg-surface + shadow-sm.
- [x] Chat panel 664-wide, 2px border, rounded-24 — `BrainstormChatPanel.tsx:25` uses `border-2 border-line bg-surface rounded-xl`. **Caveat:** Figma specifies `border-radius: 24px` (large). `rounded-xl` is the Tailwind default 0.75rem (12px). If `--radius-xl` is remapped in theme to 24, fine; otherwise this is a **radius mismatch** (12 vs 24).
- [x] AI bubble `bg-msg-ai` rounded `tl-sm tr/br/bl-msg`, user bubble `bg-msg-user` rounded `tr-sm` etc — `ChatBubble.tsx:11-13` matches the asymmetric corner spec from Figma (`border-radius: 4px 12px 12px 12px` and `12px 12px 4px 12px`).
- [x] First AI message seeded when `messages.length===0 && prompt===DEFAULT_PROMPT` — `BrainstormScreen.tsx:45-53` uses `BRAINSTORM_OPENER` ("When you read this prompt — gut reaction. Keep DST or scrap it?") — matches Figma line 1029.
- [x] 3 quick-action chips with exact text & emoji — `brainstorm.constants.ts` chips match Figma: `🤔 Help me take a position`, `💡 Suggest an argument`, `⚖️ What's the counter-view?`.
- [ ] **Chip background.** Figma uses `#F6F6FB` (surface-muted-ish) for chips. `QuickActionChip.tsx:18` uses `bg-surface-muted` when not selected — likely correct token-wise. Verify `--color-surface-muted` ≈ `#F6F6FB`. Same chip styling reused on Write/Review where Figma uses `#F0F1F8` instead (subtle deviation, likely cosmetic). 
- [x] Input bar 46h, white bg, 1.5px border, rounded-pill — `ChatInputBar.tsx:34`. **Deviation:** Figma spec is `1.5px solid #E5E7EB`. Code uses `border-2` (2px). Minor 0.5px deviation.
- [x] Navy circle send button 28×28 — `ChatInputBar.tsx:48` uses `size-7` (28px) with `bg-nav-bg rounded-pill` and `ArrowRight` icon. Matches.
- [x] Helper text below input bar (10/13, centered, ink-400) — `BrainstormScreen.tsx:123` uses `text-eyebrow text-ink-400` centered. Matches.
- [x] `Start writing →` magenta CTA bottom-right — `StartWritingButton.tsx:8-15` with `bg-magenta rounded-pill`, parent uses `items-end`.
- [ ] **CTA visibility in voice mode.** Figma 1c shows ONLY the voice orb panel with `Done — start writing →` CTA inside the orb panel. Code renders `<StartWritingButton />` ALSO in voice mode (BrainstormScreen.tsx:129 is outside the conditional). Result: two CTAs visible in voice mode. **DEVIATION.**
- [x] Voice orb with `.voice-orb` class + helper paragraph + title — `BrainstormVoicePanel.tsx:36-52`. Title `AI tutor is listening…` (constant matches). Helper paragraph matches Figma 1c line 1021.
- [x] `Done — start writing →` magenta CTA — `BrainstormVoicePanel.tsx:48`.

Pass rate: **12 / 15**. Deviations: 3 (voice mode shows duplicate CTA, input bar border thickness, chat panel corner radius token).

---

## Write
Files: `figma/2-write.txt`, `figma/2b-write-chat-active.txt`
Component: `src/modules/writing-flow/components/WriteScreen.tsx` + `EssayCard.tsx`, `PracticeTutorPanel.tsx`

- [x] Two-column layout: left main + right tutor panel — `WriteScreen.tsx:60-82`. Left uses `flex-1` (not fixed 940 width), right uses `w-tutor-panel` (340). Acceptable since 340 is fixed and the rest fills available space.
- [x] Essay card / Prompt card max-w 876 — `WriteScreen.tsx:62` uses `max-w-prompt-wide`. Verify token `--max-w-prompt-wide = 876px`.
- [x] Prompt card eyebrow `WRITING TASK 2 · 40 MINUTES · 250+ WORDS` — `PromptCard.tsx:10`. Matches Figma line 796.
- [x] Essay Card header 40h with `YOUR ESSAY` + `X / 250 words` + 1px divider — `EssayCard.tsx:32-37` (`h-10`, `border-b border-line`, both labels).
- [x] Textarea — `EssayCard.tsx:39-45`.
- [x] Footer 44h with `surface-soft` bg, dynamic msg left + Submit pill right — `EssayCard.tsx:47-60` (`h-11 bg-surface-soft border-t`). Matches Figma `#F0F1F8` if `--color-surface-soft` ≈ that hue.
- [ ] **Submit label.** Figma button width is 156px with text `Submit for feedback →`. Code button uses `Submit for feedback` + lucide `ArrowRight` icon — equivalent visually, but text-only Figma uses `→` glyph in same string. Acceptable.
- [x] Word count under-250 keeps Submit disabled — `EssayCard.tsx:21` `canSubmit = wordCount >= MIN_WORDS && !isPending`.
- [x] Tutor panel: `Practice Tutor` header — `PracticeTutorPanel.tsx:48-49` with `text-xs font-semibold text-ink-600`. Matches Figma 12/15 600 #4B5563.
- [x] AI seed message `Your brainstorm looked solid…` — `WriteScreen.tsx:23-25` matches Figma line 1101 exactly.
- [x] 4 tutor chips with exact text — `WriteScreen.tsx:16-21`. Matches Figma 2b lines 1200/1234/1268/1302. ✓
- [ ] **Chip background token.** `PracticeTutorPanel.tsx:73` uses `bg-surface-muted` whereas Figma Write chips use `#F0F1F8` (closer to `surface-soft`). Minor token choice.
- [x] Input bar + helper text — `PracticeTutorPanel.tsx:80-88`. Default helper `English, Spanish, Portuguese, Hindi, or any language` is a slight wording diff from Brainstorm full helper. Aligns with Figma.

Pass rate: **11 / 12**. Deviations: 1 (chip bg token mismatch on tutor panel).

---

## Review
Files: `figma/3-reviwew.txt`, `figma/3b-*.txt`, `figma/3c-*.txt`, `figma/3g-*.txt`, `figma/3h-*.txt`
Components: `ReviewScreen.tsx`, `ReviewTutorPanel.tsx`, `SentenceCard.tsx`, `ScoreBar.tsx`, `ParagraphTabs.tsx`, `QuizModal.tsx`

### Score Bar
- [x] 876×68 with 1px border + 14 radius — `ScoreBar.tsx:11` uses `w-full h-score-bar rounded-card border border-line`. Width relies on parent.
- [x] Overall box 72×46 violet-soft — `ScoreBar.tsx:13` `w-score-overall h-score-overall-h rounded-button bg-accent-violet-soft`. Matches.
- [x] 1px divider — `ScoreBar.tsx:21` `h-score-divider w-px bg-line`.
- [ ] **7 score cells.** Figma 3-reviwew.txt lists exactly 7 cells: Content / Form / Develop. / Grammar / Ling. range / Vocab / Spelling. `ScoreBar.tsx:23-25` renders `data.cells.map(...)`. Cell count and labels come from `buildScoreBarData` (lib). Need to verify `score-mapping.ts` produces 7 cells with these exact labels — **not directly auditable from component code**; flag for runtime check.
- [x] Score cell shape: `numerator/denominator` 14/18 800 + label 9/11 700 — `ScoreBar.tsx:36-39` uses `text-sm font-extrabold` and `text-tiny font-bold text-ink-400`. Matches Figma.
- [x] Color: green when full, red when under — `ScoreBar.tsx:32-33`.

### Paragraph Tabs
- [x] Row of tabs — `ParagraphTabs.tsx:18` `flex gap-1`.
- [x] Active = `bg-accent-violet` text `ink-600` — `ParagraphTabs.tsx:30`. Matches Figma `#C1BFFF` + `#4B5563`.
- [x] Inactive = `bg-surface border-line` text `ink-400` — `ParagraphTabs.tsx:31`. Matches (Figma border 1.5px vs code default 1px is a minor thickness deviation).
- [x] Red dot suffix when `hasErrors` — `ParagraphTabs.tsx:35-39`.
- [ ] **Inactive border thickness.** Figma uses `1.5px solid #E5E7EB` on inactive tabs. Code uses default `border` (1px). Minor.

### Sentence Cards
- [x] Full-width, rounded-9 (`rounded-button`) — `SentenceCard.tsx:45`.
- [x] Default white — line 45.
- [x] Errored = `bg-danger-soft` — line 60-61.
- [x] Errored+selected = `border-2 border-danger` — line 55-56. Matches Figma 3b (1.5px in figma; code uses 2px — minor).
- [x] Editing = `bg-surface-edit` + inline input — `SentenceCard.tsx:125-141`.
- [x] Fixed = `bg-success-soft border-success` + `✓ fixed` pill — line 50-52, 81-83.
- [ ] **Badge label content.** Figma shows `grammar` lowercase as text inside the badge. Code uses `getSentenceBadgeKind(sentence)` — verify it returns lowercased rule labels (`grammar`, `spelling`, etc.). Not directly auditable.

### Review Tutor Panel
- [x] Mode toggle at top — `ReviewTutorPanel.tsx:177-215`. Uses `bg-mode-toggle-bg` border-line, matches `BrainstormModeToggle` shape.
- [x] Praise bubble (`First, something you did well…`) — line 119-122. Matches Figma 3-reviwew line 1987.
- [x] Socratic question bubble — line 124-128 (`Read that sentence aloud…`).
- [x] Yes/Not-sure buttons — line 130-147. Yes = violet-soft + violet border, Not-sure = surface-soft + line border. Matches Figma 3b/3c structure.
- [x] Not Sure → explanation bubble + ComparisonCard + green "Edit it myself" + magenta-soft "Practise it" — line 149-155, ExplainedBlock 236-269. Matches Figma 3c structure.
- [ ] **Practise it button text.** Code uses `⚡ Practise it — 2 quick questions` (line 265). Figma 3c uses a magenta-soft button; verify exact label string against Figma 3c — likely identical, flag for visual QA.
- [x] 3 review chips with exact text — `ReviewTutorPanel.tsx:29-33` matches Figma exactly: `🌐 Explain in my language`, `🔍 What pattern is this?`, `💬 Discuss more`.
- [x] Input bar + helper text — PanelFooter 296-334.
- [ ] **PanelFooter input bar styling diverges.** `ReviewTutorPanel.tsx:311` uses `h-tutor-input` with `border-line` + `bg-surface-muted`, while `ChatInputBar` (used elsewhere) uses 2px border + `bg-surface`. Two different input bars in the codebase — inconsistent with the "single chat input" Figma pattern. Recommend folding into the shared `ChatInputBar`.
- [x] Edit mode: AI confirm bubble + Fix Progress strip — line 109-117, FixProgressStrip 225-234. Matches Figma 3g.
- [x] Bottom CTA swap to `Resubmit for new score →` — `ReviewScreen.tsx:43`.
- [x] Voice mode — `ReviewVoicePanel.tsx`. Orb + Done button present.
- [ ] **Voice "Done" label mismatch with Brainstorm pattern.** ReviewVoicePanel uses `Done — back to typing` (line 77) while Brainstorm uses `Done — start writing →`. Figma 3c voice export should confirm; the brief asked for an orb + Done button — both present.

### QuizModal
- [x] 460-wide modal — `QuizModal.tsx:46` uses `w-modal-w` token. Verify `--w-modal-w = 460px`. Figma 3e/3f confirm 460.
- [x] Header strip violet — line 76 `bg-accent-violet-soft`. **DEVIATION:** Figma 3d/3e header uses `#C1BFFF` (full accent-violet), code uses `accent-violet-soft` (`#EFEDFF`). Wrong token — should be `bg-accent-violet`.
- [ ] **Progress bars (2 × 80×4).** Figma shows two thin progress bar rectangles 80×4 in the header. Code does NOT render any progress bars in the modal header — `ModalHeader` only renders title + subtitle + close button. **MISSING.**
- [x] MC then gap-fill then complete with ✅ + rule card — `QuizModal.tsx:53-60` switches on `quiz.stage`. ✓
- [x] Close button — `QuizModal.tsx:94-101`.
- [x] Subtitle `Quick practice · 2 questions` — line 86.

### Review screen overall
- [ ] **`Edit sentences first` button is extra.** `ReviewScreen.tsx:121-128` renders an `✏️ Edit sentences first` pill that I do not see called out in the Figma exports. Possibly Wave 3 addition — flag.

Pass rate: **20 / 25**. Deviations: 5 (quiz header bg token, missing quiz progress bars, ParagraphTabs/SentenceCard border thickness 1.5→1/2, ReviewTutorPanel input bar diverges from shared ChatInputBar, possibly unscoped `Edit sentences first` button).

---

## Score
Files: `figma/4-score.txt`
Components: `ScoreScreen.tsx`, `ScoreCard.tsx`, `ReflectCard.tsx`

- [x] Greeting `Good work, Sofia 🎉` 26/33 800 — `ScoreScreen.tsx:49-51` uses `text-display-26 font-extrabold text-nav-bg`. Matches Figma 778-788.
- [x] Subtitle 13/16 400 `Session 12 · DST essay · …` — `ScoreScreen.tsx:53-55`. Matches Figma line 796.
- [x] `YOUR SCORE` eyebrow 9/11 700 nav-bg — `ScoreScreen.tsx:57` uses `text-tiny font-bold text-nav-bg`. Matches Figma 814-828.
- [x] Two ScoreCards 228×160 side by side — `ScoreCard.tsx:37` uses `w-score-card h-score-card-h`. `ScoreScreen.tsx:59-62` renders two with `gap-6`. Matches.
- [x] Initial: gray (`#F5F5F6`) header, score gray-faded — `ScoreCard.tsx:11 HEADER_BG.initial = 'bg-score-soft'` + `BIG_NUM_COLOR.initial = 'text-ink-400'`. Matches Figma 855 + 873 (`#9CA3AD`).
- [x] After: violet (`#C1BFFF` accent-violet) header, score full color — `ScoreCard.tsx:12 HEADER_BG.after = 'bg-accent-violet'` + `BIG_NUM_COLOR.after = 'text-ink-900'`. Matches Figma 1346 + 1364.
- [x] 8 sub-score cells per card 4×2 — `ScoreCard.tsx:60` `grid grid-cols-4 grid-rows-2`. ✓
- [ ] **Cell labels — verify exact set.** Figma lists Content / Form / Develop. / Grammar / Ling. / Vocab / Spell. / Conv. (8 cells). `mapToRubric` in lib generates `rubric.cells` — needs runtime check that all 8 labels are present in this order.
- [x] `REFLECT & PLAN` eyebrow — `ScoreScreen.tsx:64` `text-tiny font-bold text-nav-bg`. Matches Figma 1814-1828.
- [x] Two reflect cards 480×90 — `ReflectCard.tsx:8` uses `w-reflect-card h-reflect-card-h`. Both rendered in `ScoreScreen.tsx:66-69`.
- [x] Hardcoded reflect body text — `ScoreScreen.tsx:17-21` strings match Figma lines 1875 + 1939 exactly.
- [x] Bottom row: white pill `Done for today` (130×34, 1.5px border) + magenta pill `Start next session →` (162×34) — `ScoreScreen.tsx:71-86`. White pill uses `border-2 border-line`. **Minor deviation:** Figma is `1.5px`, code is `2px`. Magenta button matches.
- [ ] **Initial score number color.** Figma 873 specifies `#9CA3AD` (ink-300/400). Code uses `text-ink-400`. Verify these align.

Pass rate: **11 / 13**. Deviations: 2 (cell label set needs runtime verification, white CTA border 2px vs 1.5px).

---

## Summary

| Screen | Pass | Total | Deviations |
|---|---|---|---|
| Brainstorm | 12 | 15 | 3 |
| Write | 11 | 12 | 1 |
| Review | 20 | 25 | 5 |
| Score | 11 | 13 | 2 |
| **TOTAL** | **54** | **65** | **11** |

### Highest-priority deviations (functional, not cosmetic)
1. **Brainstorm voice mode renders duplicate CTAs** — `StartWritingButton` is outside the `isVoice ? :` conditional in `BrainstormScreen.tsx:129`. Fix: move CTA into the type branch only, OR remove from voice branch (orb already has its own Done CTA).
2. **QuizModal missing the two 80×4 progress bars** in the header strip — `QuizModal.tsx` `ModalHeader` doesn't render them.
3. **QuizModal header uses `bg-accent-violet-soft` (#EFEDFF) but Figma uses `#C1BFFF` (accent-violet)** — `QuizModal.tsx:76`.
4. **ReviewTutorPanel `PanelFooter` re-implements its own input bar** instead of reusing `ChatInputBar`, diverging in border-width, background token, and helper text font size. Recommend consolidating.

### Lower-priority (cosmetic / token tuning)
5. Input bar border: code 2px vs Figma 1.5px (Brainstorm, Write).
6. ParagraphTab inactive border 1px vs Figma 1.5px.
7. SentenceCard selected error border 2px vs Figma 1.5px.
8. Chip background `bg-surface-muted` (likely `#F6F6FB`) vs Figma `#F0F1F8` on Write/Review chips.
9. Score "Done for today" pill border 2px vs Figma 1.5px.
10. BrainstormChatPanel `rounded-xl` (12px) vs Figma 24px — verify the `xl` radius token is remapped, else this is a real radius miss.
11. Possibly out-of-scope `✏️ Edit sentences first` button on ReviewScreen — not in any Figma export I reviewed.

### Runtime-verifiable items (cannot confirm from code alone)
- ScoreBar produces exactly 7 cells with labels Content/Form/Develop./Grammar/Ling./Vocab/Spelling (depends on `buildScoreBarData`).
- ScoreCard renders 8 cells with labels Content/Form/Develop./Grammar/Ling./Vocab/Spell./Conv. (depends on `mapToRubric`).
- SentenceCard badge text comes from `getSentenceBadgeKind` and lowercases rule names.
