#!/usr/bin/env bash
# Serverda ishga tushiriladi: sayt papkasini GitHub'dagi main bilan tenglashtiradi.
# Ishlatish:  SITE_DIR=/var/www/umish.uz bash deploy/deploy.sh
# Xato bo'lsa, oldingi versiyaga qaytadi.
set -euo pipefail

SITE_DIR="${SITE_DIR:-/var/www/umish.uz}"
BRANCH="${BRANCH:-main}"

cd "$SITE_DIR"
git fetch --quiet origin "$BRANCH"

OLD="$(git rev-parse HEAD)"
NEW="$(git rev-parse "origin/$BRANCH")"
if [ "$OLD" = "$NEW" ]; then
  echo "[$(date '+%F %T')] Yangilanish yo'q (${OLD:0:7})"
  exit 0
fi

echo "[$(date '+%F %T')] ${OLD:0:7} -> ${NEW:0:7}"
git reset --hard "origin/$BRANCH"

# Node bo'lsa, loyiha tekshiruvini ishga tushiramiz; xato bo'lsa qaytamiz
if command -v node >/dev/null 2>&1 && [ -f scripts/check.mjs ]; then
  if ! node scripts/check.mjs >/tmp/umish-check.log 2>&1; then
    echo "Tekshiruv muvaffaqiyatsiz, ${OLD:0:7} ga qaytilmoqda"; tail -5 /tmp/umish-check.log
    git reset --hard "$OLD"
    exit 1
  fi
fi

# Nginx sozlamasi o'zgargan bo'lsa (qo'lda ulangan bo'lsa), tekshirib qayta yuklaymiz
if command -v nginx >/dev/null 2>&1 && nginx -t >/dev/null 2>&1; then
  (systemctl reload nginx 2>/dev/null || true)
fi

echo "[$(date '+%F %T')] Tayyor: ${NEW:0:7}"
