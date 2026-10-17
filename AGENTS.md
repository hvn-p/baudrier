# baudrier

- Target Claude Code only: skills, agents, hooks and settings use its formats.
- Write everything in English, without the em dash character.
- Change the plugin under `plugins/baudrier/`. `.claude/` and the module
  scripts in `.github/scripts/` are this repository's adapted copies of its
  modules, not the plugin.
- When a module script's behaviour changes, raise its `version` line.
- Keep plans and decisions in GitHub issues and pull requests, not in
  repository files.

## Modules installed here

- `test-first`, for a planned feature or fix:
  `.claude/skills/test-first/SKILL.md`, its agents in `.claude/agents/`, the
  guard `.github/scripts/guard-tests.mjs`.
- `editing-agents-md`, for any change to an AGENTS.md or CLAUDE.md:
  `.claude/skills/editing-agents-md/SKILL.md`, the check
  `.github/scripts/check-agents-md.mjs`, the hook
  `.claude/hooks/agents-md-reminder.mjs`.
