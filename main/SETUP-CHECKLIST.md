# Finish setting up SB Aware

The wizard saved your public settings. It did not create accounts, deploy your website, or test a live sign-in.

## 1. Save your changes to GitHub

In your editor's Source Control panel, review the changed files, enter "Configure my website", choose Commit, then Sync Changes / Push. If prompted, sign in to GitHub in its own browser window.
Confirm the changes appear in https://github.com/P-E-D-R-O-Gonzalez/SBaware on the **main** branch. This must be your own copy of the template.

## 2. Connect Cloudflare (automatic publishing)

Open https://dash.cloudflare.com/ → Workers & Pages → Create application → connect your GitHub repository. Choose Workers and **P-E-D-R-O-Gonzalez/SBaware**. Approve GitHub access to this repository when asked.
Use these exact settings:

- Worker/project name: sbaware
- Production branch: main
- Root directory: main
- Build command: npm run build
- Deploy command: npx wrangler deploy

For an existing Worker, connect the repository under Settings → Builds instead. Make sure changes in main/src/data trigger builds. Cloudflare manages its build credential; do not copy an API token into this wizard or your repository.
Deploy and wait for success. The public site should load before CMS login is configured.
Your expected site address is https://sb.ieaware.org. Compare it with the address Cloudflare shows. For a custom domain, connect it under Settings → Domains & Routes first. If the address differs, rerun npm run setup with the actual address, commit/push, and wait for another deployment before continuing.

## 3. Create your GitHub sign-in app

Open https://github.com/settings/applications/new (a GitHub **OAuth App**, not a GitHub App) and copy:

- Application name: SB Aware CMS
- Homepage URL: https://sb.ieaware.org
- Authorization callback URL: https://sb.ieaware.org/api/callback

Leave device flow disabled. If an "Expire user access tokens" option appears, disable it: this template does not refresh expiring tokens. Register the application.
Keep this page open. Generate a client secret only when ready to copy it directly into Cloudflare below.

## 4. Add credentials directly in Cloudflare

Open Workers & Pages → **sbaware** → Settings → **Variables and Secrets** (runtime settings, not the Builds variables).
Add both values using type **Secret**:

- GITHUB_CLIENT_ID: copy the Client ID from your GitHub OAuth App.
- GITHUB_CLIENT_SECRET: copy the generated client secret from that same app.

Save and deploy the change. Never paste secrets into chat, this checklist, CMS fields, source files, or the wizard. No personal access token is needed. If you expose a secret, revoke it in GitHub, generate a replacement, and update Cloudflare.
SITE_ORIGIN and GITHUB_REPO are already saved in wrangler.jsonc; do not add a different value in the dashboard.

## 5. Check editing and automatic publishing

Open https://sb.ieaware.org/admin/ and sign in with GitHub. The account needs write access to **P-E-D-R-O-Gonzalez/SBaware**. GitHub asks for the repo scope used by Decap; review that authorization. Organization-owned repositories may require an administrator's OAuth approval.
Edit Pages → Branding, publish a small change, and check that a commit appears on **main**, a Cloudflare build runs, and the public page updates. Protected branches that require pull requests can prevent direct publishing; use a branch where your editors are permitted to publish.
Then customize Home page links (replace example.com placeholders), Branding, Weather, Local Groups, and Local Media in the CMS.

## If something goes wrong

- "CMS login is not configured": check both runtime secrets and deploy again.
- "Invalid authentication origin" or callback errors: the website address, SITE_ORIGIN, CMS base_url, and OAuth callback must use the same HTTPS domain. Rerun the wizard after a domain change, then update the OAuth App callback.
- Repository access denied: check the repository spelling, editor write permission, and organization approval.
- Saving works but the website is unchanged: check the Cloudflare build log, production branch, and root directory above.

You can rerun npm run setup. It preserves content and creates a local backup before replacing settings. Backups live in .setup-backups/ and are excluded from Git.

References: [Decap GitHub backend](https://decapcms.org/docs/github-backend/), [GitHub OAuth Apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app), [Cloudflare Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), [Cloudflare secrets](https://developers.cloudflare.com/workers/configuration/secrets/).
