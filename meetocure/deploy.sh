#!/usr/bin/env bash
# Deploy MeetOCure on Ubuntu 24.04 (noble) or similar
# - Installs Node 20, MongoDB (8.0 on noble), Nginx, Python venv, Certbot
# - Builds frontend, configures Nginx, creates env files, and sets up systemd services
# Usage:
#   sudo bash deploy.sh
# Optional (for HTTPS auto-setup):
#   CERTBOT_EMAIL=you@example.com sudo bash deploy.sh

set -euo pipefail

# ====== CONFIG ======
DOMAIN="www.meetocure.com"
APEX_DOMAIN="meetocure.com"

# App paths (change if desired)
APP_ROOT="/home/ubuntu/meetocure"
FRONTEND_DIR="$APP_ROOT/frontend-ankit"
SERVER_DIR="$APP_ROOT/server"
CHATBOT_DIR="$APP_ROOT/ChatBot"
WEB_ROOT="/var/www/meetocure/dist"

NODE_SERVICE="/etc/systemd/system/meetocure-node.service"
FLASK_SERVICE="/etc/systemd/system/meetocure-flask.service"
NGINX_SITE="/etc/nginx/sites-available/meetocure"

CODENAME="$(. /etc/os-release && echo "$VERSION_CODENAME")"
export DEBIAN_FRONTEND=noninteractive

# ====== BASE PACKAGES ======
apt-get update
apt-get upgrade -y
apt-get install -y curl git nginx ufw software-properties-common python3-venv python3-pip certbot python3-certbot-nginx gnupg

# ====== NODE 20 ======
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# ====== MONGODB (8.0 on noble, 7.0 otherwise) ======
if ! command -v mongod >/dev/null 2>&1; then
  if [ "$CODENAME" = "noble" ]; then
    MONGO_VER="8.0"
  else
    MONGO_VER="7.0"
  fi

  # Clean previously broken lists
  rm -f /etc/apt/sources.list.d/mongodb-org-7.0.list /etc/apt/sources.list.d/mongodb-org-8.0.list || true

  echo "Installing MongoDB $MONGO_VER for $CODENAME..."
  curl -fsSL "https://www.mongodb.org/static/pgp/server-${MONGO_VER}.asc" | gpg --dearmor -o "/usr/share/keyrings/mongodb-server-${MONGO_VER}.gpg"
  echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-${MONGO_VER}.gpg ] https://repo.mongodb.org/apt/ubuntu ${CODENAME}/mongodb-org/${MONGO_VER} multiverse" \
    > "/etc/apt/sources.list.d/mongodb-org-${MONGO_VER}.list"
  apt-get update
  apt-get install -y mongodb-org
  systemctl enable --now mongod
fi

# ====== FIREWALL ======
ufw allow OpenSSH || true
ufw allow 'Nginx Full' || true
yes | ufw enable || true

# ====== DIRECTORIES ======
mkdir -p "$APP_ROOT" "$WEB_ROOT"
chown -R www-data:www-data /var/www/meetocure || true

