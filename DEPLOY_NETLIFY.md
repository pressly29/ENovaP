Netlify deployment (GitHub Actions)

This project uses a monorepo. The GitHub Actions workflow `/.github/workflows/netlify-deploy.yml` builds the `@deriv/core` package and deploys the output folder `packages/core/dist` to Netlify.

Prerequisites

-   A Netlify site already created (or create one in the Netlify dashboard).
-   A Netlify Personal Access Token (NETLIFY_AUTH_TOKEN) with deploy permissions.
-   The Netlify Site ID (NETLIFY_SITE_ID) of the target site.
-   Add the secrets to your GitHub repository:
    -   `NETLIFY_AUTH_TOKEN`
    -   `NETLIFY_SITE_ID`

How it works

-   On push to the `dev` branch the workflow will:
    1. Checkout the code and set up Node 18.
    2. Install dependencies (`npm ci`).
    3. Bootstrap the monorepo with Lerna.
    4. Run `npm --prefix packages/core run build` (builds core into `packages/core/dist`).
    5. Deploy the dist folder to Netlify using the Netlify CLI action.

Notes & troubleshooting

-   The monorepo uses Lerna/Nx and some npm scripts rely on bash; the workflow runs on Ubuntu where the scripts are supported.
-   If build fails due to memory errors, increase `NODE_OPTIONS` in the workflow or split the build.
-   If Netlify returns a redirect/authorization error during OAuth testing, you must register the deployed URL’s callback (`https://<your-domain>/oauth/callback`) in the Deriv app configuration.

Manual deploy (local)

If you prefer to test builds locally and deploy manually with the Netlify CLI:

1. Build core locally:

```powershell
npm ci
npx lerna link
npx lerna bootstrap --hoist --strict
npm --prefix packages/core run build --
```

2. Install Netlify CLI and deploy (you will be prompted to login):

```powershell
npm i -g netlify-cli
netlify deploy --dir=packages/core/dist --prod --site=<your-site-id>
```

If you want me to wire Netlify to preview every PR instead of only `dev`, I can update the workflow accordingly.
