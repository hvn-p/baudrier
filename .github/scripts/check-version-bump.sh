#!/usr/bin/env bash
# Fails when the changes since the base touch plugins/ and the plugin keeps the
# version it has on the base: users only get an update when the version moves.
# Usage: check-version-bump.sh <base-ref>
set -euo pipefail

base=$1
manifest=plugins/baudrier/.claude-plugin/plugin.json

if git diff --quiet "$base"...HEAD -- plugins/; then
  echo "plugins/ unchanged, no version bump needed."
  exit 0
fi

version() { node -e 'console.log(JSON.parse(require("fs").readFileSync(0, "utf8")).version)'; }
before=$(git show "$base:$manifest" | version)
after=$(version < "$manifest")

if [ "$before" = "$after" ]; then
  echo "plugins/ changed but $manifest still has version $after: bump it." >&2
  exit 1
fi
echo "plugin version: $before -> $after."
