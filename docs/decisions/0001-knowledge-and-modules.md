# 0001. Knowledge in the harness skill, execution in installable modules

## Context

baudrier holds two kinds of content. Principles explain what makes a good
harness: why tests come first and from another agent, what an AGENTS.md must
and must not hold. Procedures say how to do one thing in a project: run the
test-first loop, validate an AGENTS.md change. Mixed in one skill, a procedure
grows explanations, and the explanations get loaded every time the procedure
runs. A project also needs its procedures, scripts and CI jobs to work without
the plugin, for every contributor and in CI.

## Decision

- Principles live only in `plugins/baudrier/skills/harness/`. The
  harness-reviewer agent judges a project with them.
- Anything a project runs is a module under
  `plugins/baudrier/skills/harness-setup/modules/<module>/`, grouped by domain
  rather than by kind of file. Every module uses the same layout: `skill/`,
  `agents/`, `scripts/`, `hooks/`, `ci/`, each mapped to a place in the
  project.
- Skill and agent templates carry a `.template` suffix, so the plugin never
  loads them; the setup drops it on copy.
- `harness-setup` copies a module into a project and adapts it there. The
  project owns its copy. A versioned package that projects depend on instead
  may replace the copy later.
- The plugin targets Claude Code only.

## Consequences

- A project works without the plugin installed.
- A copy drifts from its template: each artifact carries a version line, and
  upgrading an installed module needs its own procedure.
- Adding a module means adding a directory with the shared layout, never a
  skill or an agent at the plugin's top level.
