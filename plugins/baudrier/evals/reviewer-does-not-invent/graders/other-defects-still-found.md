---
# The rest of the fixture is unchanged: the review still files its
# defects under their principles.
type: regex
pattern: '^(?=[\s\S]*?(?:^|\n)(?:#{2,4} |\*\*)[^\n]*(?:instruction)[^\n]*\n(?:(?!\n(?:#{2,4} |\*\*[^\s*]))[\s\S])*?(?:test:jest))(?=[\s\S]*?(?:^|\n)(?:#{2,4} |\*\*)[^\n]*(?:\bCI\b|merg)[^\n]*\n(?:(?!\n(?:#{2,4} |\*\*[^\s*]))[\s\S])*?(?:repository-settings|branch protection|rulesets?\b))'
flags: i
---
