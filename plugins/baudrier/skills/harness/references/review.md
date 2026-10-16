# Reviewing a harness

The review compares a project's harness with the principles in
[../SKILL.md](../SKILL.md) and returns recommendations backed by evidence. It
changes nothing in the project: a measurement that needs tools installed runs
in a temporary clone of the repository.

Run it from a fresh context. The agent that built or last changed the harness
is the worst placed to review it.

## 1. Understand the project before judging it

- What the project is, who uses it, what is at stake. A prototype and a
  production system do not need the same harness.
- Which agents work on it, and what workflows are already in place (planning,
  CI, review, parallel branches). Recommendations plug into these.
- What lives on the machine rather than in the repository. The review sees the
  repository and what the platform exposes; say what could not be observed.

## 2. Gather evidence

Look before concluding. Typical sources:

- Instruction files (`CLAUDE.md`, `AGENTS.md`, nested ones), skills, agent
  definitions, hooks and settings of every agent in use.
- Language and lint configuration: strictness, warnings versus errors.
- Test setup: what exists, at which levels, how it runs, mutation testing.
- CI workflows, and whether failures block a merge (branch protection or
  rulesets, through the platform's CLI or API when available).
- How features are specified before being built: issues, specs, the output of
  a planning workflow. Read a few recent ones.
- How the agent reaches data, documentation and running environments.
- What the agent can know of the infrastructure: environments, deployment
  path, services the project depends on, and read access to their state.
- What the project states about security (exposure, who may access what,
  sensitive data), and about volumes and running costs. Silence on these, for
  a project whose stakes call for them, is a finding.
- Where the project keeps decisions, history and incident reports.
- Recent pull requests and issues: bugs caught by a human reviewer rather than
  by a test point to a missing test layer.

Prefer commands that read: the latest CI runs rather than running the full
suite locally. Cite every finding with its source (file and line, command and
output). Separate what was observed from what is inferred.

## 3. Judge each principle

For each principle: respected, partial, missing, or not applicable, with the
evidence. "Not applicable" is a valid answer when the project's stakes do not
justify the principle; say why.

Two principles cannot be judged from an inventory, and need a closer look:

- **The plan.** Take the specifications of a few recent features and ask
  whether a test author could derive the tests from them without guessing:
  are the behaviours, edge cases and refusals written down, or only the
  intent?
- **The tests.** Measure before judging, then judge what the measures cannot
  see.
  1. Run the deterministic tools in a temporary clone, or read their results
     in CI. Branch
     coverage first: line coverage overstates, since a line can count as
     covered while the error path on it never runs. A test lint if the
     ecosystem has one (tests without assertions, conditional assertions).
     Mutation testing on two or three modules that carry real business logic,
     scoped to those files and their tests, incremental when the tool allows
     it. A scoped run takes seconds for a pure module and a few minutes for one
     that hits a database; the whole project belongs to a scheduled CI job, not
     to a review. Never run tests against a database that other work depends
     on.
  2. Read surviving mutants as questions ("is this boundary tested on both
     sides?"), after dropping the noise: mutants on error message strings when
     tests assert error codes, and equivalent mutants.
  3. Then judge what no tool sees: behaviours the plan expects and the code
     does not implement, edge cases nobody thought of, missing layers (an
     interface with no test, flows across components). Check that the test
     layers match where the bugs actually come from.
  If the project has none of these tools, their absence is a recommendation,
  and the review falls back to reasoning about mutations on a few lines,
  saying it is reasoning.

Look for violations as carefully as for good practice. A harness that looks
complete often hides a guard that never fires, an instruction file that
contradicts the code, or a rule that exists only in prose.

## 4. Recommend

Group findings by principle. Several findings are often symptoms of one weak
principle (a flaky test, a shared test database and an untested interface all
say the tests do not protect enough), and ranking them one by one buries the
cause. Each principle in default gets one verdict in a line, its findings as
evidence, then its recommendations.

Each recommendation states:

- the proposed change, adapted to the project's existing tools and workflows;
- its level: something that breaks, something that informs, or a written rule
  (prefer them in that order);
- its scope: project, machine, or platform settings.

Order the principles by impact. Recommendations are proposals: the project
decides what its stakes justify. When a judgement depends on context the
review cannot see (intent behind a choice, a business constraint), ask instead
of concluding.

## 5. Report

1. One paragraph: the overall state of the harness and what matters most.
2. The principles in default, worst first: verdict, findings with evidence,
   recommendations.
3. The principles respected, one line each.
4. What could not be observed, and the questions for the team.
