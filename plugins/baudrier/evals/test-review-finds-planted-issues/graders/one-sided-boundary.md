---
# The 10 kg limit is tested above it only: nothing checks 10 kg is accepted.
type: regex
pattern: '(?:^|\n)\s*\d+\.\s+[*_`]*missing\b(?:[^\n]|\n(?!\s*\d+\.\s))*?(?:shipping\.mjs:6\b|shipping\.test\.mjs:2[1-3]\b|exactly 10\b|\b10(?:\.0+)? ?kg\b)'
flags: i
---
