#!/usr/bin/env bash
# One-time bootstrap for a fresh Ubuntu 22.04/24.04 droplet. Run as root:
#
#   curl -fsSL https://raw.githubusercontent.com/pressly29/ENovaP/dev/deploy/droplet/setup.sh | bash
#
# Installs Docker + git, adds swap (the monorepo build needs ~6 GB of memory),
# opens the firewall for SSH/HTTP/HTTPS, and clones the repo to /opt/enovap.
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/pressly29/ENovaP.git}"
BRANCH="${BRANCH:-dev}"
APP_DIR="${APP_DIR:-/opt/enovap}"
SWAP_SIZE_GB="${SWAP_SIZE_GB:-4}"

if [ "$(id -u)" -ne 0 ]; then
    echo "Run as root (or with sudo)." >&2
    exit 1
fi

echo "==> Installing base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl git ufw

if ! command -v docker >/dev/null 2>&1; then
    echo "==> Installing Docker"
    curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

if ! swapon --show | grep -q '/swapfile'; then
    echo "==> Adding ${SWAP_SIZE_GB}G swap"
    fallocate -l "${SWAP_SIZE_GB}G" /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Configuring firewall"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

if [ ! -d "$APP_DIR/.git" ]; then
    echo "==> Cloning $REPO_URL ($BRANCH) into $APP_DIR"
    git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

ENV_FILE="$APP_DIR/deploy/droplet/.env"
if [ ! -f "$ENV_FILE" ]; then
    cp "$APP_DIR/deploy/droplet/.env.example" "$ENV_FILE"
    chmod 600 "$ENV_FILE"
fi

cat <<EOF

Setup complete. Next:
  1. nano $ENV_FILE        # set DOMAIN, ACME_EMAIL and your keys
  2. $APP_DIR/deploy/droplet/deploy.sh
EOF
