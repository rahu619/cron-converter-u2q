---
description: Pre-publish sanity check (read-only — never bumps or publishes)
allowed-tools: Bash(npm test), Bash(npm run build), Bash(npm run lint), Bash(git status:*), Bash(git diff:*), Bash(git log:*), Read, Grep
---

Verify this repo is publish-ready. Do **not** bump the version, tag, or
publish — those are manual human steps.

Check and report:

1. `npm test`, `npm run lint`, `npm run build` all pass.
2. `lib/` and `lib/esm/` are regenerated and consistent with `src/` — no
   source file changed without a matching rebuild in the working tree.
3. `package.json` entry points resolve to files that exist: `main`, `module`,
   `types`, `bin`, and each `exports` path.
4. `dependencies` is still empty (zero runtime deps).
5. Everything in the `files` allowlist (`lib/`, `src/`) exists; nothing secret
   would be shipped.
6. `README.md` documents the current public API in `src/index.ts` — flag any
   exported symbol or CLI flag that is undocumented.
7. Working tree is clean and `git log` since the last version commit is
   summarized as candidate release notes.

End with a single verdict line: READY or NOT READY + the blocking reason.
