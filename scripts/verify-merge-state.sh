#!/usr/bin/env bash
set -euo pipefail

files=(
  "apps/server/src/prisma.service.ts"
  "apps/server/src/resource/resource.service.ts"
  "package-lock.json"
)

if rg -n "<<<<<<<|=======|>>>>>>>" "${files[@]}"; then
  echo "❌ Found unresolved merge markers in critical files"
  exit 1
fi

rg -n "process\.on\('beforeExit'" apps/server/src/prisma.service.ts >/dev/null
rg -n "private toNumber\(value: unknown\): number" apps/server/src/resource/resource.service.ts >/dev/null

echo "✅ merge-state verification passed"
