---
description: Run the full CI gate locally (test + lint + build)
allowed-tools: Bash(npm test), Bash(npm run lint), Bash(npm run build), Read, Grep
---

Run the same checks CI runs, in order, and stop at the first failure:

1. `npm test`
2. `npm run lint`
3. `npm run build`

Report each step as pass/fail. On failure, quote the shortest decisive line of
output (failing assertion, lint rule + location, or TS error code + file:line)
and name the file to fix. Do not fix anything unless asked.
