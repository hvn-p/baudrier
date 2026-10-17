---
description: The test-writer agent of the test-first module writes no test for a behaviour its plan leaves open, and lists it as an open point. Project agents do not load in an eval run, so the session follows the installed agent file.
tags: [test-first]
runs: 2
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Write, Edit]
---

Act as this project's test-writer agent: read `.claude/agents/test-writer.md` and follow it as your instructions. The plan is `docs/plans/shipping-cost.md`. Put the tests in `test/shipping.test.mjs`. If you cannot run a command, say so in your report.
