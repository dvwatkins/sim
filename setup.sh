#!/bin/bash
# OBLD 500 Simulation Suite - Droplet Setup
# Run as root on a fresh Ubuntu 24.04 droplet
# Usage: bash setup.sh

set -e

echo "=================================================="
echo "OBLD 500 Simulation Suite - Setup"
echo "=================================================="

# 1. System updates
echo "[1/8] Updating system packages..."
apt-get update && apt-get upgrade -y

# 2. Install Node.js 20 LTS
echo "[2/8] Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "  Node $(node -v), npm $(npm -v)"

# 3. Install nginx
echo "[3/8] Installing nginx..."
apt-get install -y nginx

# 4. Install PM2 (process manager)
echo "[4/8] Installing PM2..."
npm install -g pm2

# 5. Install certbot for SSL
echo "[5/8] Installing certbot..."
apt-get install -y certbot python3-certbot-nginx

# 6. Build the client
echo "[6/8] Building React client..."
APP_DIR="/opt/obld500-sim"
mkdir -p "$APP_DIR"
cp -r /root/sim-ldrcoach/* "$APP_DIR/"

cd "$APP_DIR/client"
npm install
npm run build
echo "  Client built to $APP_DIR/client/dist"

# 7. Install server dependencies
echo "[7/8] Installing server dependencies..."
cd "$APP_DIR/server"
npm install

# 8. Configure .env
echo "[8/8] Configuring environment..."
if [ ! -f "$APP_DIR/server/.env" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/server/.env"
    echo ""
    echo "  *** IMPORTANT: Edit /opt/obld500-sim/server/.env ***"
    echo "  *** Add your ANTHROPIC_API_KEY before starting ***"
    echo ""
fi

echo "=================================================="
echo "Setup complete. Next steps:"
echo ""
echo "1. Add your API key:"
echo "   nano /opt/obld500-sim/server/.env"
echo ""
echo "2. Configure DNS:"
echo "   Add an A record for sim.ldrcoach.com"
echo "   pointing to this droplet's IP address"
echo ""
echo "3. Set up nginx:"
echo "   cp /opt/obld500-sim/nginx/sim.ldrcoach.com.conf /etc/nginx/sites-available/"
echo "   ln -s /etc/nginx/sites-available/sim.ldrcoach.com.conf /etc/nginx/sites-enabled/"
echo "   nginx -t && systemctl reload nginx"
echo ""
echo "4. Get SSL certificate:"
echo "   certbot --nginx -d sim.ldrcoach.com"
echo ""
echo "5. Start the app:"
echo "   cd /opt/obld500-sim/server"
echo "   pm2 start index.js --name obld500-sim"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "6. Verify:"
echo "   curl http://localhost:3000"
echo "   Then visit https://sim.ldrcoach.com"
echo "=================================================="
