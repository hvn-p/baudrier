---
name: test-first
description: Develop a feature or a fix with the tests written first, by an agent that does not write the code, reviewed from a fresh context, then code written by another agent that may change a test only with a reason per file. Use when implementing a planned feature or fix in a project that works this way, or to set the workflow up in a project ("set up test-first", "add the test guard").
---

# Test-first development

Tests are written from a plan, before the code, by an agent that does not
write the code. Any later change to a test is detected and needs its own
reason, judged by a reviewer. Separating the roles is the point: an agent
grades its own work too favourably, and one that writes both the tests and the
code adjusts one to the other.

The session that runs this skill orchestrates. It hands each step to the
agent for that role and passes on what the next one needs.

| Role | Agent | Writes |
|---|---|---|
| Write the tests | `test-writer` | Tests only |
| Review the tests | `test-reviewer` | Nothing |
| Write the code | `implementer` | Code; a test only with a reason |
| Audit the tests and the plan | `test-auditor` | Nothing |

## Before starting: the plan

The plan describes every behaviour, every case and every refusal precisely
enough for the tests to be derived without guessing; for an interface, what
each screen shows and lets the user do. It lives wherever the project plans
its work, in whatever shape: an issue, a specification, sometimes a functional
specification and a separate technical plan. Read all of it; the tests derive
from what the behaviour must be, the code from both. If the plan only states
the intent, stop and get it completed, from the project's workflow or by
asking.

### Confirm it before the tests

A plan read as prose is often approved without being read. Before any test is
written, show its owner the plan in the form that makes a gap obvious:

- for logic, a table of concrete examples: this input gives this result, this
  one is refused with this code;
- for an interface, a mockup (a sketch, a static page, a design file): a
  missing field or action shows at once.

Add the open points to it. The tests start once the owner confirms.

### Open points

Every open point is decided before the tests are written, since a test fixes
the behaviour it expects. Who decides depends on the consequences:

- **A human**, for a decision with real consequences: money, data, security,
  a behaviour users or other systems rely on, anything hard to undo.
- **The orchestrating session**, for a small decision still open when the work
  starts. It decides, adds the decision to the plan, and records it.

Decisions taken this way are listed in the final report, so the person who
owns the plan can confirm or reverse them.

## The sequence

1. **Tests.** Give `test-writer` the plan. It returns the tests, a map from
   each item of the plan to its tests, the points the plan leaves open, and
   confirms each new test fails for the expected reason.
2. **Test review.** Give `test-reviewer` the plan and the list of test files,
   nothing else from the writer's context. It accepts, or returns what to
   change. Loop back to step 1 with its findings until it accepts; after two
   rounds without agreement, ask a human. Open points raised by either agent
   are decided as described above, added to the plan, and loop back to step 1
   before going further.
3. **Snapshot.** Run the project's test guard: `snapshot`. From here on, any
   change to a protected file is detected.
4. **Code.** Give `implementer` the plan and the accepted tests. It writes the
   code until the tests pass, runs the guard's `check` before declaring it is
   done, and returns its report with the guard's table. It may instead stop on
   a discovery with real consequences (the plan is wrong or incomplete, a
   decision is needed): decide it as an open point, update the plan, and go
   back to the step it affects, the tests first if the expected behaviour
   changes.
5. **Audit and review.** Push the branch first, so that CI runs the tests and
   the mutation testing on the changed files. Give `test-auditor` the plan and
   the implementer's report. It reruns the guard, judges each reason, looks for
   code that games the tests, checks every item of the plan is implemented, and
   measures the tests. Surviving mutants go back to `test-writer` for the
   missing tests, then through a new review and snapshot; one that reveals a
   behaviour nobody decided is an open point first. The code itself is
   reviewed the way the project already reviews code. Each finding follows its
   path, below.
6. **Disputed reasons go to a human**, with the reason and the reviewer's
   objection side by side.

### When a review finds something

Whatever the source (the audit, the code review, another review tool, a
human), each
finding takes one of three paths, and only that loop runs again:

| Finding | Path |
|---|---|
| A bug: the code does not do what the plan says | A test was missing. `test-writer` adds a test that reproduces it and fails, `test-reviewer` reviews it, new snapshot, `implementer` fixes, audit and review |
| A quality issue with no change in behaviour | No test changes: `implementer` fixes, runs `check`, audit and review |
| The plan was wrong or incomplete | An open point: decide it, update the plan and its examples, then back to the tests |

Done means: the tests pass, the guard's check passes, the audit and the code
review accept, and the final report lists every decision taken on the way. The
guard's table, if any test changed, goes where the project keeps such content
(the pull request description, for example). It never stays as a file in the
repository.

## The test guard

Blocking writes to test files is heavy and always bypassable by some forgotten
path. Detecting changes and requiring a reason covers the same cases with a
small script: [`scripts/guard-tests.mjs`](scripts/guard-tests.mjs), in Node,
without dependencies.

- `snapshot` records a fingerprint of every protected file (tests, their
  configuration, and the guard script itself), inside the git directory: never
  versioned, separate for each worktree, independent of any commit.
- `check` fails on any modified, added or removed protected file without its
  own reason, and names the two ways out: undo the change, or rerun with
  `--reason <file>="<why>"`, one per file. Once each change has a reason, it
  prints the table of files, changes and reasons.

### Setting it up in a project

1. Copy the script into the project, where its other scripts live. The
   project owns its copy.
2. Adapt the parts marked `ADAPT`. First, what counts as a protected file: the
   test directories and file names the project uses, plus the test
   configuration whose change could make failing tests pass. Keep the version
   line, so a review can tell how far the copy has drifted.
3. Prove it works on this project: take a snapshot, change a protected file,
   and check that `check` fails and names it.
4. Write in the project's instructions where the guard lives, that the
   orchestrating session takes the snapshot, and that the implementer runs
   `check` before declaring it is done.
5. Add a CI job that runs mutation testing on the files a pull request
   changes, with the language's mutation tool. It is too heavy to run on a
   shared machine, and the test audit reads its result.

## Limits

The guard does not see cheating in production code: neutralising an assertion
library, special-casing the inputs the tests use. Only the test audit catches
it, which is one more reason the auditor is not the implementer.
