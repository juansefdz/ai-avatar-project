#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# setup-pi.sh — AI Avatar Agent setup for Raspberry Pi 5
# Tested on: Raspberry Pi OS Bookworm (64-bit)
# Usage: chmod +x setup-pi.sh && sudo ./setup-pi.sh
# ──────────────────────────────────────────────────────────────────────────────

set -e

REPO_DIR="/home/pi/ai-avatar"
APP_USER="pi"
NODE_VERSION="22"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  AI Avatar Agent — Raspberry Pi Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. Update system ──────────────────────────────────────
echo "[1/7] Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

# ── 2. Install Node.js via NodeSource ─────────────────────
echo "[2/7] Installing Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

echo "  Node: $(node -v)  |  npm: $(npm -v)"

# ── 3. Install Chromium (kiosk browser) ───────────────────
echo "[3/7] Installing Chromium..."
apt-get install -y chromium-browser unclutter

# ── 4. Clone / update repo ────────────────────────────────
echo "[4/7] Setting up project directory..."
if [ -d "$REPO_DIR/.git" ]; then
  echo "  Repo exists — pulling latest..."
  sudo -u "$APP_USER" git -C "$REPO_DIR" pull
else
  echo "  Cloning repo..."
  # Replace the URL below with your actual repo URL
  sudo -u "$APP_USER" git clone https://github.com/YOUR_USER/ai-avatar-project.git "$REPO_DIR"
fi

# ── 5. Install deps & build ───────────────────────────────
echo "[5/7] Installing npm dependencies and building..."
cd "$REPO_DIR"

# Copy .env if it doesn't exist
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo ""
  echo "  ⚠️  Edit $REPO_DIR/.env.local and set NEXT_PUBLIC_HEYGEN_TOKEN before starting."
  echo ""
fi

sudo -u "$APP_USER" npm ci --prefer-offline
sudo -u "$APP_USER" npm run build

# ── 6. Install systemd services ───────────────────────────
echo "[6/7] Installing systemd services..."

# Next.js server service
cp "$REPO_DIR/deploy/avatar-next.service" /etc/systemd/system/avatar-next.service
# Kiosk launcher service
cp "$REPO_DIR/deploy/avatar-kiosk.service" /etc/systemd/system/avatar-kiosk.service

systemctl daemon-reload
systemctl enable avatar-next.service
systemctl enable avatar-kiosk.service

# ── 7. Disable screen blanking ────────────────────────────
echo "[7/7] Disabling screen blanking for kiosk mode..."
AUTOSTART_FILE="/etc/xdg/lxsession/LXDE-pi/autostart"
if ! grep -q "xset s off" "$AUTOSTART_FILE" 2>/dev/null; then
  cat >> "$AUTOSTART_FILE" << 'EOF'
@xset s off
@xset -dpms
@xset s noblank
EOF
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅  Setup complete!"
echo ""
echo "  Next steps:"
echo "    1. Edit /home/pi/ai-avatar/.env.local"
echo "       → Set NEXT_PUBLIC_HEYGEN_TOKEN=your_token"
echo "    2. Reboot: sudo reboot"
echo "    3. The kiosk will start automatically on boot."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
