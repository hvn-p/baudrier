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
- **Reviewing a harness**: hand it to the `harness-reviewer` agent, which
  starts from a fresh context. Whoever built the harness does not review it.
- **Installing what a project lacks**: the `harness-setup` skill installs
  ready-made modules (the procedure and check for instruction files) and
  adapts them to the project.

Everything here is a recommendation. A project takes what its stakes justify:
a throwaway prototype needs little, a shared production codebase needs most.
The mechanisms described are proposals; the principle is what matters, and the
project picks the mechanism that fits it.

Four rules apply to every recommendation:

- **Plug into the project.** Adapt to its conventions, tools and workflows
  (an existing planning workflow, an existing CI). Fill the gaps; never impose
  a foundation the project has to be rebuilt around.
- **Stay vendor-neutral.** What must hold rests on what sits under the agent:
  the operating system, git, scripts in the repository, CI. Features of one
  agent (hooks, sandbox) may complement a guarantee, never carry it alone.
- **Frame a cooperative agent, do not fight an adversary.** An agent follows
  its instructions. A check that detects drift, plus a review, is enough to
  catch it. Closing every imaginable bypass costs more than it protects.
- **Never break the flow.** A harness exists so the agent can work. One that
  stops legitimate work has failed, however well it protects. Every block
  names the risk it guards against, and fires on that risk only.

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

**Know the infrastructure.** Where the code runs, which environments exist and
what serves what, how a change reaches production, which services it depends
on and their limits. The agent cannot build something sound without knowing
what it runs on, and it reads that state from the real system rather than
from the code, which shows intent where the infrastructure shows reality.
*Missing when*: no description of the environments and the deployment path;
no read access to the infrastructure's state (status, logs, configuration).

