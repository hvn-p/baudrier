#!/usr/bin/env bash
# The parcel-api fixture with one principle made sound: the route guard gets a
# test of its own that plants an unprotected route and expects the guard to
# name it, and CI runs that test with the others.
set -euo pipefail
bash "$(dirname "$0")/../fixtures/parcel-api.sh"
cat > test/check-routes.test.mjs <<'TEST'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { unprotectedRoutes } from '../scripts/check-routes.mjs';

function routes(files) {
  const dir = mkdtempSync(join(tmpdir(), 'routes-'));
  for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, name), body);
  return dir;
}

test('the guard names a planted route that skips requireAuth', () => {
  const dir = routes({
    'safe.mjs': 'export const a = (r) => requireAuth(r);',
    'open.mjs': 'export const b = () => 1;',
  });
  assert.deepEqual(unprotectedRoutes(dir), ['open.mjs']);
});

test('the guard passes when every route calls requireAuth', () => {
  const dir = routes({ 'safe.mjs': 'export const a = (r) => requireAuth(r);' });
  assert.deepEqual(unprotectedRoutes(dir), []);
});
TEST
git init -q -b main .
git add -A
git -c user.name=fixture -c user.email=fixture@example.com commit -q -m "Initial commit"
