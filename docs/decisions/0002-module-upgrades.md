# 0002. Upgrading installed modules by a three-way merge

## Context

A project owns and adapts its copies of the modules (see
[0001](0001-knowledge-and-modules.md)). When the plugin's templates change, the
project needs the change without losing its adaptations, and without knowing
which plugin version it installed from or what that version's templates said.

## Decision

- Installing a module records it in the project's `.claude/baudrier.json`:
  the plugin version it came from, and where each of its files went.
- Every artifact carries a version mark: a version line in scripts and CI
  files, a YAML comment in the frontmatter of skills and agents.
- Every published plugin version is a git tag `v<version>`, created by CI on
  the default branch.
- `harness-setup` upgrades a file by a three-way merge of the template at the
  installed version, the current template and the project's copy. A change
  that touches an adapted part goes to a human.

## Consequences

- A copy installed before the manifest needs one written first, from its marks.
- Changing a module artifact means raising its mark; publishing means a new
  plugin version, so the tag exists for later upgrades.
