#!/usr/bin/env bash
# The parcel-api fixture without an instruction file, committed.
set -euo pipefail
bash "$(dirname "$0")/../fixtures/parcel-api.sh" --no-instructions
git init -q -b main .
git add -A
git -c user.name=fixture -c user.email=fixture@example.com commit -q -m "Initial commit"
