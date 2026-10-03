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
- **Netlify:** the GitHub Action that deployed to Netlify has been removed, but Netlify's own Git integration still builds on every push. Stop it under Netlify → Site configuration → Build & deploy → **Stop builds**, or delete the Netlify site.

## Automatic deploys (GitHub Actions)

`.github/workflows/deploy-droplet.yml` SSHes into the droplet and runs `deploy.sh` on every push to `dev`, including merged PRs. `.github/workflows/build-check.yml` builds every PR into `dev` first, so a broken PR shows a red check before you merge it.

Set it up once with a deploy key that can **only** run `deploy.sh`:

```bash
# On your computer
ssh-keygen -t ed25519 -f enovap_deploy -N "" -C github-deploy
ssh-keyscan -t ed25519 67.207.89.250        # copy the output

# On the droplet, append ONE line to /root/.ssh/authorized_keys
# (paste the contents of enovap_deploy.pub after the options):
command="/opt/enovap/deploy/droplet/deploy.sh",restrict ssh-ed25519 AAAA... github-deploy
```

The `command=...,restrict` prefix means a stolen key could only trigger a redeploy. It can't open a shell or forward ports.

Then in GitHub → repo → Settings → Secrets and variables → Actions, add:

| Secret | Value |
| ---- | ---- |
| `DROPLET_HOST` | `67.207.89.250` |
| `DROPLET_SSH_KEY` | contents of `enovap_deploy` (the private key) |
| `DROPLET_KNOWN_HOSTS` | the `ssh-keyscan` output |

Delete the local `enovap_deploy` files once the secret is saved. To deploy by hand from GitHub, use Actions → **Deploy to droplet** → Run workflow.

## Weekly security review

`.github/workflows/weekly-vulnerability-fixes.yml` runs every Monday at 06:00 UTC, and you can also start it from the Actions tab. It reads npm audit and the Dependabot alerts, sorts each issue by whether it can affect the live site, fixes those that can, and opens **one PR against `dev`** that lists what it fixed, what it left alone and why, and what to do with each open Dependabot PR. Nothing merges automatically. Merging the PR deploys it.

The PR is committed as `Elvis.p <presslyelviss@gmail.com>` and opened with your token, so it appears as yours. Required secrets:

| Secret | Value |
| ---- | ---- |
| `ANTHROPIC_API_KEY` | from console.anthropic.com (usage is billed) |
| `AUTOMATION_PAT` | GitHub → Settings → Developer settings → Fine-grained tokens → new token for **pressly29/ENovaP** only, with Contents: read/write, Pull requests: read/write, Issues: read/write, Dependabot alerts: read |

GitHub doesn't let you approve your own PR. If branch protection on `dev` requires approvals, merge as admin or turn that requirement off.

## IPv6 (optional)

The droplet also has IPv6 `2604:a880:400:d1:0:5:1857:b001`. To serve IPv6 visitors directly, add `AAAA` records for `@` and `www` with that address. Docker and Caddy already listen on IPv6, and `ufw` applies the same rules to it. Afterwards, check from any IPv6-capable network with `curl -6 -I https://evpnova.com`. If that fails, delete the AAAA records; IPv4 keeps working regardless.

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
