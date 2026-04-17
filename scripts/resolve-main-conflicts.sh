#!/usr/bin/env bash
set -euo pipefail

# Must be run while a merge/rebase conflict is in progress.
# Strategy:
# - Keep feature-branch implementations for service/module files.
# - Keep main branch package manifests/lockfile to avoid dependency drift conflicts.

keep_ours=(
  apps/server/src/auth/auth.service.ts
  apps/server/src/auth/dto/register.dto.ts
  apps/server/src/building/building.config.ts
  apps/server/src/building/building.controller.ts
  apps/server/src/building/building.service.ts
  apps/server/src/prisma.service.ts
  apps/server/src/resource/resource.service.ts
)

keep_theirs=(
  package.json
  package-lock.json
)

for f in "${keep_ours[@]}"; do
  git checkout --ours -- "$f" || true
done

for f in "${keep_theirs[@]}"; do
  git checkout --theirs -- "$f" || true
done

git add "${keep_ours[@]}" "${keep_theirs[@]}"

echo "✅ Conflict resolution strategy applied."
echo "Next: run npm install --package-lock-only, npm run verify:merge-state, then git commit."
