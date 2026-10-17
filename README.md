# baudrier

A Claude Code plugin for the harness around a coding agent (instruction files,
skills, agents, hooks, tests, CI, access to data): what to set up on a
project, how to review what is already there, and a test-first workflow with
separated roles.

- **`harness` skill**: the principles of a good harness, and the signs that
  show when one is missing.
- **`harness-reviewer` agent**: reviews a project's harness from a fresh
  context and returns recommendations backed by evidence. Read-only.
- **`test-first` skill**: tests written from the plan before the code, by an
  agent that does not write the code, with a guard script that detects any
  later change to a test and requires a reason per file. It runs the
  `test-writer`, `test-reviewer`, `implementer` and `test-auditor` agents.
- **`editing-agents-md` skill**: how to write and amend AGENTS.md and
  CLAUDE.md files, with a check script for CI (pair rule, size, history,
  cited paths, amendment limits) and a hook that reminds the agent of the
  skill whenever it writes one.

## Install

```
/plugin marketplace add hvn-p/baudrier
/plugin install baudrier@baudrier
```

Then restart the session.

## Use

- Review a harness: mention `@agent-baudrier:harness-reviewer` in a session
  opened in the project's directory.
- Develop with test-first: ask for it by name; to set the guard up in a
  project, ask to "set up test-first".

## License

[MIT](LICENSE)
