# 🐉 Dragon AI Governance Playground

An interactive demo environment where anyone can test Dragon's AI governance system in real-time. Experience how Dragon catches dangerous decisions before they happen.

## 🎯 Purpose

The Dragon Playground is designed to:

1. **Showcase Dragon's Capabilities**: Let prospects and customers experience Dragon's decision governance firsthand
2. **Generate Viral Attention**: Create shareable, memorable experiences that spread organically
3. **Educate Users**: Teach best practices in AI governance and decision-making
4. **Generate Qualified Leads**: Convert impressed users into sales conversations

## ✨ Features

### 🎮 Interactive Scenarios

6 pre-built scenarios demonstrating different risk levels:

- **Production Deployment** (HIGH RISK) - Deploy with database migrations
- **Pricing Change** (HIGH RISK) - Modify customer pricing
- **IAM Permission Grant** (CRITICAL) - Grant dangerous AWS permissions
- **Code Formatting** (LOW RISK) - Safe code style changes
- **Database Delete** (CRITICAL) - Dangerous database operations with typos
- **Test Suite Run** (LOW RISK) - Run integration tests

### 📊 Real-Time Visualization

- **Animated Analysis Timeline**: Watch Dragon process your decision in real-time
- **Risk Score Gauge**: Visual representation of risk level (0-100)
- **Risk Breakdown**: Individual metrics (blast radius, data risk, rollback complexity, reversibility)
- **Policy Triggers**: Show which policies caught the risky behavior
- **Decision Gate**: Clear approval requirements or auto-approval

### 🎨 Beautiful UI

- Dark theme with glass-morphism design
- Smooth animations and transitions
- Responsive design for mobile and desktop
- Inspired by modern SaaS demo playgrounds (Stripe, Twilio, Auth0)

### 🔗 Social Sharing

- Generate shareable result cards
- Copy-to-clipboard for easy sharing
- Track viral coefficient and engagement

## 📁 Project Structure

```
dragon_playground/
├── frontend/
│   ├── app/
│   │   └── playground/
│   │       └── page.tsx              # Main playground page
│   ├── components/
│   │   ├── ScenarioSelector.tsx      # Scenario selection grid
│   │   ├── DecisionForm.tsx          # Decision input form
│   │   └── RiskVisualization.tsx     # Results visualization
│   └── styles/
│       └── playground.css            # All styling
│
├── backend/
│   ├── api/
│   │   └── playground.py             # FastAPI routes
│   └── scenarios/
│       └── presets.py                # Pre-built scenarios
│
├── data/
│   └── demo_decisions.json           # Stored demo results
│
└── README.md                         # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- Dragon Core API running (devops_orchestrator)
- Next.js environment

### Backend Setup

1. **Install Python dependencies**:
```bash
cd dragon_playground/backend
pip install fastapi uvicorn slowapi
```

2. **Configure environment**:
```bash
# Set Dragon API endpoint
export DRAGON_BASE_URL="http://localhost:8000"
export DRAGON_API_TOKEN="your-dragon-token"
```

3. **Start backend API**:
```bash
uvicorn api.playground:router --host 0.0.0.0 --port 8001
```

### Frontend Setup

1. **Copy frontend files to Next.js project**:
```bash
# Copy to your existing Next.js app (chat_ui or separate)
cp -r dragon_playground/frontend/* chat_ui/
```

2. **Install frontend dependencies**:
```bash
cd chat_ui
npm install
```

3. **Update API proxy** (in `next.config.js`):
```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/playground/:path*',
        destination: 'http://localhost:8001/api/playground/:path*',
      },
    ];
  },
};
```

4. **Start Next.js**:
```bash
npm run dev
```

5. **Access playground**:
```
http://localhost:3000/playground
```

## 🔧 Configuration

### Backend Configuration

Edit `backend/api/playground.py`:

```python
# Rate limiting
limiter.limit("10/hour")  # Adjust requests per hour

# Demo mode
decision_payload["risk"]["demo_mode"] = True  # Never execute real actions

# Stats baseline
"total_decisions_analyzed": total_decisions + 12847,  # Adjust starting numbers
```

### Frontend Configuration

Edit `frontend/app/playground/page.tsx`:

```typescript
// API endpoint
const response = await fetch('/api/playground/scenarios');

// Customize footer links
<a href="https://klynxai.com">Learn More</a>
<a href="mailto:contact@klynxai.com">Request Full Demo</a>
```

## 🎨 Customization

### Add New Scenarios

Edit `backend/scenarios/presets.py`:

```python
PRESET_SCENARIOS.append({
    "id": "your-scenario-id",
    "title": "Your Scenario Title",
    "icon": "🚀",
    "difficulty": "high",  # low, high, or critical
    "expected_risk": "HIGH",  # LOW, MEDIUM, HIGH, or CRITICAL
    "data": {
        "title": "Full decision title",
        "action": "command or action",
        "rationale": "why this is needed",
        "impact": "who/what is affected",
        "risk": {
            "blast_radius": "scope of impact",
            "data_risk": "potential data issues",
            # ... more risk fields
        }
    }
})
```

### Customize Styling

Edit `frontend/styles/playground.css`:

```css
/* Change primary color */
--primary-color: #2fd1ff;  /* Cyan */

