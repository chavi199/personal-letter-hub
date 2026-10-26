# Deploy to Render — step-by-step

This guide shows minimal steps to push this project to GitHub and deploy to Render as a Static Site.

1) Verify build locally

```bash
# install deps
npm ci
# build
npm run build
# preview locally (optional)
npm run preview
```

2) Initialize git and create a GitHub repo (choose one)

Option A — using `gh` (GitHub CLI):

```bash
git init
git add .
git commit -m "Initial commit"
# create repo (private by default); replace NAME if desired
gh repo create personal-letter-hub --public --source=. --remote=origin --push
```

Option B — using GitHub web UI:
- Create a new repo and follow the instructions to push an existing repo from command line.

3) Connect repo to Render

- Go to https://render.com → New → Static Site
- Connect your GitHub account and choose the repository `personal-letter-hub`.
- Branch: `main` (or the branch you pushed)
- Build Command: `npm ci && npm run build`
- Publish directory: `dist`
- Environment: Static
- Click Create and wait for the first build.

4) Environment variables (if used)

- If your app uses Supabase or other keys, add them in the Render dashboard under the service Settings → Environment → Environment Variables. Do NOT commit secrets to the repo.

5) Optional: automatic deploy on push

- Render will auto-deploy on push when connected. Push new commits to `main` to trigger deploys.

6) If you prefer Render YAML (CI-as-code)

- `render.yaml` is included in the repo with a basic static config. You may edit `repo`/`branch` values or remove them and configure via the Render UI.

Troubleshooting
- If build fails, run `npm run build` locally to inspect errors.
- Ensure `dist` exists after a successful build.
