# Minzzle Project — Dev & Deploy Guide

## Local Development

### Prerequisites
- .NET 9 SDK
- Node.js 20+, npm
- Visual Studio 2022 / Rider (for backend)
- VSCode + Claude Code (for frontend)

### Ports
| Service | URL |
|---|---|
| React frontend (Vite) | http://localhost:8080 |
| ASP.NET API (direct) | http://localhost:5129 |
| API via Vite proxy | http://localhost:8080/api/ |

### Starting the stack

**Backend** — open `server/src/GamesHub.Server` in Visual Studio, select the `http` launch profile, press F5.
Or from terminal:
```bash
cd server/src/GamesHub.Server
dotnet run
```

**Frontend** — from VSCode terminal:
```bash
cd web
npm run dev
```

Open http://localhost:8080.

Vite automatically proxies `/api/*` → `http://localhost:5129` — no CORS issues, no extra config.

### Notes
- No Docker needed locally — Docker is production-only.
- VS (C#) and VSCode (React) can run in parallel with no conflicts.
- `appsettings.json` already allows `localhost:8080` in CORS.
- `appsettings.Production.json` is used inside the Docker container on the VPS.

---

## Production Infrastructure

### VPS
- Ubuntu 24 LTS, domain: minzzle.com
- Docker Compose runs the ASP.NET container
- Nginx serves the React SPA and proxies `/api/` to the container

### Key paths on VPS
| Path | Purpose |
|---|---|
| `/var/www/minzzle/web/` | React static files |
| `~/minzzle/docker-compose.yml` | Docker Compose config |
| `~/minzzle/.env` | Runtime env vars (GITHUB_REPO_OWNER) |
| `/etc/nginx/sites-available/minzzle.com` | Nginx config |

### Docker
- Image: `ghcr.io/tykooon/minzzle-server:latest`
- Container name: `minzzle-minzzle-server-1`
- Port: `127.0.0.1:5129:5129` (only accessible locally on VPS)

### Useful VPS commands
```bash
# Check container status
docker ps

# View server logs
docker logs minzzle-minzzle-server-1

# Restart server manually
cd ~/minzzle && docker compose up -d

# Test API
curl http://localhost:5129/api/games

# Reload Nginx
sudo systemctl reload nginx
```

---

## CI/CD Pipeline (GitHub Actions)

Triggered on every push to `main`.

### Steps
1. Build Docker image from `server/` → push to `ghcr.io/tykooon/minzzle-server`
2. Build React frontend: `npm ci && npm run build`
3. rsync `web/dist/` → VPS `/var/www/minzzle/web/`
4. SSH to VPS: `docker compose pull && docker compose up -d`

### Required GitHub Secrets
| Secret | Value |
|---|---|
| `VPS_HOST` | VPS public IP address |
| `VPS_USER` | SSH username (e.g. `alex`) |
| `VPS_SSH_KEY` | Full private key content (no passphrase) |

Set at: **GitHub repo → Settings → Secrets and variables → Actions**

### SSH key setup (one-time)
```powershell
# Generate key (Windows PowerShell, no passphrase)
ssh-keygen -t ed25519 -C "github-deploy-minzzle" -f "$env:USERPROFILE\.ssh\minzzle_deploy"

# Copy public key to VPS
Get-Content "$env:USERPROFILE\.ssh\minzzle_deploy.pub"
# → paste into VPS: echo "..." >> ~/.ssh/authorized_keys

# Get private key for GitHub secret
Get-Content "$env:USERPROFILE\.ssh\minzzle_deploy"
# → paste full content (including BEGIN/END lines) into VPS_SSH_KEY secret
```

---

## SSL Setup (when DNS is ready)

1. Point `minzzle.com` A record to VPS IP in DNS provider
2. Wait for DNS propagation, then on VPS:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d minzzle.com -d www.minzzle.com
```
Certbot updates Nginx config automatically and sets up auto-renewal.
