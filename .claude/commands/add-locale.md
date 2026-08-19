---
description: Scaffold a new CronLocale implementation
argument-hint: <locale-code> e.g. de, es, fr-CA
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(npm test), Bash(npm run lint)
---

Add a locale for `$1`.

1. Read `src/locales/types.ts` in full — the `CronLocale` interface is the
   contract and every member is required.
2. Read `src/locales/en.ts` as the reference implementation.
3. Create `src/locales/$1.ts` implementing **every** field: `id`, `dayNames`
   (7, Sunday-first), `monthNames` (12, January-first), `ordinal(n)`,
   `use24HourTimeFormat`, optional `timezone`, and the complete `tokens`
   object. No `TODO`, no placeholder English strings left behind.
4. Register it in `src/locales/index.ts` alongside `en`.
5. Add describer tests in `src/__tests__/` covering at minimum: a plain time,
   a weekday range, a day-of-month ordinal, and a `*/n` step — asserted
   against the new locale.
6. Run `npm test` and `npm run lint`.

If a phrase does not translate cleanly into the token model, say so rather
than inventing a token — widening `CronLocale` requires updating `en.ts` and
every existing locale in the same change.
