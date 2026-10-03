# Deploying ENovaP to a DigitalOcean droplet

This runs the whole site on one droplet with Docker:

```
Internet ──► Caddy :80/:443 (auto HTTPS)
               ├─ /.netlify/functions/*  ──► api container (Node 18)
               │                               runs netlify/functions/* unchanged
               │                               data on disk: deploy/droplet/data/blobs
               └─ everything else        ──► static SPA from www/current
                                               (packages/core/dist, try_files → index.html)
```

- **No frontend code changes.** The app keeps calling `/.netlify/functions/<name>`. Caddy sends those calls to a small Node server (`server/index.js`) that loads the existing function handlers.
- **Netlify Blobs is replaced** by `server/blobs-shim.js`, which stores the same keys as files under `data/blobs/` (`events/` for analytics, `payments/` for receipts, entitlements and sales).
- **Netlify behaviour kept:** www→apex redirect, SPA fallback, security headers, `default.conf` cache rules.

## 1. Create the droplet

- **Image:** Ubuntu 24.04 LTS
- **Size:** 4 GB RAM / 2 vCPU or bigger (Basic, about $24/mo). The monorepo build needs about 6 GB of memory, and `setup.sh` adds 4 GB of swap to cover it. A 2 GB droplet can work with `SWAP_SIZE_GB=6`, but the build will be very slow.
- **Auth:** add your SSH key.
- Note the droplet's **public IPv4**.

## 2. DNS

At your domain registrar or DNS host (or in DigitalOcean → Networking → Domains), create:

| Type | Name  | Value         |
| ---- | ----- | ------------- |
| A    | `@`   | droplet IP    |
| A    | `www` | droplet IP    |

Remove the old Netlify records (`ALIAS`/`CNAME` to `*.netlify.app`, or Netlify's load balancer IP) for those names.

To test before moving DNS, set `DOMAIN=<droplet-ip>.sslip.io` in step 4. sslip.io resolves to your IP and still gets a real certificate. Deriv login will not work on that hostname (see step 6).

## 3. Bootstrap the droplet (once)

```bash
ssh root@<droplet-ip>
curl -fsSL https://raw.githubusercontent.com/pressly29/ENovaP/dev/deploy/droplet/setup.sh | bash
```

This installs Docker, git and swap, opens ports 22/80/443 in `ufw`, and clones the repo to `/opt/enovap`.

## 4. Configure

```bash
nano /opt/enovap/deploy/droplet/.env
```

Set `DOMAIN`, `ACME_EMAIL`, the `REACT_APP_*` values, and the Paystack, Resend and admin secrets. These are the same values you have in Netlify → Site configuration → Environment variables.

## 5. Deploy

```bash
/opt/enovap/deploy/droplet/deploy.sh
```

The first build takes 20–40 minutes. When it finishes, open `https://<DOMAIN>`. Caddy gets the certificate on the first request after DNS resolves to the droplet.

Updates later:

```bash
/opt/enovap/deploy/droplet/deploy.sh             # pull dev, rebuild, go live
/opt/enovap/deploy/droplet/deploy.sh --rollback  # back to the previous build
```

## 6. Point external services at the new server

- **Deriv OAuth:** app ID `106913` is hard-coded in `packages/shared/src/utils/config/config.ts`. If you keep `evpnova.com`, nothing changes. If you use a new domain, add it as the redirect URL in your Deriv app settings at api.deriv.com.
- **Paystack webhook:** the path is unchanged (`https://<DOMAIN>/.netlify/functions/paystack-webhook`). Update it in Paystack only if the domain changes.
- **GitHub Actions:** `.github/workflows/netlify-deploy.yml` still deploys to Netlify on every push to `dev`. Disable it after cutover.

## 7. Move existing purchases off Netlify Blobs (before cutover)

Past purchases (entitlements) live in Netlify's `payments` blob store. Copy them over, or buyers will lose access to their bots. From a machine that has the Netlify CLI logged in and linked to the site:

```bash
mkdir -p blobs-export && cd blobs-export
for store in payments events; do
  netlify blobs:list "$store" --json | jq -r '.blobs[].key' | while read -r key; do
    mkdir -p "$store/$(dirname "$key")"
    netlify blobs:get "$store" "$key" > "$store/$key"
  done
done
scp -r payments events root@<droplet-ip>:/opt/enovap/deploy/droplet/data/blobs/
ssh root@<droplet-ip> chown -R 1000:1000 /opt/enovap/deploy/droplet/data
```

Check the CLI output format with `netlify blobs:list payments --json` first; it differs between CLI versions.

## Operations

| Task | Command (from `/opt/enovap/deploy/droplet`) |
| ---- | ---- |
| Status | `docker compose ps` |
| Logs | `docker compose logs -f api` / `docker compose logs -f caddy` |
| Restart after `.env` change (secrets only) | `docker compose up -d` |
| Change a `REACT_APP_*` value | `./deploy.sh --no-pull` (they're baked into the bundle) |
| Backup data | `tar czf blobs-$(date +%F).tgz data/blobs` (or enable droplet backups) |

## Files

| File | Purpose |
| ---- | ---- |
| `setup.sh` | One-time droplet bootstrap |
| `deploy.sh` | Build the frontend in a `node:18` container, publish a release, start services |
| `docker-compose.yml` | `api` + `caddy` services |
| `Caddyfile` | HTTPS, redirects, headers, SPA fallback, function proxy |
| `server/` | Function runner + filesystem Blobs shim + its Dockerfile |
| `.env.example` | All configuration; copy to `.env` (never commit it) |
