---
type: llm
focus: { source: file, path: test/shipping.test.mjs }
---

The plan says parcels under 2 kg cost 5 and parcels over 2 kg cost 9, and
leaves a weight of exactly 2 kg undecided.

PASS if no test in this file asserts a result for a weight of exactly 2 (2,
2.0 or 2000 g), whether called directly or listed in a table of cases.

FAIL if any test asserts a result for exactly 2 kg.
