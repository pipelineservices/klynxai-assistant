#!/bin/bash
# Diagnostic script for incidents UI issue
# Run this on your AWS Lightsail server

echo "=== INCIDENTS UI DIAGNOSTIC SCRIPT ==="
echo ""

echo "1. Current working directory:"
pwd
echo ""

echo "2. Chat UI directory git status:"
cd /opt/klynxaiagent/chat_ui 2>/dev/null || cd ~/klynxaiagent/chat_ui 2>/dev/null || echo "ERROR: Cannot find chat_ui directory"
pwd
echo ""

echo "3. Current git branch and commit:"
git branch --show-current
git log --oneline -1
echo ""

echo "4. Check if CSS import exists in page.tsx:"
grep -n "import.*incidents.css" app/incidents/page.tsx
if [ $? -eq 0 ]; then
    echo "✓ CSS import found"
else
    echo "✗ CSS import MISSING - this is the problem!"
fi
echo ""

echo "5. Check if incidents.css file exists:"
ls -lh app/incidents/incidents.css
echo ""

echo "6. Check if globals.css exists:"
ls -lh app/globals.css
echo ""

echo "7. Check .next build directory:"
ls -lh .next/ 2>/dev/null | head -10
echo ""

echo "8. Check when .next was last built:"
stat .next/ 2>/dev/null | grep -i "modify"
echo ""

echo "9. Check running services:"
systemctl status klynx-chat-ui --no-pager | head -15
echo ""

echo "10. Check which port the service is using:"
netstat -tulpn 2>/dev/null | grep -E '(3000|3001|3002)' | head -5
echo ""

echo "11. Check nginx configuration for klynxai.com:"
cat /etc/nginx/sites-enabled/* 2>/dev/null | grep -A 10 "klynxai.com"
echo ""

echo "12. Test localhost:3000/incidents response:"
curl -I http://localhost:3000/incidents 2>/dev/null | head -10
echo ""

echo "13. Check if HTML includes CSS link tags:"
curl -s http://localhost:3000/incidents 2>/dev/null | grep -i "stylesheet\|\.css" | head -5
echo ""

echo "14. Check if static assets exist in .next:"
find .next/static -name "*.css" 2>/dev/null | head -10
echo ""

echo "=== END DIAGNOSTIC ==="
echo ""
echo "Please copy ALL the output above and share it."
