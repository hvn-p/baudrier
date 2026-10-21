# baudrier

A Claude Code plugin for the harness around a coding agent (instruction files,
skills, agents, hooks, tests, CI, access to data): what to set up on a
project, how to review what is already there, and ready-made modules that
install parts of it into a project.

- **`harness` skill**: the principles of a good harness, from instruction
  files to code and test review, and the signs that show when one is
  missing.
- **`harness-reviewer` agent**: reviews a project's harness from a fresh
  context and returns recommendations backed by evidence. Read-only.
- **`test-review` skill**: reviews tests from a fresh context and reports
  the ones that are missing, unnecessary or weak. Read-only.
- **`harness-setup` skill**: installs modules into a project, adapted to its
  tools and CI, and upgrades them to a later plugin version.

## Modules

Every module is optional: a project installs only the ones it and its owner
want, now or later, and each works without the others.

- **`editing-agents-md`**: the procedure for changing AGENTS.md and CLAUDE.md,
  with a check for CI and a reminder hook.

## Install

```
/plugin marketplace add hvn-p/baudrier
/plugin install baudrier@baudrier
```

Then restart the session.

## Use

- Review a harness: mention `@agent-baudrier:harness-reviewer` in a session
  opened in the project's directory.
- Review tests: run `/baudrier:test-review`, on the tests changed on the
  current branch or on the paths given.
- Install modules: ask to "set up the harness with baudrier", or name a
  module ("set up editing-agents-md"). Once installed, they are the project's
  own skills, agents and checks, listed in `.claude/baudrier.json`.
- Upgrade them after a plugin update: ask to "upgrade the baudrier modules".

## License

[MIT](LICENSE)
