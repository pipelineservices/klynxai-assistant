# 🚀 Launch Dragon Playground - Action Plan

## Phase 1: Launch NOW (Option A) - 30 Minutes

### Step 1: Verify Dragon Core (5 minutes)

```bash
# Install dependencies
cd c:\aimlprojects\klynxaiagent\devops_orchestrator
pip install slowapi redis

# Start Dragon
python app.py
```

**Test it works**:
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy", "dependencies": {...}}
```

✅ **Dragon core is ready!**

---

### Step 2: Deploy Playground Backend (10 minutes)

**Option 2a: Integrate with existing FastAPI app**

Add playground routes to main Dragon app:

```bash
# Create symbolic link or copy playground API
cd c:\aimlprojects\klynxaiagent\devops_orchestrator

# Add to app.py
```

Edit `devops_orchestrator/app.py`, add at the end (before `if __name__`):

```python
# Mount Dragon Playground routes
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from dragon_playground.backend.api.playground import router as playground_router

app.include_router(playground_router)
```

**Restart Dragon**:
```bash
python app.py
```

**Test playground endpoints**:
```bash
curl http://localhost:8000/api/playground/scenarios
# Should return: {"success": true, "scenarios": [...]}
```

✅ **Playground backend is live!**

---

**Option 2b: Run as separate service**

```bash
cd c:\aimlprojects\klynxaiagent\dragon_playground\backend

# Create main.py
cat > main.py << 'EOF'
from fastapi import FastAPI
from api.playground import router

app = FastAPI(title="Dragon Playground")
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
EOF

