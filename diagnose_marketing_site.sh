#!/bin/bash
# Diagnostic script for marketing site

echo "=== MARKETING SITE DIAGNOSTIC ==="
echo ""

echo "1. Check klynxai-site service status:"
systemctl status klynxai-site --no-pager 2>/dev/null || echo "Service not found, checking for Next.js on port 3201"
echo ""

echo "2. Check what's running on port 3201:"
netstat -tulpn 2>/dev/null | grep 3201 || ss -tulpn | grep 3201
echo ""

echo "3. Test localhost:3201:"
curl -I http://localhost:3201 2>&1 | head -10
echo ""

echo "4. Check if HTML includes CSS:"
curl -s http://localhost:3201 2>/dev/null | grep -i "stylesheet\|\.css" | head -5
echo ""

echo "5. Check marketing site directory:"
ls -la /opt/klynxaiagent/klynxai_site/ 2>/dev/null || ls -la ~/klynxaiagent/klynxai_site/ 2>/dev/null
echo ""

echo "6. Check for .next build:"
ls -la /opt/klynxaiagent/klynxai_site/.next/ 2>/dev/null | head -10
echo ""

echo "7. Check all running services:"
systemctl list-units --type=service --state=running | grep -E "(klynx|next)" || ps aux | grep -E "(next|node)" | head -10
echo ""

echo "=== END DIAGNOSTIC ==="
