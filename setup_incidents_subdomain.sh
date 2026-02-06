#!/bin/bash
# Setup incidents subdomain configuration

echo "=== SETTING UP INCIDENTS SUBDOMAIN ==="
echo ""

# 1. Create nginx config for incidents.klynxai.com
echo "Creating nginx configuration for incidents.klynxai.com..."
sudo tee /etc/nginx/sites-available/incidents.klynxai.com > /dev/null <<'EOF'
server {
    listen 80;
    server_name incidents.klynxai.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 2. Enable the site
echo "Enabling incidents site..."
sudo ln -sf /etc/nginx/sites-available/incidents.klynxai.com /etc/nginx/sites-enabled/

# 3. Remove /incidents location from klynxai.com config
echo "Updating klynxai.com nginx config..."
sudo sed -i '/location \/incidents {/,/}/d' /etc/nginx/sites-enabled/klynxai.com

# 4. Test nginx config
echo "Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✓ Nginx config is valid"

    # 5. Reload nginx
    echo "Reloading nginx..."
    sudo systemctl reload nginx

    echo ""
    echo "=== NEXT STEPS ==="
    echo ""
    echo "1. Add DNS A record for incidents.klynxai.com pointing to your server IP"
    echo "2. Run certbot to get SSL certificate:"
    echo "   sudo certbot --nginx -d incidents.klynxai.com"
    echo ""
    echo "3. Update any links from klynxai.com/incidents to incidents.klynxai.com"
    echo ""
    echo "The incidents page will be available at:"
    echo "  - http://incidents.klynxai.com (after DNS is set up)"
    echo "  - https://incidents.klynxai.com (after SSL setup)"
else
    echo "✗ Nginx config test failed. Please check the errors above."
fi

echo ""
echo "=== SETUP COMPLETE ==="
