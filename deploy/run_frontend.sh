
#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
cd frontend
npm install
npm run build
echo "Frontend built to ../frontend-build (served by backend root /)."
