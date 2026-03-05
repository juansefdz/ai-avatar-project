#!/bin/bash

# Script para configurar el Modo Noctra en Raspberry Pi 5 (AVA Noctra)
# Hardware: Pantalla táctil de 7"
# Software: Noctra Agent Interface (Next.js) & Brain API (FastAPI) a 60fps usando Wayland.

echo "--- Iniciando configuración de Modo Noctra ---"

# 1. Actualizar sistema e instalar dependencias necesarias
sudo apt update && sudo apt install -y wayfire xwayland chromium sed

# 2. Configurar auto-login en la terminal (si no está activo)
sudo raspi-config nonint do_boot_behaviour B4

# 3. Crear el script de inicio del navegador y backend
cat <<EOF > ~/launch_noctra.sh
#!/bin/bash
# 1. Iniciar el Brain API (FastAPI) en background
cd /home/raspberry/ai-avatar-project/brain
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 &

# 2. Iniciar Next.js en background
cd /home/raspberry/ai-avatar-project
/home/raspberry/.npm-global/bin/pm2 start npm --name "avatar-next" -- start &

# 3. Esperar a que Next.js y el API estén listos
sleep 15


# 3. Lanzar Chromium en modo Noctra usando Wayland a 60fps
# Optimizaciones para aceleración por hardware en Raspi 5
export DISPLAY=:0
export WAYLAND_DISPLAY=wayland-1
chromium --enable-features=UseOzonePlatform \\
  --ozone-platform=wayland \\
  --ignore-gpu-blocklist \\
  --enable-gpu-rasterization \\
  --enable-zero-copy \\
  --kiosk \\
  --noerrdialogs \\
  --disable-infobars \\
  --app=http://localhost:3000
EOF

chmod +x ~/launch_noctra.sh

# 4. Configurar Wayfire (El gestor de ventanas de la Pi 5)
WAYFIRE_CONF=~/.config/wayfire.ini
mkdir -p ~/.config

if [ ! -f "\$WAYFIRE_CONF" ]; then
    cp /etc/wayfire.ini "\$WAYFIRE_CONF" 2>/dev/null || touch "\$WAYFIRE_CONF"
fi

# Añadir el comando de inicio a la sección [autostart]
if ! grep -q "noctra_ui = ~/launch_noctra.sh" "\$WAYFIRE_CONF"; then
    echo -e "\n[autostart]\nnoctra_ui = ~/launch_noctra.sh" >> "\$WAYFIRE_CONF"
fi

echo "--- Configuración de Noctra a 60fps Wayland completada ---"
echo "Reinicia la Raspberry Pi para entrar en modo AVA noctra."