**Know the project's security stakes.** Who can reach the project, who may
see or change what, which data is sensitive. An agent that does not know a
service is exposed, or that each user must only see their own data, writes code
that works and leaks. The depth depends on the stakes: a local tool needs a
line, an exposed service needs explicit rules. Where a rule can be checked by
a program (dependency audit, security lint, a test that one user cannot read
another's data, a check that every entry point requires authentication), it
is.
*Missing when*: nothing states who may access what, on a project that is
exposed or holds other people's data; access rules enforced only by
discipline.

**Know the project's volumes and costs.** What volumes the project handles
today and tomorrow, what a request, a query or a model call costs, what the
budget is. Without it, the agent picks what works on a sample and fails at
scale or on the invoice. A personal tool needs a line, a service at scale
needs explicit figures. Where a limit can be checked by a program (a
performance budget in CI, a query count in a test), it is.
*Missing when*: nothing mentions volumes or costs, on a project that runs at
scale or pays per use.

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
Then feed it the legitimate work closest to that defect, and check that it
lets it through.
*Missing when*: a guard has no test of its own, or is tested only on what it
must stop.

### What only an AI can judge

**No feature without a plan the tests derive from.** Before each feature, a
plan describes every expected behaviour and every case precisely enough for
the tests to be written without asking questions. That is also how to judge a
plan: if the test author has to guess, the plan is insufficient. This skill
requires the plan, it does not provide the means: if the project has a
planning workflow, the plan comes from there; if not, that is a gap, and the
recommendation is to adopt one.
*Missing when*: plans that state only the intent; tests that guess what the
plan leaves open.

**The plan is confirmed, and its open points decided, before development.** A
plan read as prose is often approved without being read. Its owner confirms
it in the form that makes a gap obvious: concrete examples for logic (this
input gives this result, this one is refused with this code), a mockup for an
interface, where a missing field or action shows at once. Every open point is
decided before the work that depends on it. A human decides what has real
consequences (money, data, security, a behaviour users or other systems rely
on, anything hard to undo); the orchestrating session may decide a small
point, writes it into the plan, and lists it in its report for the owner to
confirm or reverse.
*Missing when*: plans approved as prose only; decisions taken during the work
that appear nowhere.

**Tests that matter.** Not a coverage percentage, which rewards testing what is
useless. Every piece of logic, every behaviour, every case including edge
cases has a test that would fail if it broke. Branch coverage shows what is
surely untested; whether what runs is actually checked takes a reading of the
tests. Tests go beyond the code's logic: integration and end-to-end belong to
the strategy. Knowing what to test is a skill of its own.
*Missing when*: tests assert little or nothing, only unit tests exist for a
system whose risks are in its integrations, nobody knows which tests would
catch a regression.

**An AI reviews the code at the end of development, automatically, from a
fresh context.** A review that someone has to remember to ask for gets
forgotten, so the end of development triggers it: a step of the workflow, a
hook, a CI job. It runs in a context that did not write the code (one role per
agent). The project sets it up with its own tools, for example Anthropic's
code-review plugin.
*Missing when*: no AI code review, or one that runs only when someone asks
for it; a review run in the session that wrote the code.

**The review reads the tests, not only the code.** A test that checks
nothing, or that is unnecessary, is counter-productive: it costs maintenance
and makes a behaviour look protected when it is not. The review judges what
each test protects, which behaviours, cases and boundaries have no test, and
which tests assert nothing, duplicate another or pass whatever the code does.
It reads; it does not run mutation testing, too heavy for a local machine. The
`test-review` skill does this reading.
*Missing when*: the review covers the code only; a test that asserts nothing
passes review.

**Each finding goes back to its cause.** Whatever its source (a review, a
human), a finding takes one of three paths. A bug means a test was missing: a
test that reproduces it comes first, then the fix. A quality issue changes the
code and no test. A plan that was wrong or incomplete is an open point:
decided, written into the plan, then the tests follow.
*Missing when*: bugs fixed without a test that reproduces them; tests edited
to fit a fix; a change of behaviour that reached the code but not the plan.

**One role per agent.** Agents grade their own work too favourably: the agent
that produces does not verify.

**Agents briefed for a need.** Investigation, development, review: each with
its own brief, launched when that need arises. Not one agent per language.
This also lightens the base instructions: what only matters during an
investigation stops loading into every session.

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
their equivalents, at the root or nested, load into every session started in
their directory and steer every task. They carry rules, never history or
session logs, and say where the project keeps its history instead. Every path
and command they cite exists. The `editing-agents-md` module of
`harness-setup` installs the procedure and the check for amending them.
*Missing when*: dated entries, "we did", "was removed", session summaries,
facts that contradict the code (a framework version that moved on).

**Every line earns its place.** The reader is the agent at the start of any
task. A line stays if, without it, the agent would make a mistake, and it
holds what the agent cannot discover: not the code, the configuration, the
package scripts or the lint rules, but how to run one test, where the data
lives, which environments exist. What one directory needs goes into a nested
file there, what only some tasks need into a skill or a doc; the root file is
a map to where the detail lives, within a size budget a check holds. Every
addition answers a real need (an observed mistake, a new convention), never
"just in case". Past the budget, the content belongs elsewhere, not in denser
sentences.
*Missing when*: a root file past its budget; lines that restate the code or
the package scripts; sections only one kind of task needs.

**Directives, not explanations.** A reason written inline narrows a directive
to the cases that look like it, and a directive may have several reasons: the
file links to where the reason lives (an ADR, a doc). "Never" is kept for
safety, data loss or a mistake already observed; a broad prohibition steers
away from the right call as often as from the wrong one. The file is written
for the role, not the occasion: no account of the session that produced it,
no named person or ticket unless that is the subject.
*Missing when*: paragraphs of rationale; blanket "never" rules; a session, a
person or a ticket named for no reason.

**One owner per fact.** Each fact lives in one place among the instruction
files, nested files, global configuration and skills; the others point to it
or say nothing. Where a directory has both `CLAUDE.md` and `AGENTS.md`, one is
a path to the other (a symlink, or a file whose only content imports the
other), never two different files.
*Missing when*: one rule worded differently in two files; a `CLAUDE.md` and an
`AGENTS.md` side by side with different content.

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

**Every finding that could recur ends with a harness change, or a reason not
to.** An incident, a review comment, a failed validation: each asks what in
the harness would have prevented it. A finding fixed within the work in
progress, that cannot come back, stays out of the harness. The account is
content and goes to its defined home. What matters is the answer to "what
changes so this cannot happen again", and "nothing" is a valid answer. A rule
born from a finding is maintained: when its cause goes away, it is updated or
removed. In order of preference: something that
breaks, something that informs automatically, a written rule.

**Prune.** Each component compensates for something the model cannot do. When
that stops being true, remove it.

### Guardrails

**Each guardrail informs or blocks.** Block when the mistake becomes costly to
undo, inform while it is still cheap to fix. A harness that blocks everything
gets bypassed.

**A block targets the action, not what resembles it.** A guard matches the
risky action itself (a write to the file, the setting that changes), never a
proxy that legitimate work also produces (a file name in a command, a
keyword). Each false positive halts routine work, and repeated ones teach
everyone to bypass the guard.
*Missing when*: a guard matches on a mention rather than on the action; a
block that nobody can tie to a specific risk.

**A block that must hold lives in CI.** Locally, any guard can be bypassed. In
CI, the block holds until the problem is fixed.

**Unblocking is justified, and a human validates.** A false positive must be
declarable, with an understandable, traced reason. When the agent is the one
judging that a block is a false positive, it escalates to a human, who has
more context to decide.
