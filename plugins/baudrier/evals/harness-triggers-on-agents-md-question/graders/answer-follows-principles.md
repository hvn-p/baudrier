---
type: llm
---

The user asked what this project's AGENTS.md should contain.

PASS if the answer recommends that the file hold only directives an agent
could not learn from the code, the configuration or the package scripts (such
as how to run a single test, where data lives, which environments exist), AND
that it leave out history, dated entries or session logs.

FAIL if the answer proposes sections that restate what the code shows (a
directory tree, a list of the package scripts, a description of each module),
or a history or changelog section, or if it does not address what to leave
out.
