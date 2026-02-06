#!/bin/bash
# Fix 502 Bad Gateway error

echo "=== TROUBLESHOOTING 502 BAD GATEWAY ==="
echo ""

echo "1. Check if klynx-chat-ui service is running:"
systemctl status klynx-chat-ui --no-pager | head -15
echo ""

echo "2. Check recent service logs for errors:"
journalctl -u klynx-chat-ui -n 30 --no-pager
echo ""

echo "3. Test if port 3000 is listening:"
netstat -tulpn 2>/dev/null | grep 3000 || ss -tulpn | grep 3000
echo ""

echo "4. Test localhost:3000 directly:"
curl -I http://localhost:3000/incidents 2>&1 | head -10
echo ""

echo "5. Test localhost:3000/_next/ path:"
curl -I http://localhost:3000/_next/static/css/61886a162ae9a7c7.css 2>&1 | head -10
echo ""

echo "6. Check nginx error logs:"
tail -20 /var/log/nginx/error.log
echo ""

echo "=== END DIAGNOSTIC ==="
