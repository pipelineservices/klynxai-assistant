#!/usr/bin/env bash
set -e

APP_USER="klynxretail"
APP_DIR="/opt/klynxretail"

if ! id "$APP_USER" >/dev/null 2>&1; then
  useradd -m -s /bin/bash "$APP_USER"
fi

mkdir -p "$APP_DIR"
chown -R "$APP_USER":"$APP_USER" "$APP_DIR"

# Core venv
cd "$APP_DIR/core"
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt

# Slack venv
cd "$APP_DIR/slack"
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt

# Install systemd units
cp "$APP_DIR/deploy/klynxretail-core.service" /etc/systemd/system/klynxretail-core.service
cp "$APP_DIR/deploy/klynxretail-slack.service" /etc/systemd/system/klynxretail-slack.service

systemctl daemon-reload
systemctl enable klynxretail-core
systemctl enable klynxretail-slack
systemctl restart klynxretail-core
systemctl restart klynxretail-slack
