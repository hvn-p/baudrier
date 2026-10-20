---
# The 2 kg boundary test (lines 9-11) and the refusal test (lines 25-28) are sound.
type: regex
match: not_contains
pattern: '(?:^|\n)\s*\d+\.\s+[*_`]*(?:unnecessary|weak)\b[^\n]*shipping\.test\.mjs:(?:9|10|11|25|26|27|28)\b'
flags: i
---
