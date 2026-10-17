# baudrier

- Target Claude Code only: skills, agents, hooks and settings use its formats.
- Write everything in English, without the em dash character.
- Change the plugin under `plugins/baudrier/`. The files listed in
  `.claude/baudrier.json` are this repository's adapted copies of its
  modules, not the plugin.
- When a module artifact changes, raise its version mark.
- Principles go in `plugins/baudrier/skills/harness/`; anything a project
  installs is a module in `plugins/baudrier/skills/harness-setup/modules/`
  with the shared layout. See
  [0001](docs/decisions/0001-knowledge-and-modules.md).
- Plans live in GitHub issues; decisions in `docs/decisions/`.
- Checked on 2026-10-17, see `docs/missing.md`.
