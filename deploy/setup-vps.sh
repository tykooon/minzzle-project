#!/usr/bin/env bash
# One-time VPS bootstrap for minzzle.com
# Run as root (or with sudo) on a fresh Ubuntu 24 LTS machine:
#   bash setup-vps.sh
set -euo pipefail

echo "==> Configuring firewall..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

echo "==> Installing Docker..."
apt-get update -qq
apt-get install -y docker.io docker-compose-plugin
systemctl enable --now docker
# Allow ubuntu user to run docker without sudo
usermod -aG docker ubuntu

echo "==> Installing Nginx + Certbot..."
apt-get install -y nginx certbot python3-certbot-nginx

echo "==> Creating deployment directories..."
mkdir -p /var/www/minzzle/web
chown -R ubuntu:ubuntu /var/www/minzzle

echo "==> Installing Nginx site config..."
# Assumes nginx.conf was copied to /tmp/nginx.conf beforehand
cp /tmp/nginx.conf /etc/nginx/sites-available/minzzle.com
ln -sf /etc/nginx/sites-available/minzzle.com /etc/nginx/sites-enabled/minzzle.com
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> Creating docker-compose working directory..."
mkdir -p /home/ubuntu/minzzle
# Copy docker-compose.yml and create a .env stub
cp /tmp/docker-compose.yml /home/ubuntu/minzzle/docker-compose.yml
cat > /home/ubuntu/minzzle/.env <<'EOF'
GITHUB_REPO_OWNER=REPLACE_ME
# Future secrets go here (DB passwords, OAuth secrets, etc.)
EOF
chown -R ubuntu:ubuntu /home/ubuntu/minzzle

echo ""
echo "==> Setup complete. Next steps:"
echo "    1. Edit /home/ubuntu/minzzle/.env — set GITHUB_REPO_OWNER"
echo "    2. Run: certbot --nginx -d minzzle.com -d www.minzzle.com"
echo "    3. Add VPS_SSH_KEY, VPS_HOST, VPS_USER to GitHub repo Secrets"
echo "    4. Push to main — GitHub Actions will deploy automatically"
