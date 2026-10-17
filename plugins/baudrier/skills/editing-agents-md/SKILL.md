---
name: editing-agents-md
description: How to write and change an AGENTS.md or CLAUDE.md, at the root or nested in any directory. Use every time one is created or edited, when adding a rule or a convention for agents, when cleaning one up ("this CLAUDE.md is too long", "tidy AGENTS.md"), or to set its check up in a project ("check our AGENTS.md in CI").
---

# Editing AGENTS.md and CLAUDE.md

These files load into every session the agent starts in their directory. Each
line costs attention on every task and steers every task, so what goes in is
judged line by line. This skill covers `AGENTS.md` and `CLAUDE.md` only,
wherever they sit; other documentation follows its own rules.

## What a good file is

1. **Its reader is the agent, at the start of any task.** It holds only what
   changes what the agent does. The test for every line: without it, would
   the agent make a mistake? If not, the line goes.
2. **Directives, not explanations.** When a directive needs context, link to
   where it is explained (an ADR, a doc). Never write the reason inline: a
   reason narrows the directive to the cases that look like it, and a
   directive may have several reasons.
3. **What holds for almost every task.** What holds for one directory goes into
   a nested file there; what only some tasks need goes into a skill or a doc
   the file points to. The root file is a map to where the detail lives.
4. **What the agent cannot discover.** Not the code, the configuration, the
   package scripts or the lint rules, which it reads. Instead: how to run a
   single test, where the data lives, which environments exist.

## What it never holds

5. **History.** No dates, "now", "we", "was removed", "previously", changelogs
   or sync reports. The file says where the project keeps its history,
   decisions, incidents and plans.
6. **A rule a program can enforce.** That rule becomes a lint, a test, a hook
   or a CI check, and the file points to it in one line at most. In order of
   preference: something that breaks, something that informs, a written rule.
7. **A fact owned elsewhere.** Each fact has one owner among AGENTS.md,
   CLAUDE.md, nested files, global configuration and skills. The others point
   to it or say nothing.
8. **"Never" rules**, except for safety, data loss, or a mistake already
   observed. A broad prohibition steers the agent away from the right call as
   often as from the wrong one.

## How it stays good

9. **True today.** Every path and command it cites exists; nothing in it
   contradicts the code.
10. **Short**, within the size limits below.
11. **Written for the role, not the occasion.** No account of the session that
    produced it, no named person or ticket unless that is the subject.
12. **Every addition answers a real need**: an observed mistake, a new
    convention. Never "just in case".
13. **One file per directory.** Where a directory has both CLAUDE.md and
    AGENTS.md, one is a path to the other: a symlink, or a file whose only
    content imports the other (a CLAUDE.md holding `@AGENTS.md`). Never two
    different files.

## Amending the file

Route the change before writing it:

| The change is | It goes to |
|---|---|
| A rule a program can enforce | A check (lint, test, hook, CI), pointed to in one line |
| History, a decision, an incident | The project's home for that content |
| An explanation of the code | Nowhere: the code and its comments carry it |
| Needed for a minority of tasks | A nested file or a skill |
| A directive almost every task needs | The file |

Then write it as a directive, apply the line test to it and to what it sits
next to, and run the check script.

## Size limits

Defaults, adjustable by the project in the script's `ADAPT` section:

- a single amendment adds at most about 300 characters per rule (a paragraph
  or a list item) and 1500 per contiguous block (a section);
- a root file stays within 150 lines;
- a full rewrite is judged on the file budget only.

Past a limit, the content belongs elsewhere (principle 3), not in a denser
sentence.

## The check

[`scripts/check-agents-md.mjs`](scripts/check-agents-md.mjs), in Node without
dependencies, checks every AGENTS.md and CLAUDE.md in the repository: the pair
rule, the root line budget, history markers, and that each cited path exists.
With `--base <ref>`, it also holds what the changes since that ref add to the
amendment limits. Each violation names the file, the line and the rule.
The line test, the routing and every other principle stay a matter of
judgment.

### Setting it up in a project

1. Copy the script into the project, where its other scripts live. The
   project owns its copy.
2. Adapt the parts marked `ADAPT`: the limits, the history patterns, which
   inline-code spans count as paths. Keep the version line, so a review can
   tell how far the copy has drifted.
3. Prove it works on this project: plant a violation (a dated line, a path
   that does not exist) and check that it fails and names it.
4. Run it in CI on pull requests, with the base branch:
   `node <path>/check-agents-md.mjs --base origin/<base>`, after a checkout
   with the full history.
5. Write in the project's instructions where the check lives.
