---
# CLAUDE.md carries a dated history line, under the instruction-files principle.
type: regex
pattern: '(?:^|\n)(?:#{2,4} |\*\*)[^\n]*(?:instruction)[^\n]*\n(?:(?!\n(?:#{2,4} |\*\*[^\s*]))[\s\S])*?(?:2025-03-14|\bdated\b)'
flags: i
---
