# baudrier

A Claude Code plugin for the harness around a coding agent (instruction files,
skills, agents, hooks, tests, CI, access to data): what to set up on a
project, how to review what is already there, and ready-made modules that
install parts of it into a project.

- **`harness` skill**: the principles of a good harness, from instruction
  files to test-first development, and the signs that show when one is
  missing.
- **`harness-reviewer` agent**: reviews a project's harness from a fresh
  context and returns recommendations backed by evidence. Read-only.
- **`harness-setup` skill**: installs modules into a project, adapted to its
  tools and CI. `test-first`: tests written from the plan and reviewed before
  the code, by separate agents, with a guard that requires a reason for any
  changed test. `editing-agents-md`: a procedure for changing AGENTS.md and
  CLAUDE.md, with a CI check and a reminder hook.

## Install

```
/plugin marketplace add hvn-p/baudrier
/plugin install baudrier@baudrier
```

Then restart the session.

## Use

- Review a harness: mention `@agent-baudrier:harness-reviewer` in a session
  opened in the project's directory.
- Install modules: ask to "set up the harness with baudrier", or name a
  module ("set up test-first"). Once installed, they are the project's own
  skills, agents and checks.

## License

[MIT](LICENSE)
