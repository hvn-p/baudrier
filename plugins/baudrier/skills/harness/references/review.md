# Reviewing a harness

The review compares a project's harness with the principles in
[../SKILL.md](../SKILL.md) and returns recommendations backed by evidence. It
changes nothing in the project.

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
- How the agent reaches data, documentation and running environments.
- Where the project keeps decisions, history and incident reports.

Prefer commands that read: the latest CI runs rather than running the full
suite locally. Cite every finding with its source (file and line, command and
output). Separate what was observed from what is inferred.

## 3. Judge each principle

For each principle: respected, partial, missing, or not applicable, with the
evidence. "Not applicable" is a valid answer when the project's stakes do not
justify the principle; say why.

Look for violations as carefully as for good practice. A harness that looks
complete often hides a guard that never fires, an instruction file that
contradicts the code, or a rule that exists only in prose.

## 4. Recommend

Each recommendation states:

- the principle concerned;
- the observation, with its evidence;
- the proposed change, adapted to the project's existing tools and workflows;
- its level: something that breaks, something that informs, or a written rule
  (prefer them in that order);
- its scope: project, machine, or platform settings.

Order recommendations by impact. They are proposals: the project decides what
its stakes justify. When a judgement depends on context the review cannot see
(intent behind a choice, a business constraint), ask instead of concluding.

## 5. Report

1. One paragraph: the overall state of the harness and the two or three
   changes that matter most.
2. The table of principles with status and evidence.
3. The recommendations, in order.
4. What could not be observed, and the questions for the team.
