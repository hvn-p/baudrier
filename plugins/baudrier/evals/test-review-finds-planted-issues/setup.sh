#!/usr/bin/env bash
# A shipping cost function and its tests, committed. Planted: the test at line
# 17 asserts nothing; the one at line 13 duplicates the one at line 5; the
# 10 kg limit (src/shipping.mjs line 6) is tested above only, never at 10 kg.
# The tests at lines 9 and 25 are sound.
set -euo pipefail
mkdir -p src test

cat > package.json <<'JSON'
{
  "name": "shipping",
  "private": true,
  "type": "module",
  "scripts": { "test": "node --test" }
}
JSON

cat > src/shipping.mjs <<'JS'
// Returns the cost in euros of shipping one parcel.
export function shippingCost(weightKg) {
  if (typeof weightKg !== 'number' || !(weightKg > 0)) {
    throw new TypeError('invalid weight');
  }
  if (weightKg > 10) throw new RangeError('too heavy');
  return weightKg < 2 ? 5 : 9;
}
JS

cat > test/shipping.test.mjs <<'JS'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shippingCost } from '../src/shipping.mjs';

test('a parcel under 2 kg costs 5', () => {
  assert.equal(shippingCost(1.99), 5);
});

test('a parcel of exactly 2 kg costs 9', () => {
  assert.equal(shippingCost(2), 9);
});

test('a light parcel is cheap', () => {
  assert.equal(shippingCost(1.99), 5);
});

test('computes the cost of a heavy parcel', () => {
  shippingCost(6);
});

test('a parcel over 10 kg is refused', () => {
  assert.throws(() => shippingCost(10.5), RangeError);
});

test('a weight that is not a positive number is refused', () => {
  assert.throws(() => shippingCost(0), TypeError);
  assert.throws(() => shippingCost('3'), TypeError);
});
JS

git init -q -b main .
git add -A
git -c user.name=fixture -c user.email=fixture@example.com commit -q -m "Initial commit"
