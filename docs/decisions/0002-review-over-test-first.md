# 0002. Review instead of the test-first workflow

## Context

The `test-first` module ran every change through four agents: tests written
from the plan, reviewed, then protected by a guard while another agent wrote
the code, and an audit with mutation testing at the end. It caught what it was
meant to catch, but it was too long and too costly in tokens for everyday
work, and mutation testing is too heavy for a local machine.

## Decision

- The `test-first` module is removed, with its guard and its mutation CI job.
- A harness needs review instead: an AI reviews the code at the end of
  development, automatically and from a fresh context, and the review covers
  the tests, not only the code. These are principles of the `harness` skill,
  not a module: each project sets up its code review with its own tools.
- The plugin ships a `test-review` skill that reads tests from a forked
  context and reports what is missing, unnecessary or weak. It runs no
  mutation testing.

## Consequences

- Tests and code may come from the same agent; the review is what catches a
  test that checks nothing.
- Nothing detects a test changed to fit the code any more, other than the
  review.
- Projects that installed `test-first` keep their copies until they remove
  them; the `harness-setup` upgrade offers to.
