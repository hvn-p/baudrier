---
name: harness-setup
description: Installs or upgrades baudrier's harness modules in a project, adapted to its tools, CI and conventions: the procedure for editing AGENTS.md and CLAUDE.md (skill, check script, CI job, reminder hook). Use when setting up or upgrading a project's harness with baudrier ("add the AGENTS.md check", "upgrade the baudrier modules").
---

# Harness setup

Installs modules into the project in the current directory, or upgrades the
ones already there. Once copied, the project owns its copies. What each module
is for is in the `harness` skill.

| Module | Installs |
|---|---|
| `editing-agents-md` | a skill, the `check-agents-md.mjs` script and its CI job, a hook that reminds the skill on every write to an AGENTS.md or CLAUDE.md |

Every module is optional and stands alone. The user picks which ones the
project gets, possibly none; a module can be added later, upgraded or left out
without changing the others.

Modules live in `${CLAUDE_PLUGIN_ROOT}/skills/harness-setup/modules/<module>/`,
each with the same layout. Skill and agent files carry a `.template` suffix so
that the plugin never loads them; drop it on copy.

| In the module | In the project |
|---|---|
| `skill/SKILL.md.template` | `.claude/skills/<module>/SKILL.md` |
| `agents/*.md.template` | `.claude/agents/*.md` |
| `scripts/*` | the project's scripts folder |
| `hooks/*.mjs` | `.claude/hooks/` |
| `hooks/settings.json` | merged into `.claude/settings.json` |
| `ci/*.yml` | the project's CI |

The scripts folder is where the project keeps the scripts its CI and its
contributors run. When its only one is a CI folder such as `.github/scripts/`,
use it: the module scripts run in CI. When it has none, propose `scripts/`.

Each script and CI file carries a version line, each skill and agent a
`# baudrier <name> <kind>, version <n>.` comment in its frontmatter. A copy
keeps its mark as it is; CI steps added to an existing job carry their file's
mark as a comment above them. JSON files carry none.

## The manifest

`.claude/baudrier.json` records the modules installed in the project:

```json
{
  "modules": {
    "editing-agents-md": {
      "version": "0.9.0",
      "files": {
        "skill/SKILL.md.template": ".claude/skills/editing-agents-md/SKILL.md",
        "scripts/check-agents-md.mjs": "scripts/check-agents-md.mjs",
        "ci/check-agents-md.yml": null
      }
    }
  }
}
```

`version` is the plugin version the module's copies come from. `files` maps
every file of the module to its path in the project: the workflow it went into
when a CI job joined an existing one, `null` when the project kept its own
equivalent instead.

## Placeholders

Never invent a value: every placeholder is required.

| Placeholder | Value |
|---|---|
| `HISTORY_HOME` | where history, decisions and incidents go |
| `RULE_MAX_CHARS`, `BLOCK_MAX_CHARS`, `ROOT_MAX_LINES` | the constants of the copied `check-agents-md.mjs` |
| `CHECK_COMMAND`, `BASE_REF` | the command that runs the copied check; the base branch as a ref (`origin/main`) |
| `SCRIPTS_DIR` | the scripts folder |

## 1. Understand the project

- Its language, test runner, lint and type checks, package manager.
- Its CI: platform, how jobs are declared and triggered, the base branch,
  whether a failing job blocks a merge.
- Its places: scripts folder, where history and decisions are kept. Read its
  AGENTS.md or CLAUDE.md first; ask for what they do not say.
- What is already there: `.claude/skills/`, `.claude/agents/`,
  `.claude/settings.json`, scripts and CI jobs with the same role.
- Modules already installed: those of `.claude/baudrier.json`, upgraded in the
  last section. Without a manifest, look for copies by their mark
  (`grep -rln "baudrier .*, version" --exclude-dir=.git .`); a match under a
  `harness-setup/modules/` directory is the plugin itself, not a copy. Copies
  without a manifest predate it: write it first (Upgrade, step 1).

## 2. Pick the modules with the user

Show each module, what it installs, and what it needs from the project. The
user picks any of them, or none. For the modules picked, list every
`<<PLACEHOLDER>>` of their files with the value proposed for this project, and
get the user's confirmation.

## 3. Install each module

1. Copy each file to its place in the project. Never overwrite a file the
   project already has: show the difference and decide with the user.
