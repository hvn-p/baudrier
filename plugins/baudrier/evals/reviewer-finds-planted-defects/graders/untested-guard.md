---
# The route guard has no test, under a guard principle judged missing or partial.
type: regex
pattern: '(?:^|\n)(?:#{2,4} |\*\*)[^\n]*(?:guard[^\n]*\b(?:missing|partial)\b)[^\n]*\n(?:(?!\n(?:#{2,4} |\*\*[^\s*]))[\s\S])*?(?:check-routes)'
flags: i
---
