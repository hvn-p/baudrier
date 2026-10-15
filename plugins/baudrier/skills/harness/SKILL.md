---
name: harness
description: What a good harness for an AI coding agent is, and how to judge one. Use when setting up or changing how coding agents work on a project (starting a project, writing or editing CLAUDE.md or AGENTS.md, adding skills, agents, hooks, CI checks, deciding a test strategy), after an agent mistake or incident, or to review an existing harness ("review the harness", "audit our agent setup", "why does the agent keep doing X"). Not a manual for any agent's configuration syntax.
---

# Harness

The harness is everything around a coding agent that makes it work well on a
project: instruction files, skills, agents, hooks, tests, CI, static checks,
access to data and documentation. This skill states what a good harness does
and why. How to write a hook or declare an agent is covered by each tool's
documentation, which changes faster than these principles.

## How to use it

- **Building or evolving a harness**: when a project starts, when a new rule
  appears in the code, after an agent mistake. Compare what the project has
  with the principles below and propose what is missing.
- **Reviewing a harness**: follow [references/review.md](references/review.md),
  in a fresh context. Whoever built the harness does not review it.

Everything here is a recommendation. A project takes what its stakes justify:
a throwaway prototype needs little, a shared production codebase needs most.
The mechanisms described are proposals; the principle is what matters, and the
project picks the mechanism that fits it.

Three rules apply to every recommendation:

- **Plug into the project.** Adapt to its conventions, tools and workflows
  (an existing planning workflow, an existing CI). Fill the gaps; never impose
  a foundation the project has to be rebuilt around.
- **Stay vendor-neutral.** What must hold rests on what sits under the agent:
  the operating system, git, scripts in the repository, CI. Features of one
  agent (hooks, sandbox) may complement a guarantee, never carry it alone.
- **Frame a cooperative agent, do not fight an adversary.** An agent follows
  its instructions. A check that detects drift, plus a review, is enough to
  catch it. Closing every imaginable bypass costs more than it protects.
  Defending against a malicious actor is a security question, not a harness
  one.

A harness has two scopes: the machine (global instructions, credentials,
global hooks) and the project (repository, CI, platform settings). Recommend
each element at the scope it belongs to. A project must not silently depend on
one machine's setup.

## Principles

### What the agent relies on

**Look things up, never remember.** Data is everything the agent needs to know
about the world to act: the system's real data, the project's documentation,
the current version of a library and how it works today, the running system.
The agent fetches this information; it never relies on training knowledge,
which is outdated by definition. Without access to these sources it produces
wrong work with confidence. This comes before every other principle: the
harness makes the sources reachable.
*Missing when*: no documented way to reach a database, a dataset, logs or a
running environment; instructions that let the agent pick versions or APIs
from memory.

### What a machine judges

**Whatever a program can check, no AI checks.** A strict, typed language
configured to refuse errors. Static analysis for the project's own rules (for
example, every API route is protected). Every path and command cited in an
instruction file resolves. Configuration counts as much as the language:
TypeScript without `strict` and with `any` tolerated behaves almost like
JavaScript.
*Missing when*: a rule exists only in prose although a linter, a type or a
script could enforce it; lint runs in warning mode.

**CI is the judge.** The agent cannot cheat it, and it carries the checks that
grow too heavy for a local machine. The loop is: push, wait, read the result,
react.
*Missing when*: no CI, or a CI whose failures do not block a merge.

**The branch stays current with the main branch.** Parallel work merges in any
order, and agents do not update their branches on their own. Pushing a stale
branch informs; merging one blocks.
*Missing when*: nothing signals a stale branch; the platform allows merging a
branch that is behind.

**Prove each guard works.** A guard that never fires looks exactly like one
that works: both stay green. Feed it a deliberate defect (an unprotected route
for the route check, a forbidden action for a hook) and check that it fails.
*Missing when*: a guard has no test of its own.

### What only an AI can judge

**No feature without a plan the tests derive from.** Before each feature, a
plan describes every expected behaviour and every case precisely enough for
the tests to be written without asking questions. That is also how to judge a
plan: if the test author has to guess, the plan is insufficient. This skill
requires the plan, it does not provide the means: if the project has a
planning workflow, the plan comes from there; if not, that is a gap, and the
recommendation is to adopt one.

**Tests that matter.** Not a coverage percentage, which rewards testing what is
useless. Every piece of logic, every behaviour, every case including edge
cases has a test that would fail if it broke. Mutation testing checks it: a
test that survives a mutation of the code tests nothing. Tests go beyond the
code's logic: integration and end-to-end belong to the strategy. Knowing what
to test is a skill of its own.
*Missing when*: tests assert little or nothing, only unit tests exist for a
system whose risks are in its integrations, nobody knows which tests would
catch a regression.

**Tests first, reviewed, then protected.** One agent writes the tests from the
plan, they are reviewed from a fresh context, then another agent writes the
code. Modifying a test is not prevented but detected, and each modified test
needs its own reason, judged by a reviewer. See
[references/tdd.md](references/tdd.md).

**One role per agent.** Agents grade their own work too favourably. The agent
that produces does not verify.

**Agents briefed for a need.** Investigation, test writing, test review,
development: each with its own brief, launched when that need arises. Not one
agent per language. This also lightens the base instructions: what only
matters during an investigation stops loading into every session.

**Define what counts as proof.** Left to the agent's interpretation, anything
becomes proof. The harness states, per kind of work, what proves it is done.
Done means the proof is delivered.

| Work | What proves it is done |
|---|---|
| Investigation | The problem observed or reproduced: trace, log, status code, command output |
| Fix | A test that fails before the change and passes after |
| Interface | A capture in the state that shows the change |
| Performance | A measurement before and after, in the same conditions |

Vocabulary: *observed* (seen on the real system), *reproduced* (triggered at
will), *hypothesis* (inferred without observation), *unverified* (named, never
passed over in silence). A conclusion drawn from reading code alone is a
hypothesis.

### What the agent reads

**Instruction files hold instructions only.** `CLAUDE.md`, `AGENTS.md` and
their equivalents carry rules, never history or session logs. They stay short
and point to deeper documentation.
*Missing when*: dated entries, "we did", "was removed", session summaries,
facts that contradict the code (a framework version that moved on).

**Content has a defined home.** Everything not directly tied to the code
(history, decisions, incident reports, meeting notes) goes where the project
manages its content: the repository if that is where it lives, a wiki or a
ticket tracker otherwise. If no such place exists, defining one is part of the
harness; otherwise the agent puts that content back into its instruction
files for lack of a better place.

**Skills for specific know-how.** Anything that needs a particular competence
with a real validation loop (pixel-perfect work against a design file,
writing a user guide) becomes a skill.

### How the harness evolves

**Continuous improvement.** A harness is never finished; it evolves with the
code. Every new rule that appears in the code calls for its check.

**Every incident ends with a harness change.** The account of the incident is
content and goes to its defined home. What matters is the answer to "what
changes so this cannot happen again". In order of preference: something that
breaks, something that informs automatically, a written rule.

**Prune.** Each component compensates for something the model cannot do. When
that stops being true, remove it.

### Guardrails

**Each guardrail informs or blocks.** Block when the mistake becomes costly to
undo, inform while it is still cheap to fix. A harness that blocks everything
gets bypassed.

**A block that must hold lives in CI.** Locally, any guard can be bypassed. In
CI, the block holds until the problem is fixed.

**Unblocking is justified, and a human validates.** A false positive must be
declarable, with an understandable, traced reason. When the agent is the one
judging that a block is a false positive, it escalates to a human, who has
more context to decide.
