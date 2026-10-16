# Test-driven development with separated roles

A proposal for projects whose stakes justify it. The principle is that tests
are written from a plan, before the code, by an agent that does not write the
code, and that any later change to them is visible and justified. The steps
below are one way to get there; adapt them to the project's workflow.

## The chain

1. **Plan.** It comes from the project's planning workflow and describes every
   behaviour and case precisely enough to derive tests from.
2. **Tests.** A test agent writes them from the plan: every behaviour, every
   case, edge cases, and the integration and end-to-end levels the risks call
   for.
3. **Test review.** From a fresh context (the same agent restarted is enough,
   the fresh context is what matters): does each test check what the plan
   says, would it fail if the behaviour broke, is a case missing?
4. **Development.** A development agent writes the code. Its instructions say
   it does not modify tests unless a test is genuinely wrong.
5. **Check.** Before declaring it is done, the development agent runs the test
   check described below, and fixes the situation itself while the check
   fails. It keeps its context; no other agent has to be relaunched.
6. **Review.** A reviewer reads the development agent's report, runs the check
   again and judges each reason given.

## The test check

Detection, not prevention. Blocking writes to test files is possible but heavy
and always bypassable by some forgotten path; detecting a change and requiring
a reason covers the same cases with a small script.

- **Snapshot.** When the development agent starts, record a fingerprint of
  every test file and of the test configuration (runner config, package
  scripts, anything that changes how tests run). No commit is involved, so the
  check does not depend on committing at the right moment.
- **Compare.** The check compares the current state with the snapshot. Any
  modified, added or removed file makes it fail, with the list of files and the
  two ways out: undo the change, or justify it.
- **Justify, one reason per file.** The agent reruns the check with a reason
  for each modified file (for example `--reason tests/sum.test.js="..."`).
  Never one global reason for several files. The check fails while a modified
  file lacks its reason; otherwise it prints the table of files and reasons.
- **Report.** The agent copies that table into its final report. The reason is
  a message in the contract between agents, not a file: nothing stays in the
  repository. A reason worth keeping goes to the project's defined home for
  content (the pull request description, for example).
- **Judge.** The reviewer receives the report from whoever orchestrates the
  agents, reruns the check, and accepts or disputes each reason. A doubtful
  reason goes to a human.

An agent that can refuse to end its own turn while a command fails may run the
check that way as a complement. The script remains the basis, since it works
with any agent.

## What the check does not catch

Cheating in production code (neutralising an assertion library from the
source, special-casing test inputs) leaves the tests untouched. Only the
review catches it, which is one more reason the reviewer is not the developer.

## Test quality

Mutation testing tells whether tests test anything: it changes the code and
expects at least one test to fail. Use the tool that fits the language. Its
cost grows with the code under mutation and with the tests each mutant
reruns: scoped to the files a change touches, and incremental, it fits a
local run or a review; across the whole project it belongs to a scheduled CI
job. Coverage costs almost nothing and runs wherever the suite runs; prefer
branch coverage, and read it as what is surely untested, never as what is
tested.
