---
# No principle about guards is judged missing over the route guard,
# which has its own test here.
type: regex
match: not_contains
pattern: '(?:^|\n)(?:#{2,4} |\*\*)[^\n]*(?:guard[^\n]*\bmissing\b)[^\n]*\n(?:(?!\n(?:#{2,4} |\*\*[^\s*]))[\s\S])*?(?:check-routes)'
flags: i
---
