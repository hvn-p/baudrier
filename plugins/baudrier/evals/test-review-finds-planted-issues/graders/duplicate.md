---
# The test at lines 13-15 repeats the assertion of the one at lines 5-7.
type: regex
pattern: '(?:^|\n)\s*\d+\.\s+[*_`]*unnecessary\b[^\n]*shipping\.test\.mjs:(?:5|6|7|13|14|15)\b(?:[^\n]|\n(?!\s*\d+\.\s))*?(?:duplicat|repeat|same)'
flags: i
---
