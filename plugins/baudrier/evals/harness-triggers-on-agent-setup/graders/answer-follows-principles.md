---
type: llm
---

The user asked how to set up coding agents on this repository, a small Node
API with tests, a route guard script (`scripts/check-routes.mjs`) and specs in
`docs/specs/`.

PASS if the answer recommends at least two of these: tests written first from
a plan, by a different agent than the one writing the code; specs or plans
that state concrete cases and refusals rather than intent; a CI whose failures
block merging; a test proving the route guard actually fails on an unprotected
route.

FAIL if the answer is limited to agent configuration (an instruction file
describing the project, one agent per language or per folder, tool
permissions) without any of the above.