2. Replace every placeholder, and adapt every `ADAPT` part of the scripts and
   CI files. The size limits in the `editing-agents-md` skill match the
   constants of the copied `check-agents-md.mjs`. Nothing is left:
   `grep -rn '<<[A-Z_]*>>'` on the copied files prints nothing. Leave a line
   that a value made long as it is: an unwrapped copy merges cleanly on an
   upgrade.
3. Keep the version mark of each file as it is.
4. Merge `hooks/settings.json` into `.claude/settings.json`, keeping the
   hooks already there.
5. Wire the CI job into the project's CI, as its own workflow or as steps of
   an existing job, translated if it is not GitHub Actions. Steps added to an
   existing job keep its triggers: the templates work on a pull request, a push
   and a manual run alike. Making it a required check is a platform setting:
   name it to the user, do not change it.
6. Record the module in `.claude/baudrier.json`, with the plugin version from
   `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`.

## 4. Prove each check fails

Plant a violation, see the check fail and name it, remove the violation, see
it pass. Show each output.

- `check-agents-md.mjs`: a dated line and a path that does not exist in an
  instruction file; it fails naming both.
- The reminder hook:
  `echo '{"tool_input":{"file_path":"AGENTS.md"}}' | node .claude/hooks/agents-md-reminder.mjs`
  prints the reminder.
- Each CI job: on a pushed branch carrying a planted violation, the job fails.

## 5. Record where things live

Add to the project's instruction file only what passes the checks of the
`editing-agents-md` procedure (the project's copy, or the module's template
when it is not installed). Skills and agents are found by their description
and the manifest lists the copies, so a module usually needs no line. When
something passes and the project has no AGENTS.md or CLAUDE.md, create
AGENTS.md through that procedure, with a CLAUDE.md whose only content is
`@AGENTS.md`. Run its check.

Whatever modules were picked, the root instruction file carries these standing
directives, adapted to the project's wording, unless it already says the same:

```
- After a finding that could recur beyond the current work (a review, a
  validation, a human report), ask what in the harness would have prevented
  it: a check first; otherwise a rule in the closest AGENTS.md; otherwise
  nothing.
- When a change removes the cause behind such a rule (a check now covers
  it, the code changed), update or remove the rule.
```

## Upgrade

For each module of `.claude/baudrier.json` older than the plugin. A module
the plugin no longer ships is shown to the user, who decides whether its
copies and its manifest entry go.

1. No manifest yet: write it from the copies found in step 1. The installed
   version is the newest release whose templates carry the copies' marks (a
   skill or an agent without a mark predates the marks); confirm it with the
   user.
2. Fetch the module's templates at the installed version. Each release is a
   tag `v<version>` of the plugin's repository (`repository` in its
   `plugin.json`): clone it with `git clone --quiet --filter=blob:none` into a
   temporary directory. In the module's directory there,
   `plugins/baudrier/skills/harness-setup/modules/<module>/`,
   `git ls-tree -r --name-only v<version>` lists its files and
   `git show v<version>:./<path>` gives each one.
3. For each file, compare the old template, the new one and the project's
   copy:
   - the two templates are identical: nothing to do;
   - otherwise merge into the copy, in place, with
     `git merge-file --diff3 <copy> <old template> <new template>`, and read
     the templates' diff (`git diff --no-index <old> <new>`). Show the user
     every hunk that touches a placeholder or an `ADAPT` part (the comment
     and the code under it), or that the merge left in conflict, with the
     copy's text, and decide each with them. The rest of the merge stands;
   - a CI job inside an existing workflow, or `settings.json`: apply the
     templates' diff by hand to the part it became, same rule;
   - a file recorded as `null`: show the diff, for the project's own
     equivalent;
   - a file new in the module is installed as in section 3; a file the module
     dropped is shown, and the user decides whether its copy goes.
4. Run section 3 again on the result, steps 2 to 5: a new placeholder is
   proposed and confirmed as at install.
5. Prove each check fails again (section 4), and check what the instruction
   file says about the module against section 5.
6. Update the module in the manifest: the new version, and each path.

## Report

The modules installed or upgraded, each file copied or merged and where, the
value of each placeholder, each upgrade hunk decided with the user, the proof
of each check, and the platform settings left to the user.
