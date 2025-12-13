
#!/usr/bin/env bash
set -e

sudo apt-get update
sudo apt-get install -y python3 python3-venv python3-pip git curl

# Node
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "Base dependencies installed."
