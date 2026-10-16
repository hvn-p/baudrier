# baudrier

Principles for the harness around an AI coding agent (instruction files,
skills, agents, hooks, tests, CI, access to data): what to set up on a project,
and how to review what is already there.

- **`harness` skill**: the principles, and the signs that show when one is
  missing.
- **`harness-reviewer` agent**: reviews a project's harness from a fresh
  context and returns recommendations backed by evidence. Read-only.

## Install

In Claude Code, then restart the session:

```
/plugin marketplace add hvn-p/baudrier
/plugin install baudrier@baudrier
```

The skill follows the open [Agent Skills](https://agentskills.io) format: with
another agent, copy `plugins/baudrier/skills/harness/` into its skills
directory.

## Use

To review a harness in Claude Code, mention `@agent-baudrier:harness-reviewer`,
or run `claude --agent baudrier:harness-reviewer` from the project's directory.

## License

[MIT](LICENSE)
