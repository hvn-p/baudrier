#!/usr/bin/env bash
# The parcel-api fixture as it is, committed.
set -euo pipefail
bash "$(dirname "$0")/../fixtures/parcel-api.sh"
git init -q -b main .
git add -A
git -c user.name=fixture -c user.email=fixture@example.com commit -q -m "Initial commit"
