# AGENTS.md

Canonical instructions for AI coding agents working in this repository.
`CLAUDE.md` (Claude Code) and `QWEN.md` (Qwen Code) both import this file, so
edit **this** file when project rules change — never duplicate rules in the
tool-specific files.

---

## 1. Project

`cron-converter-u2q` — a zero-dependency TypeScript library (and CLI) that
converts cron expressions between **Unix** (5–6 field) and **Quartz** (6–7
field) formats, validates them, describes them in human-readable text, and
computes upcoming run times.

- Published to npm as `cron-converter-u2q`.
- Ships **both** CommonJS (`lib/`) and ESM (`lib/esm/`) builds plus `.d.ts`.
- Binary entry: `cron-converter-u2q` → `lib/cli.js`.
- Node `>=18`. TypeScript `strict: true`, target `es2016`.

## 2. Layout

```
src/
  index.ts          # public barrel — the ONLY public API surface
  converter.ts      # CronConverterU2Q: unix <-> quartz
  validator.ts      # CronValidatorU2Q: isValidUnix / isValidQuartz
  describer.ts      # CronDescriberU2Q: expression -> English sentence
  next-runs.ts      # getNextRuns / getPreviousRuns
  locale-loader.ts  # runtime locale loading
  helper.ts         # shared internal utilities (not exported)
  cli.ts            # #!/usr/bin/env node entry point
  locales/
    types.ts        # CronLocale interface — the locale contract
    en.ts           # reference locale implementation
    index.ts        # en, getLocale, registerLocale
  __tests__/
    index.test.ts
    specs-compliance.test.ts
    fixtures/de.json
lib/                # BUILD OUTPUT — committed, but never hand-edit
types/index.d.ts
.github/workflows/  # integration.yml (CI), release.yml (npm publish on v* tag)
```

## 3. Commands

| Task | Command |
|---|---|
| Test + coverage | `npm test` |
| Single test file | `npx jest src/__tests__/index.test.ts` |
| Filter by name | `npx jest -t "quartz"` |
| Lint (auto-fix) | `npm run lint` |
| Build (CJS + ESM) | `npm run build` |
| Try the CLI | `node lib/cli.js "0 9 * * 1-5"` |

CI (`.github/workflows/integration.yml`) runs `npm ci`, `npm test`,
`npm run lint`, `npm run build` on Node 20/22/24. A change is only "done" when
all four pass locally.

## 4. Hard rules

1. **Never edit `lib/` or `types/` by hand.** They are `tsc` output. Change
   `src/` and run `npm run build`. `lib/` is tracked in git, so regenerate it
   in the same change that touches `src/`.
2. **No runtime dependencies.** `dependencies` is intentionally empty — keep it
   that way. New devDependencies need a stated reason.
3. **Anything new that is public must be re-exported from `src/index.ts`.**
   If it is not in the barrel, it does not exist to consumers.
4. **`strict` TypeScript.** No `any`, no `@ts-ignore`, no non-null `!` to shut
   the compiler up. Model the type properly.
5. **Do not bump `version` in `package.json`** and do not create git tags.
   Releases are manual: a `v*` tag triggers `release.yml` → `npm publish`.
6. **Do not touch `.github/workflows/`, `LICENSE`, or npm publish config**
   unless that is the explicit request.
7. `coverage/` is generated. Never edit, never commit changes to it.

## 5. Code conventions

- 2-space indent, single quotes, semicolons — match the surrounding file.
- Classes with static methods for the public surface (`CronConverterU2Q`,
  `CronValidatorU2Q`, `CronDescriberU2Q`); plain functions for the rest
  (`getNextRuns`, `getLocale`).
- Exported symbols get TSDoc (`/** ... */`) with a `@param`/`@returns` where
  non-obvious. `src/locales/types.ts` is the style reference.
- Throw `Error` with a message naming the offending field and value, e.g.
  ``throw new Error(`Invalid day-of-week value: ${value}`)``. Validators return
  `boolean`; converters/describers throw.
- Field-count truth table — keep it straight:
  - Unix: `minute hour dom month dow` (5), optional trailing `year` (6).
  - Quartz: `second minute hour dom month dow` (6), optional `year` (7).
  - Quartz `dow` is **1-based** (1=SUN); Unix `dow` is **0-based** (0=SUN).
  - Quartz requires exactly one of `dom`/`dow` to be `?`.
- Quartz-only tokens: `L`, `W`, `LW`, `L-<n>`, `#`, `?`. Do not emit them into
  Unix output.

## 6. Locales

Adding a locale means implementing the **entire** `CronLocale` interface in
`src/locales/types.ts` — every token, `ordinal()`, `dayNames`, `monthNames`.
Copy `src/locales/en.ts` as the skeleton, register it in
`src/locales/index.ts`, and add describer assertions for it. Never widen the
`CronLocale` contract to make one locale easier; a new token means updating
`en.ts` and every other locale in the same change.

## 7. Testing

- Jest + ts-jest, `roots: ['./src/']`. Tests live in `src/__tests__/`.
- Every bug fix gets a regression test that fails before the fix.
- Cover both formats and the boundaries: `0`/`59`, `0`/`23`, `L`, `LW`, `#`,
  `?`, step values `*/n`, ranges, lists, DST transitions in `next-runs.ts`.
- `specs-compliance.test.ts` is the spec-conformance suite — add cases there
  when behaviour is dictated by the Unix/Quartz spec rather than by us.

## 8. Git

- Conventional Commits, matching history: `feat:`, `fix:`, `docs:`, `chore:`,
  optional scope (`feat(locales): ...`).
- Branch off `main`; do not commit or push unless asked.
- Update `README.md` when the public API or CLI flags change.
