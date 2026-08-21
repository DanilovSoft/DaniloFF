#!/usr/bin/env bash
# Прогон визуальных тестов в официальном образе Playwright.
#
# Тесты запускаются только здесь: одинаковая версия Chromium, одинаковые
# системные шрифты и рендеринг на macOS, Linux и Windows — иначе эталонные
# скриншоты расходятся на каждой машине.
#
#   npm run test:visual              — сравнить с эталонами
#   npm run test:visual:update       — перезаписать эталоны
#   npm run test:visual -- --ui      — любые флаги Playwright пробрасываются
#
# Отчёт после прогона: tests/report/index.html
set -euo pipefail

IMAGE="mcr.microsoft.com/playwright:v1.62.1-noble"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! docker info >/dev/null 2>&1; then
  echo "Нужен запущенный Docker: тесты идут в образе $IMAGE" >&2
  exit 1
fi

if [ "${1:-}" = "--report-only" ]; then
  exec npx --yes http-server "$ROOT/tests/report" -p 9323 -o
fi

docker run --rm --ipc=host \
  -v "$ROOT":/work -w /work \
  -e CI=1 \
  "$IMAGE" \
  bash -lc '[ -d node_modules ] || npm ci --no-audit --no-fund; npx playwright test "$@"' _ "$@"
