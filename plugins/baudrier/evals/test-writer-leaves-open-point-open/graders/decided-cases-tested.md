---
# The behaviours the plan decides are tested.
type: regex
target: { source: file, path: test/shipping.test.mjs }
pattern: '^(?=[\s\S]*too heavy)(?=[\s\S]*invalid weight)(?=[\s\S]*RangeError)(?=[\s\S]*TypeError)[\s\S]*shippingCost'
---
