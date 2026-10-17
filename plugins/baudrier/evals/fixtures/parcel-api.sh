#!/usr/bin/env bash
# Writes the parcel-api fixture project into the current directory: a small
# Node service whose harness has planted defects. CLAUDE.md carries a dated
# history line and cites `npm run test:jest`, which package.json lacks; CI runs
# the tests but docs/repository-settings.md shows nothing requires it to pass
# before a merge; scripts/check-routes.mjs has no test of its own; the specs in
# docs/specs/ state intent and no cases. Cases call it from their scaffold.
# Usage: parcel-api.sh [--no-instructions]  (skip CLAUDE.md)
set -euo pipefail

mkdir -p src/routes test scripts docs/specs .github/workflows

if [ "${1:-}" != --no-instructions ]; then

cat > package.json <<'EOF'
{
  "name": "parcel-api",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node src/server.mjs",
    "test": "node --test",
    "check:routes": "node scripts/check-routes.mjs"
  }
}
EOF

cat > CLAUDE.md <<'EOF'
# parcel-api

HTTP API that shop owners use to manage their parcel orders.

- Run the tests with `npm test`.
- Run one test file with `npm run test:jest -- <file>`.
- Every route in `src/routes/` calls `requireAuth` from `src/auth.mjs`;
  `npm run check:routes` enforces it.
- 2025-03-14: we migrated the tests from Jest to node:test in a session with
  Paul, and removed the old fixtures.
- Specs for new features live in `docs/specs/`.
EOF
fi

cat > src/auth.mjs <<'EOF'
// Rejects a request without a valid bearer token.
export function requireAuth(request) {
  const header = request.headers?.authorization ?? '';
  if (!header.startsWith('Bearer ')) {
    const error = new Error('unauthorized');
    error.status = 401;
    throw error;
  }
  return header.slice('Bearer '.length);
}
EOF

cat > src/routes/orders.mjs <<'EOF'
import { requireAuth } from '../auth.mjs';

const orders = new Map();

export function listOrders(request) {
  const owner = requireAuth(request);
  return [...orders.values()].filter((order) => order.owner === owner);
}

export function createOrder(request) {
  const owner = requireAuth(request);
  const id = String(orders.size + 1);
  const order = { id, owner, weightKg: request.body.weightKg };
  orders.set(id, order);
  return order;
}
EOF

cat > src/routes/health.mjs <<'EOF'
import { requireAuth } from '../auth.mjs';

export function health(request) {
  requireAuth(request);
  return { ok: true };
}
EOF

cat > test/orders.test.mjs <<'EOF'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOrder, listOrders } from '../src/routes/orders.mjs';

const as = (token, body) => ({ headers: { authorization: `Bearer ${token}` }, body });

test('an owner only lists their own orders', () => {
  createOrder(as('alice', { weightKg: 1 }));
  createOrder(as('bob', { weightKg: 2 }));
  assert.deepEqual(listOrders(as('alice')).map((o) => o.owner), ['alice']);
});

test('a request without a token is refused with 401', () => {
  assert.throws(() => listOrders({ headers: {} }), { status: 401 });
});
EOF

cat > scripts/check-routes.mjs <<'EOF'
#!/usr/bin/env node
// Fails when a route module in src/routes/ does not call requireAuth.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function unprotectedRoutes(dir) {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.mjs'))
    .filter((file) => !readFileSync(join(dir, file), 'utf8').includes('requireAuth('));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const missing = unprotectedRoutes('src/routes');
  if (missing.length) {
    console.error(`Routes without requireAuth: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log('Every route calls requireAuth.');
}
EOF

cat > .github/workflows/ci.yml <<'EOF'
name: CI

on:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm test
      - run: npm run check:routes
EOF

cat > docs/repository-settings.md <<'EOF'
# Repository settings

Exported from the GitHub repository settings, since the platform API is not
reachable from every environment.

- Default branch: `main`.
- Branch protection rules on `main`: none.
- Rulesets: none.
- Merge methods allowed: squash.
EOF

cat > docs/specs/0007-export-orders-csv.md <<'EOF'
# 0007. Export orders as CSV

Shop owners want to export their orders as a CSV file so they can do their
accounting in a spreadsheet. The export should be fast and easy to use, and
work for shops with many orders.
EOF

cat > docs/specs/0008-cancel-order.md <<'EOF'
# 0008. Cancel an order

Shop owners need to be able to cancel an order they created by mistake.
Cancelling should be simple and safe.
EOF
