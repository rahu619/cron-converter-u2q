# QWEN.md

Project context for [Qwen Code](https://github.com/QwenLM/qwen-code).

The full, tool-agnostic project guide lives in `AGENTS.md` and is imported
here. **Edit `AGENTS.md`, not this file**, for anything that also applies to
other agents.

@AGENTS.md

---

## Qwen Code specifics

### Context loading

- `.qwen/settings.json` sets `contextFileName` to `["QWEN.md", "AGENTS.md"]`,
  so both files load into the session automatically.
- `.qwenignore` keeps `lib/`, `coverage/`, and `package-lock.json` out of file
  discovery and `@`-mentions — they are generated and will otherwise dominate
  the context window. `.gitignore` is respected as well.
- Use `/memory show` to confirm what context is loaded and `/memory refresh`
  after editing `AGENTS.md`.

### Working style

- Read `src/index.ts` before any multi-file change — it is the public API
  contract.
- When referencing code use `@src/<file>.ts`. Do **not** `@`-mention `lib/`
  files; they are compiled duplicates of `src/` and waste context.
- Definition of done: `npm test`, `npm run lint`, and `npm run build` all
  pass. Show the actual failing output, never a paraphrase.
- Ask before running anything that writes outside the repo, publishes, pushes,
  or tags.
