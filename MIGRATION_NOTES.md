# Migration Notes — Wave 3 -> Wave 4 cleanup

## Context

Wave 3 (Agent P) migrated the canonical analysis types, schemas, and analyzer prompt from `src/modules/essay-tutor/` into `src/modules/writing-flow/`. The old files were left in place as stub re-exports so that other Wave-3 agents (still in flight) keep building.

Wave 4 is the deletion pass. Run it ONLY after every Wave-3 PR is merged and all imports of `@/modules/essay-tutor/*` and `@/modules/layout/*` have been removed from the codebase.

## Stub re-exports introduced in Wave 3

These files now contain a single `export * from '@/modules/writing-flow/...'` line and must be deleted in Wave 4:

- `src/modules/essay-tutor/types/analysis.types.ts`
- `src/modules/essay-tutor/schemas/analysis.schema.ts`
- `src/modules/essay-tutor/constants/analyzer-prompt.ts`

## Files / folders to delete in Wave 4

After confirming via `grep -r "@/modules/essay-tutor" src/` and `grep -r "@/modules/layout" src/` return zero hits, delete:

- `src/modules/essay-tutor/components/` (entire folder)
- `src/modules/essay-tutor/hooks/` (entire folder)
- `src/modules/essay-tutor/stores/` (entire folder)
- `src/modules/essay-tutor/lib/` (entire folder)
- `src/modules/essay-tutor/types/` (stub re-export, now redundant)
- `src/modules/essay-tutor/schemas/` (stub re-export, now redundant)
- `src/modules/essay-tutor/constants/` (stub re-export + `samples.ts` — verify `samples.ts` is no longer needed before deleting; if it is, move it into `writing-flow/constants/` first)
- `src/modules/essay-tutor/index.ts`
- `src/modules/essay-tutor/` (the now-empty parent folder)
- `src/modules/layout/` (entire folder — `AppHeader` and `AppLogo` are no longer imported anywhere after Wave 1A removed them from `layout.tsx`)

## Wave 4 verification checklist

1. `grep -r "@/modules/essay-tutor" src/` — must return zero matches.
2. `grep -r "@/modules/layout" src/` — must return zero matches.
3. `pnpm tsc --noEmit` clean.
4. `pnpm lint` clean.
5. Delete folders listed above.
6. Re-run `pnpm tsc --noEmit && pnpm lint` to confirm green.
