---
# CLAUDE.md cites `npm run test:jest`, missing from package.json, under the instruction-files principle.
type: regex
pattern: '(?:^|\n)(?:#{2,4} |\*\*)[^\n]*(?:instruction)[^\n]*\n(?:(?!\n(?:#{2,4} |\*\*[^\s*]))[\s\S])*?(?:test:jest)'
flags: i
---
