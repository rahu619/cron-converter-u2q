# CLAUDE.md

Project instructions for [Claude Code](https://claude.com/claude-code).

The full, tool-agnostic project guide lives in `AGENTS.md` and is imported
here. **Edit `AGENTS.md`, not this file**, for anything that also applies to
other agents.

@AGENTS.md

---

## Claude Code specifics

### Workflow

- Before a task that touches more than one file, read `src/index.ts` first —
  it is the public API contract and tells you what is allowed to change shape.
- Prefer `Grep`/`Glob` over `find`/`cat`. Search `src/` only; `lib/`,
  `coverage/`, and `node_modules/` are noise and are excluded via
  `.claude/settings.json`.
- Definition of done: `npm test && npm run lint && npm run build` all green.
  Report failures with the failing assertion, not a summary.

### Slash commands

Defined in `.claude/commands/`:

- `/verify` — run the full test + lint + build gate.
- `/add-locale <code>` — scaffold a new `CronLocale` implementation.
- `/release-check` — pre-publish sanity check (no version bump).

### Permissions

`.claude/settings.json` pre-approves read-only inspection plus `npm test`,
`npm run lint`, and `npm run build`. `npm publish`, `git push`, `git tag`, and
`npm version` are explicitly denied — releases are a human action.

Personal overrides go in `.claude/settings.local.json`, which is gitignored.
