---
description: The test-review skill reports a test that asserts nothing, a duplicated test and a boundary tested on one side only, and leaves the sound tests alone.
tags: [test-review]
runs: 2
max_turns: 20
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
---

Review the tests in test/shipping.test.mjs, then give me the review as it is, without shortening it.