/* Change background gradient */
.playground-page {
  background: linear-gradient(180deg, #050b1b 0%, #0a1226 100%);
}

/* Adjust card styles */
.scenario-card {
  border-radius: 20px;  /* Card roundness */
  padding: 28px;        /* Card padding */
}
```

## 📊 Analytics & Tracking

### Track Usage

The playground automatically tracks:

- Scenarios tested
- Risk levels encountered
- Share button clicks
- Time spent analyzing

Access stats via:

```bash
GET /api/playground/stats
```

Response:
```json
{
  "total_decisions_analyzed": 12847,
  "high_risk_caught": 3291,
  "critical_incidents_prevented": 247,
  "estimated_cost_saved": "$4.2M",
  "avg_response_time_ms": 450
}
```

### Add Custom Analytics

Integrate with your analytics platform:

```typescript
// In frontend components
import { trackEvent } from '@/lib/analytics';

// Track scenario selection
trackEvent('playground_scenario_selected', {
  scenario_id: scenario.id,
  difficulty: scenario.difficulty,
});

// Track result sharing
trackEvent('playground_result_shared', {
  decision_id: decisionId,
  risk_score: riskScore,
});
```

## 🌐 Deployment

### Deploy to Production

1. **Set up subdomain**:
```bash
# DNS A record
playground.klynxai.com → Your server IP
```

2. **Configure nginx**:
```nginx
server {
    server_name playground.klynxai.com;

    # Backend API
    location /api/playground/ {
        proxy_pass http://127.0.0.1:8001/api/playground/;
    }

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/playground.klynxai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/playground.klynxai.com/privkey.pem;
}
```

3. **Get SSL certificate**:
```bash
sudo certbot --nginx -d playground.klynxai.com
```

4. **Start services**:
```bash
# Backend (systemd service)
sudo systemctl start dragon-playground

# Frontend (PM2 or systemd)
pm2 start npm --name "playground" -- start
```

### Environment Variables

Production `.env`:

```bash
# Dragon API
DRAGON_BASE_URL=https://dragon.klynxai.com
DRAGON_API_TOKEN=your-production-token

# Rate Limiting
RATE_LIMIT_PER_HOUR=10
RATE_LIMIT_PER_DAY=50

# Analytics
ANALYTICS_ENABLED=true
MIXPANEL_TOKEN=your-mixpanel-token

# Demo Mode (always true in playground)
DEMO_MODE=true
```

## 🚀 Launch Strategy

### Phase 1: Soft Launch (Week 1)
- [ ] Deploy to staging environment
- [ ] Internal testing with team
- [ ] Fix bugs and polish UI
- [ ] Prepare marketing materials

### Phase 2: Public Beta (Week 2)
- [ ] Launch to limited audience (email list)
- [ ] Collect feedback
- [ ] Monitor analytics
- [ ] Iterate on UX

### Phase 3: Viral Launch (Week 3-4)
- [ ] Product Hunt launch
- [ ] Hacker News "Show HN" post
- [ ] Reddit demo posts
- [ ] Twitter/LinkedIn campaign
- [ ] Press outreach

### Marketing Channels

1. **Product Hunt**
   - Title: "Dragon AI Playground - Test AI governance in real-time"
   - Tagline: "See how Dragon catches dangerous decisions before they happen"
   - Demo GIF showing high-risk scenario being blocked

2. **Hacker News**
   - Post: "Show HN: Dragon AI Playground - Interactive AI governance demo"
   - Include technical details about policy engine
   - Engage in comments with examples

3. **Reddit**
   - r/programming, r/devops, r/kubernetes
   - Share interesting scenarios (database delete, IAM grants)
   - Focus on educational value

4. **Twitter/LinkedIn**
   - Thread showing worst-case scenarios Dragon prevented
   - Video walkthrough
   - Quote testimonials from beta users

## 📈 Success Metrics

### Engagement Metrics
- **Unique Visitors**: Target 1000+ in first week
- **Scenarios Tested**: Target 3000+ decisions in first month
- **Avg Time on Site**: Target 5+ minutes
- **Return Visitor Rate**: Target 15%

### Conversion Metrics
- **Share Rate**: Target 20% (200 shares from 1000 visitors)
- **Lead Generation**: Target 50+ qualified leads
- **Demo Requests**: Target 20+ full demo requests
- **Conversion to Sales Call**: Target 5-10 calls

### Viral Metrics
- **Viral Coefficient**: Target 1.2+ (each user brings 1.2 more)
- **Social Mentions**: Target 100+ mentions
- **Backlinks**: Target 10+ blog posts/articles

## 🛠️ Troubleshooting

### Common Issues

**Issue**: CSS not loading
```bash
# Check Next.js build
npm run build

# Verify CSS import in page.tsx
import '../../styles/playground.css';
```

**Issue**: API connection fails
```bash
# Check backend is running
curl http://localhost:8001/api/playground/health

# Verify proxy in next.config.js
```

**Issue**: Dragon API errors
```bash
# Check Dragon core is running
curl http://localhost:8000/health

# Verify API token in environment
echo $DRAGON_API_TOKEN
```

**Issue**: Rate limiting too strict
```python
# Adjust in playground.py
@limiter.limit("20/hour")  # Increase from 10 to 20
```

## 🤝 Contributing

We welcome contributions! Areas for improvement:

- [ ] Add more scenarios
- [ ] Improve mobile experience
- [ ] Add internationalization (i18n)
- [ ] Create embeddable widget
- [ ] Add guided tutorial mode
- [ ] Implement challenge mode
- [ ] Build leaderboard feature

## 📝 License

Copyright © 2025 Klynx AI. All rights reserved.

## 🙋 Support

- **Documentation**: [https://docs.klynxai.com](https://docs.klynxai.com)
- **Email**: support@klynxai.com
- **Issues**: [GitHub Issues](https://github.com/klynxai/dragon/issues)

---

Built with ❤️ by the Klynx AI team

🐉 **Dragon AI** - Governance so smart, it catches mistakes you didn't see