# ====== FRONTEND BUILD ======
if [ -d "$FRONTEND_DIR" ]; then
  echo "Building frontend..."
  cd "$FRONTEND_DIR"
  npm ci
  npm run build
  rm -rf "$WEB_ROOT"
  mkdir -p "$WEB_ROOT"
  cp -r dist/* "$WEB_ROOT/"
  chown -R www-data:www-data /var/www/meetocure
else
  echo "WARNING: Frontend directory not found at $FRONTEND_DIR. Skipping frontend build."
fi

# ====== NGINX CONFIG ======
cat > "$NGINX_SITE" <<EOF
# Redirect apex to www
server {
  listen 80;
  server_name $APEX_DOMAIN;
  return 301 https://$DOMAIN\$request_uri;
}

server {
  listen 80;
  server_name $DOMAIN;

  root $WEB_ROOT;
  index index.html;

  # SPA routing
  location / {
    try_files \$uri /index.html;
  }

  # API -> Node
  location /api/ {
    proxy_pass http://127.0.0.1:5000/;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  # Chat -> Flask
  location /api/chat {
    proxy_pass http://127.0.0.1:5001/chat;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  gzip on;
  gzip_types text/plain text/css application/json application/javascript application/xml+rss application/xml image/svg+xml;
  gzip_min_length 256;
}
EOF

ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/meetocure
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# ====== BACKEND (NODE) ======
if [ -d "$SERVER_DIR" ]; then
  echo "Preparing Node backend..."
  cd "$SERVER_DIR"
  npm ci
  # Create server/.env with defaults if missing
  if [ ! -f "$SERVER_DIR/.env" ]; then
    echo "Creating $SERVER_DIR/.env with defaults..."
    JWT_SECRET_GEN=$(openssl rand -hex 32)
    cat > "$SERVER_DIR/.env" <<EOF
NODE_ENV=production
MONGO_URI=mongodb://127.0.0.1:27017/meetocure
JWT_SECRET=$JWT_SECRET_GEN
FRONTEND_URL=https://$DOMAIN
CHATBOT_BASE_URL=http://127.0.0.1:5001
# Optional Twilio (uncomment to enable SMS OTP)
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE=
EOF
    chown ubuntu:ubuntu "$SERVER_DIR/.env"
    chmod 640 "$SERVER_DIR/.env"
  fi
else
  echo "WARNING: Server directory not found at $SERVER_DIR. Skipping Node install."
fi

# ====== CHATBOT (FLASK) ======
if [ -d "$CHATBOT_DIR" ]; then
  echo "Preparing Flask ChatBot..."
  cd "$CHATBOT_DIR"
  python3 -m venv .venv
  . .venv/bin/activate
  pip install --upgrade pip
  pip install -r requirement.txt
  pip install gunicorn
  deactivate
  # Create ChatBot/.env if missing
  if [ ! -f "$CHATBOT_DIR/.env" ]; then
    echo "Creating $CHATBOT_DIR/.env ..."
    cat > "$CHATBOT_DIR/.env" <<EOF
ALLOWED_ORIGINS=https://$DOMAIN,http://localhost:5173,http://localhost:3000
# TOGETHER_API_KEY=   # Add if you want AI chat to respond
EOF
    chown ubuntu:ubuntu "$CHATBOT_DIR/.env"
    chmod 640 "$CHATBOT_DIR/.env"
  fi
else
  echo "WARNING: ChatBot directory not found at $CHATBOT_DIR. Skipping Flask setup."
fi

# ====== SYSTEMD SERVICES (run as ubuntu) ======
cat > "$NODE_SERVICE" <<EOF
[Unit]
Description=MeetOCure Node API
After=network.target

[Service]
WorkingDirectory=$SERVER_DIR
EnvironmentFile=$SERVER_DIR/.env
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
User=ubuntu
Group=ubuntu

[Install]
WantedBy=multi-user.target
EOF

cat > "$FLASK_SERVICE" <<EOF
[Unit]
Description=MeetOCure Flask ChatBot (Gunicorn)
After=network.target

[Service]
WorkingDirectory=$CHATBOT_DIR
EnvironmentFile=$CHATBOT_DIR/.env
ExecStart=$CHATBOT_DIR/.venv/bin/gunicorn -w 2 -b 127.0.0.1:5001 chatbot:app
Restart=always
RestartSec=5
User=ubuntu
Group=ubuntu

[Install]
WantedBy=multi-user.target
EOF

# Ensure project owned by ubuntu (services run as ubuntu)
chown -R ubuntu:ubuntu "$APP_ROOT" || true

systemctl daemon-reload || true
systemctl enable --now meetocure-node.service
systemctl enable --now meetocure-flask.service

# ====== CERTBOT (OPTIONAL) ======
if command -v certbot >/dev/null 2>&1; then
  if [ "${CERTBOT_EMAIL:-}" != "" ]; then
    echo "Attempting HTTPS with Certbot for $APEX_DOMAIN and $DOMAIN..."
    certbot --nginx -d "$APEX_DOMAIN" -d "$DOMAIN" -m "$CERTBOT_EMAIL" --agree-tos --redirect -n || true
    systemctl reload nginx || true
  else
    echo "INFO: To enable HTTPS automatically, export CERTBOT_EMAIL and re-run:"
    echo "  CERTBOT_EMAIL=you@example.com sudo certbot --nginx -d $APEX_DOMAIN -d $DOMAIN --agree-tos --redirect -m \$CERTBOT_EMAIL -n"
  fi
fi

echo "------------------------------------------------------------"
echo "Deployment complete."
echo "Repo: $APP_ROOT"
echo "Frontend: $FRONTEND_DIR (built to $WEB_ROOT)"
echo "Backend:  $SERVER_DIR (.env created)"
echo "ChatBot:  $CHATBOT_DIR (.env created)"
echo "DNS A records for $APEX_DOMAIN and $DOMAIN must point to this VPS."
echo "AI chat: set TOGETHER_API_KEY in $CHATBOT_DIR/.env then: sudo systemctl restart meetocure-flask.service"
echo "Services:"
echo "  systemctl status meetocure-node.service | cat"
echo "  systemctl status meetocure-flask.service | cat"
echo "Visit: http://$DOMAIN (or https:// after certs)"
