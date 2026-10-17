---
# The specs state intent and no cases, under the plan principle.
type: regex
pattern: '(?:^|\n)(?:#{2,4} |\*\*)[^\n]*(?:\bplans?\b|\bspecs?\b)[^\n]*\n(?:(?!\n(?:#{2,4} |\*\*[^\s*]))[\s\S])*?(?:0007|0008|export|cancel)'
flags: i
---
