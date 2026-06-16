# Handoff — User Accounts & Social Login

Branch: **`feature/user-accounts-social-login`**
Status: **code complete, builds clean, committed.** Not yet deployed. Full OAuth round-trip not yet tested (needs real provider credentials).

This file is a continuation checklist so you can resume from another device. Delete it once the feature is live.

---

## What's already done (no action needed)

- **Data preserved:** all live data exported to `server/src/GamesHub.Server/Data/Seed/levels.snapshot.json` — 15 levels (incl. 6 admin-created Fives levels) + 8 solutions. Seeded at startup by `DbSeeder` (replaces EF `HasData`).
- **DB:** PostgreSQL in prod, SQLite in local dev (chosen by `Database:Provider` config). Postgres migration generated.
- **Auth:** cookie session + Google/Microsoft/Facebook OAuth (`server/.../Api/Auth/`). Endpoints `/api/auth/login/{provider}`, `/logout`, `/me`.
- **Authorization:** progress endpoints require login; level create/update/delete require the `Admin` policy (email allowlist `Auth:AdminEmails`).
- **Per-user progress:** `ProgressService` is DB-backed; frontend saves on solve and shows "✓ Solved" badges.
- **Frontend:** `AuthContext`/`useAuth`, `UserMenu`, `ProtectedRoute` on admin routes. `tsc` + `vite build` pass.
- **Deploy:** `docker-compose.yml` has a Postgres service + named volume; CI no longer rsyncs `minzzle.db` (that would have wiped users); CI templates `~/minzzle/.env` from GitHub secrets.

---

## TODO to go live

### 1. Register OAuth apps (do Facebook first — it needs review)
For each provider set redirect URIs (prod **and** localhost for dev):

- **Google** (Google Cloud Console → Credentials → OAuth client):
  - `https://minzzle.com/api/auth/signin-google`
  - `http://localhost:8080/api/auth/signin-google`
- **Microsoft** (Azure → App registrations → Authentication → Web redirect URIs):
  - `https://minzzle.com/api/auth/signin-microsoft`
  - `http://localhost:8080/api/auth/signin-microsoft`
- **Facebook** (Meta for Developers → app → Facebook Login → Settings → Valid OAuth Redirect URIs):
  - `https://minzzle.com/api/auth/signin-facebook`
  - `http://localhost:8080/api/auth/signin-facebook`
  - ⚠️ Public login requires Facebook **app review / business verification** — start this early.

### 2. Add GitHub repo Secrets (Settings → Secrets and variables → Actions)
- `DB_PASSWORD` — strong random password
- `OAUTH_GOOGLE_CLIENT_ID`, `OAUTH_GOOGLE_CLIENT_SECRET`
- `OAUTH_MICROSOFT_CLIENT_ID`, `OAUTH_MICROSOFT_CLIENT_SECRET`
- `OAUTH_FACEBOOK_APP_ID`, `OAUTH_FACEBOOK_APP_SECRET`
- `ADMIN_EMAIL` — the email that should get admin rights (must match the email your OAuth login returns)
- (existing deploy secrets stay: `VPS_SSH_KEY`, `VPS_HOST`, `VPS_USER`)

### 3. Local OAuth test (optional but recommended before deploy)
```bash
cd server/src/GamesHub.Server
dotnet user-secrets set "Authentication:Google:ClientId" "<id>"
dotnet user-secrets set "Authentication:Google:ClientSecret" "<secret>"
# repeat for Microsoft (ClientId/ClientSecret) and Facebook (AppId/AppSecret)
dotnet user-secrets set "Auth:AdminEmails:0" "<your-email>"
```
Then run `deploy\dev.bat`, open http://localhost:8080, click **Sign in → Google**, confirm you land back logged in, solve a Fives level, reload the levels page and confirm the "✓ Solved" badge. As the admin email, `/admin/levels` should load; as a different account it should show "Access denied".

> Dev OAuth note: the callback goes through the Vite proxy (`localhost:8080` → backend). If the provider rejects the redirect URI or the host looks wrong, the cause is almost always a mismatched redirect URI or the Vite proxy `Host` header — verify the exact `localhost:8080/api/auth/signin-*` URI is registered.

### 4. First production deploy
- Ensure the VPS is on the migrated host (see the VPS memory) and `~/minzzle/` exists.
- Merge/push `feature/user-accounts-social-login` → `main`. CI will: build the image, build the web bundle, write `~/minzzle/.env` from secrets, sync compose, and `docker compose up -d` (starts Postgres + server).
- On first boot the server runs EF migrations against Postgres and seeds the 15 levels from the embedded snapshot.

### 5. Verify in production
- `docker compose ps` — postgres healthy, server up.
- Open https://minzzle.com — all levels present, solutions replay.
- Log in with each working provider; confirm avatar shows and progress saves.
- **Data-persistence regression test (the whole point):** create a test account / solve a level, push a trivial commit to redeploy, confirm the account + progress **survive** the redeploy (they live in the `postgres_data` volume).

---

## Important ongoing note
Prod-authored levels now live in the Postgres volume, **not git**. Committing `minzzle.db` no longer changes prod. To capture prod level edits back into the repo: run `dotnet run -- export-seed` (refreshes `levels.snapshot.json`) and commit. Back up prod with `pg_dump`. The old committed `minzzle.db` is a legacy backstop only.

## Key files
- Backend auth: `server/src/GamesHub.Server/Api/Auth/`, wiring in `Program.cs`
- Seeder/snapshot: `server/src/GamesHub.Server/Data/Seed/`
- Frontend: `web/src/contexts/AuthContext.tsx`, `web/src/components/{UserMenu,ProtectedRoute}.tsx`
- Deploy: `deploy/docker-compose.yml`, `.github/workflows/deploy.yml`, `deploy/setup-vps.sh`
- Plan: `~/.claude/plans/ok-let-s-think-about-adaptive-matsumoto.md` (local to the original device)
