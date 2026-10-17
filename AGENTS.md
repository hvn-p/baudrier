# baudrier

- Target Claude Code only: skills, agents, hooks and settings use its formats.
- Write everything in English, without the em dash character.
- Change the plugin under `plugins/baudrier/`. The files listed in
  `.claude/baudrier.json` are this repository's adapted copies of its
  modules, not the plugin.
- When a module artifact changes, raise its version mark.
- Run the evals in `plugins/baudrier/evals/` on demand only, with
  `claude plugin eval plugins/baudrier --scaffold --allow-tools Write Edit`.
- Principles go in `plugins/baudrier/skills/harness/`; anything a project
  installs is a module in `plugins/baudrier/skills/harness-setup/modules/`
  with the shared layout. See
  [0001](docs/decisions/0001-knowledge-and-modules.md).
- Plans and designs live in GitHub issues; a change of direction gets an
  ADR in `docs/decisions/`.
- After a finding that could recur beyond the current work (a review, a
  validation, a human report), ask what in the harness would have prevented
  it: a check first; otherwise a rule in the closest AGENTS.md; otherwise
  nothing.
- When a change removes the cause behind such a rule (a check now covers
  it, the code changed), update or remove the rule.