# Run it
python main.py
```

Test:
```bash
curl http://localhost:8001/api/playground/scenarios
```

---

### Step 3: Deploy Playground Frontend (15 minutes)

**Quick Deploy with existing Next.js**:

```bash
# Copy playground files to chat_ui
cd c:\aimlprojects\klynxaiagent
cp -r dragon_playground/frontend/* chat_ui/

# Install dependencies (if needed)
cd chat_ui
npm install

# Build and run
npm run build
npm start
# OR
npm run dev
```

**Access playground**:
```
http://localhost:3000/playground
```

✅ **Playground is LIVE!**

---

### Step 4: Configure Nginx (if deploying to klynxai.com)

Add to nginx config:

```nginx
# Playground frontend
location /playground {
    proxy_pass http://127.0.0.1:3000/playground;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
}

# Playground API
location /api/playground/ {
    proxy_pass http://127.0.0.1:8000/api/playground/;
    # OR if separate service: http://127.0.0.1:8001/api/playground/
    proxy_http_version 1.1;
    proxy_set_header Host $host;
}
```

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🎉 Playground is LIVE!

**Public URL**: https://klynxai.com/playground

**Features**:
- 6 interactive scenarios
- Real-time risk visualization
- Social sharing
- Rate limited (10 req/hour/IP already built-in!)

---

## Phase 2: Apply Authentication (Option B) - Next 2 Hours

Once playground is live and generating traffic, apply full authentication to core Dragon:

### Hour 1: Protect Endpoints

**File**: `devops_orchestrator/app.py`

```python
from devops_orchestrator.auth import require_approver, require_developer, get_current_user

# Protect approvals - CRITICAL
@app.post("/api/approvals")
@limiter.limit("20/hour")
async def approvals(
    request: Request,
    payload: ApprovalPayload,
    user: User = Depends(require_approver)  # ADD THIS
):
    # Add user tracking
    audit.write_event("approval.received", payload.incident_id, {
        "decision": payload.decision_id,
        "approver_id": user.user_id,      # ADD
        "approver_email": user.email       # ADD
    })
    ...

# Protect code generation
@app.post("/api/generate", response_model=GenerateResponse)
@limiter.limit("50/hour")
def generate(
    request: Request,
    req: GenerateRequest,
    user: User = Depends(require_developer)  # ADD THIS
):
    ...

# Protect PR creation
@app.post("/api/pr", response_model=PullRequestResponse)
@limiter.limit("100/hour")
def create_pr(
    request: Request,
    req: PullRequestRequest,
    user: User = Depends(require_developer)  # ADD THIS
):
    ...
```

### Hour 2: Create Admin Endpoint & Test

**Add token generation endpoint**:

```python
from devops_orchestrator.auth import create_access_token

@app.post("/api/auth/token")
async def generate_token(credentials: dict):
    """Generate JWT token (temporary - replace with OAuth)"""
    # TODO: Verify credentials against database
    if credentials.get("api_key") == settings.DRAGON_API_TOKEN:
        token = create_access_token(
            user_id=credentials.get("user_id", "admin"),
            email=credentials.get("email", "admin@klynxai.com"),
            roles=["admin", "approver", "developer"]
        )
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid credentials")
```

**Test authentication**:

```bash
# Get token
TOKEN=$(curl -X POST http://localhost:8000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"api_key":"your-dragon-api-token","user_id":"admin","email":"admin@klynxai.com"}' \
  | jq -r '.access_token')

# Use token
curl -X POST http://localhost:8000/api/approvals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"incident_id":"test","decision_id":"test","approved":true,"approver":"admin"}'
```

---

## 📊 Deployment Timeline

### Today (Now):
- ✅ Dragon core improvements done
- 🔄 Install dependencies (1 min)
- 🔄 Deploy playground backend (10 min)
- 🔄 Deploy playground frontend (15 min)
- 🔄 Configure nginx (5 min)

**Total**: 30 minutes to launch

### Tomorrow:
- Apply authentication (2 hours)
- Test with JWT tokens (30 min)
- Update documentation (30 min)

**Total**: 3 hours to full production security

---

## 🎯 Launch Checklist

**Before Going Live**:
```bash
# 1. Dependencies installed
[ ] cd devops_orchestrator && pip install slowapi redis

# 2. Dragon core running
[ ] python app.py running
[ ] curl http://localhost:8000/health returns healthy

# 3. Playground backend working
[ ] curl http://localhost:8000/api/playground/scenarios returns scenarios
[ ] curl http://localhost:8000/api/playground/stats returns stats

# 4. Playground frontend working
[ ] npm install && npm run build
[ ] http://localhost:3000/playground loads
[ ] Can select a scenario
[ ] Can submit a decision
[ ] Risk visualization shows

# 5. Production deployment
[ ] Nginx configured
[ ] SSL certificates active
[ ] https://klynxai.com/playground accessible
```

---

## 🚨 Monitoring After Launch

**Watch these metrics**:

1. **Rate Limit Hits**
```bash
# Check logs for 429 responses
tail -f /var/log/nginx/access.log | grep "429"
```

2. **Error Rate**
```bash
# Check for 500 errors
tail -f devops_orchestrator.log | grep "ERROR"
```

3. **Playground Usage**
```bash
# Count playground requests
curl http://localhost:8000/api/playground/stats
```

4. **Health Status**
```bash
# Monitor every 5 minutes
watch -n 300 curl http://localhost:8000/health
```

---

## 🎓 Quick Commands Reference

```bash
# Start Dragon
cd c:\aimlprojects\klynxaiagent\devops_orchestrator
python app.py

# Start Playground (if separate)
cd c:\aimlprojects\klynxaiagent\dragon_playground\backend
python main.py

# Start Frontend
cd c:\aimlprojects\klynxaiagent\chat_ui
npm run dev

# Test health
curl http://localhost:8000/health

# Test playground
curl http://localhost:8000/api/playground/scenarios

# View logs
tail -f devops_orchestrator.log
```

---

## ✅ Success Criteria

**Phase 1 Success** (Launch):
- [ ] Playground accessible at https://klynxai.com/playground
- [ ] Can test all 6 scenarios
- [ ] Risk visualization works
- [ ] Share button functional
- [ ] Rate limiting active
- [ ] No errors in logs

**Phase 2 Success** (Auth):
- [ ] All sensitive endpoints require authentication
- [ ] JWT tokens working
- [ ] Audit logs show user identity
- [ ] No unauthorized access possible

---

## 🚀 LET'S LAUNCH!

**Start here**:
```bash
# 1. Install deps
cd c:\aimlprojects\klynxaiagent\devops_orchestrator
pip install slowapi redis

# 2. Start Dragon
python app.py
```

**Then test**:
```bash
curl http://localhost:8000/health
```

**Status**: Ready to launch! 🎉
