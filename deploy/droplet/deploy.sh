#!/usr/bin/env bash
# Build and (re)deploy ENovaP on the droplet. Safe to re-run for every update.
#
#   ./deploy.sh              pull latest, build the frontend, restart services
#   ./deploy.sh --no-pull    build what is checked out now
#   ./deploy.sh --rollback   switch the site back to the previous build
#
# The frontend is built in a throwaway node:18 container (same commands as
# netlify.toml) and published as a new release under www/releases/. The live
# site only switches to it after the build succeeds; the last 3 are kept.
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$DEPLOY_DIR/../.." && pwd)"
ENV_FILE="$DEPLOY_DIR/.env"
WWW_DIR="$DEPLOY_DIR/www"
KEEP_RELEASES=3

cd "$DEPLOY_DIR"

if [ ! -f "$ENV_FILE" ]; then
    echo "Missing $ENV_FILE — copy .env.example to .env and fill it in." >&2
    exit 1
fi
set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

for var in DOMAIN ACME_EMAIL; do
    if [ -z "${!var:-}" ]; then
        echo "$var must be set in $ENV_FILE" >&2
        exit 1
    fi
done

switch_release() {
    ln -sfn "releases/$1" "$WWW_DIR/current.tmp"
    mv -Tf "$WWW_DIR/current.tmp" "$WWW_DIR/current"
    echo "==> Live release: $1"
}

if [ "${1:-}" = "--rollback" ]; then
    current="$(basename "$(readlink "$WWW_DIR/current")")"
    previous="$(ls -1 "$WWW_DIR/releases" | sort | grep -B1 -x "$current" | head -n1)"
    if [ -z "$previous" ] || [ "$previous" = "$current" ]; then
        echo "No earlier release to roll back to." >&2
        exit 1
    fi
    switch_release "$previous"
    exit 0
fi

if [ "${1:-}" != "--no-pull" ]; then
    echo "==> Pulling ${DEPLOY_BRANCH:-dev}"
    git -C "$REPO_DIR" fetch origin "${DEPLOY_BRANCH:-dev}"
    git -C "$REPO_DIR" checkout "${DEPLOY_BRANCH:-dev}"
    git -C "$REPO_DIR" pull --ff-only origin "${DEPLOY_BRANCH:-dev}"
fi

# dotenv-webpack reads a .env next to each webpack config. Only the public
# REACT_APP_* values go there — server secrets never enter the bundle.
echo "==> Writing frontend build env"
for pkg in core bot-web-ui; do
    env | grep '^REACT_APP_' > "$REPO_DIR/packages/$pkg/.env" || true
done

echo "==> Building frontend (first run takes 20-40 min)"
docker run --rm \
    --user "$(id -u):$(id -g)" \
    -e HOME=/tmp \
    -e HUSKY=0 \
    -e CI=false \
    -e NODE_ENV="${BUILD_NODE_ENV:-}" \
    -e NODE_OPTIONS=--max-old-space-size=4096 \
    -v "$REPO_DIR":/app \
    -w /app \
    node:18-bullseye \
    bash -c 'npm ci && npx lerna link && npx lerna bootstrap --hoist && npm run build:all'

if [ ! -f "$REPO_DIR/packages/core/dist/index.html" ]; then
    echo "Build finished without packages/core/dist/index.html — not deploying." >&2
    exit 1
fi

release="$(date +%Y%m%d%H%M%S)"
mkdir -p "$WWW_DIR/releases"
cp -a "$REPO_DIR/packages/core/dist" "$WWW_DIR/releases/$release"
switch_release "$release"

ls -1 "$WWW_DIR/releases" | sort | head -n -"$KEEP_RELEASES" | while read -r old; do
    rm -rf "${WWW_DIR:?}/releases/$old"
done

echo "==> Starting services"
mkdir -p "$DEPLOY_DIR/data/blobs"
chown -R 1000:1000 "$DEPLOY_DIR/data"   # "node" user inside the api container
docker compose up -d --build --remove-orphans
docker compose ps

echo "==> Done: https://$DOMAIN"
