---
name: test-review
description: Reviews tests from a fresh context by reading them with the code they cover, and reports the tests that are missing, unnecessary or weak. Changes nothing and runs nothing. Use at the end of development, before a pull request, or when asked to review, audit or judge tests ("review the tests", "are these tests any good", "what tests are missing"). Scope: the tests changed on the current branch, or the paths given.
argument-hint: "[paths...]"
context: fork
agent: Explore
background: false
allowed-tools: Read Grep Glob Bash(git rev-parse *) Bash(git merge-base *) Bash(git diff *) Bash(git status *) Bash(git log *) Bash(git show *)
---

# Test review

Review tests and report the ones that are missing, unnecessary or weak. You
did not write them. Change nothing, run nothing: no test, no coverage, no
mutation testing, no build. Read files with Read, Grep and Glob. Use Bash
only for git commands that read (`rev-parse`, `merge-base`, `diff`, `status`,
`log`, `show`), one command per call.

Paths given: $ARGUMENTS

## 1. Scope

- Paths given: review the test files they name or contain.
- None: review the tests changed on the current branch. The base branch is
  `git rev-parse --abbrev-ref origin/HEAD`, else `main` or `master`. Run
  `git merge-base HEAD <base branch>`, then `git diff --name-only <that
  commit>`, and add the untracked files of `git status --porcelain`. Keep the
  test files. When none changed, say so and stop.
- For each test file, read the code it covers, found from its imports, in
  full. Read the project's AGENTS.md or CLAUDE.md for its test conventions.

## 2. Judge each test file

1. **Why each test exists.** Name the behaviour or case each test protects.
   A test with no answer is a finding.
2. **Missing.** List the behaviours, cases, refusals and boundaries of the
   code. Each needs a test that would fail if it broke; each boundary needs
   one on each side (the last accepted value and the first refused one).
   Before calling one missing, search the other test files for it.
3. **Unnecessary.** A test that protects nothing: it asserts nothing, or only
   that nothing throws; it asserts what it set up itself, or a mock it
   configured; it covers the same behaviour with the same kind of input as
   another test.
4. **Weak.** A test aimed at a real behaviour that would not catch it
   breaking, or that breaks when nothing is wrong: an assertion loose enough
   to pass whatever the code returns, a conditional assertion, an assertion
   in a path that never runs, a check of implementation details (private
   calls, internal structure, call counts) instead of the observable result.

## 3. Keep only what is real

For each candidate finding, read the test and the code again, then score it:

- 0: does not stand up to a second reading, or concerns code outside the scope.
- 25: might be real; not verified.
- 50: real but minor, or a case that will rarely matter.
- 75: verified, and it matters: a behaviour the code relies on is unprotected,
  or a test gives false confidence.
- 100: certain: the code and the test show it directly.

Report only findings scored 80 or more. Never report:

- a case another test, file or layer already covers;
- a no-throw test where not throwing is the whole behaviour (a validator
  accepting valid input);
- a behaviour the code does not have: that is a question for the plan, not a
  missing test;
- style: test names, layout, framework choice, anything a linter catches;
- tests outside the scope, unless the changed code makes them wrong.

## 4. Report

Return this, exactly in this form, and nothing else:

```
## Test review

Scope: <the test files reviewed, and the base when it is a branch>.

Found <n> findings:

1. <kind>, `<file>:<line>`: <the finding in one line>
   Why: <the behaviour or case at stake, and what goes wrong>
```

`<kind>` is `missing`, `unnecessary` or `weak`. A missing test points to the
line of the code left untested; the others to the line of the test. Order by
importance. With no finding:

```
## Test review

Scope: <the test files reviewed>.

No findings. Checked for missing, unnecessary and weak tests.
```
