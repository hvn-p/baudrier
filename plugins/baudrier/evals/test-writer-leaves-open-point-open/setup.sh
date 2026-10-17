#!/usr/bin/env bash
# The parcel-api fixture with the test-writer agent of the test-first module,
# copied from the plugin's template with its placeholders filled, and a plan
# that leaves the cost of a parcel of exactly 2 kg open. Committed.
set -euo pipefail
here=$(dirname "$0")
bash "$here/../fixtures/parcel-api.sh" --no-instructions

mkdir -p .claude/agents docs/plans
sed 's#<<TEST_COMMAND>>#node --test#g' \
  "$here/../../skills/harness-setup/modules/test-first/agents/test-writer.md.template" \
  > .claude/agents/test-writer.md
if grep -n '<<[A-Z_]*>>' .claude/agents/test-writer.md; then
  echo "test-writer.md still has a placeholder" >&2
  exit 1
fi

cat > docs/plans/shipping-cost.md <<'EOF'
# Shipping cost

`shippingCost(weightKg)`, exported by `src/shipping.mjs`, returns the cost in
euros of shipping one parcel.

- A light parcel, under 2 kg, costs 5.
- A heavy parcel, over 2 kg and up to 10 kg, costs 9.
- A parcel over 10 kg is refused: it throws a `RangeError` with the message
  "too heavy".
- A weight that is not a number greater than 0 is refused: it throws a
  `TypeError` with the message "invalid weight".

| weightKg | Result |
|---|---|
| 0.5 | 5 |
| 1.99 | 5 |
| 2.01 | 9 |
| 10 | 9 |
| 10.01 | `RangeError` "too heavy" |
| 0 | `TypeError` "invalid weight" |
| "3" | `TypeError` "invalid weight" |
EOF

git init -q -b main .
git add -A
git -c user.name=fixture -c user.email=fixture@example.com commit -q -m "Initial commit"
