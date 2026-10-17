---
name: harness-setup
description: Installs or upgrades baudrier's harness modules in a project, adapted to its tools, CI and conventions: the test-first workflow (skill, four agents, test guard, mutation CI job) and the procedure for editing AGENTS.md and CLAUDE.md (skill, check script, CI job, reminder hook). Use when setting up or upgrading a project's harness with baudrier ("set up test-first", "add the AGENTS.md check", "upgrade the baudrier modules").
---

# Harness setup

Installs modules into the project in the current directory. Once copied, the
project owns its copies. What each module is for is in the `harness` skill.

| Module | Installs |
|---|---|
| `test-first` | a skill, the `test-writer`, `test-reviewer`, `implementer` and `test-auditor` agents, the `guard-tests.mjs` script, a mutation testing CI job |
| `editing-agents-md` | a skill, the `check-agents-md.mjs` script and its CI job, a hook that reminds the skill on every write to an AGENTS.md or CLAUDE.md |

Modules live in `${CLAUDE_PLUGIN_ROOT}/skills/harness-setup/modules/<module>/`,
each with the same layout:

| In the module | In the project |
|---|---|
| `skill/SKILL.md` | `.claude/skills/<module>/SKILL.md` |
| `agents/*.md` | `.claude/agents/` |
| `scripts/*` | the project's scripts folder |
| `hooks/*.mjs` | `.claude/hooks/` |
| `hooks/settings.json` | merged into `.claude/settings.json` |
| `ci/*.yml` | the project's CI |

## 1. Understand the project

- Its language, test runner, lint and type checks, package manager.
- Its CI: platform, how jobs are declared, the base branch, whether a failing
  job blocks a merge.
- Its places: scripts folder, where plans live, how code is reviewed, where
  history and decisions are kept. Read its AGENTS.md or CLAUDE.md first; ask
  for what they do not say.
- What is already there: `.claude/skills/`, `.claude/agents/`,
  `.claude/settings.json`, scripts and CI jobs with the same role.
- Modules already installed: find copies by their version line
  (`grep -rn "baudrier .*, version"`), and compare each with the module's.

## 2. Pick the modules with the user

Show each module, what it installs, and what it needs from the project
(`test-first` needs a plan workflow and a mutation tool for the language).
For the modules picked, list every `<<PLACEHOLDER>>` of their files with the
value proposed for this project, and get the user's confirmation.

## 3. Install each module

1. Copy each file to its place in the project. Never overwrite a file the
   project already has: show the difference and decide with the user. On an
   upgrade, carry the project's adaptations over to the new version.
2. Replace every placeholder, and adapt every `ADAPT` part of the scripts and
   CI files. The size limits in the `editing-agents-md` skill match the
   constants of the copied `check-agents-md.mjs`. Nothing is left:
   `grep -rn '<<[A-Z_]*>>'` on the copied files prints nothing.
3. Keep the version line at the top of each script as it is.
4. Merge `hooks/settings.json` into `.claude/settings.json`, keeping the
   hooks already there.
5. Wire the CI job into the project's CI, translated if it is not GitHub
   Actions. Making it a required check is a platform setting: name it to the
   user, do not change it.

## 4. Prove each check fails

Plant a violation, see the check fail and name it, remove the violation, see
it pass. Show each output.

- `guard-tests.mjs`: `snapshot`, change a protected file, `check` fails;
  restore it, `check` passes.
- `check-agents-md.mjs`: a dated line and a path that does not exist in an
  instruction file; it fails naming both.
- The reminder hook:
  `echo '{"tool_input":{"file_path":"AGENTS.md"}}' | node .claude/hooks/agents-md-reminder.mjs`
  prints the reminder.
- Each CI job: on a pushed branch carrying a planted violation, the job fails.

## 5. Record where things live

In the project's AGENTS.md or CLAUDE.md, add one line per module: where its
pieces live and when it applies. Follow the `editing-agents-md` procedure,
installed in step 3 when picked, and run its check.

## Report

The modules installed, each file copied and where, the value of each
placeholder, the proof of each check, and the platform settings left to the
user.
