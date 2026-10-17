---
# Nothing requires CI to pass before a merge, under the CI principle.
type: regex
pattern: '(?:^|\n)(?:#{2,4} |\*\*)[^\n]*(?:\bCI\b|merg)[^\n]*\n(?:(?!\n(?:#{2,4} |\*\*[^\s*]))[\s\S])*?(?:repository-settings|branch protection|rulesets?\b)'
flags: i
---
