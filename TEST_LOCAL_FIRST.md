# 🖥️ Test Dragon Locally First (Windows)

## ✅ Why Test Locally?
- Catch errors before production
- Faster iteration
- No risk to live site
- Easy debugging

---

## 🚀 Local Testing - 15 Minutes

### Step 1: Install Dependencies (2 minutes)

```bash
# Open PowerShell or Git Bash
cd c:\aimlprojects\klynxaiagent\devops_orchestrator

# Install new dependencies
pip install slowapi redis
```

Expected output:
```
Successfully installed slowapi-0.1.9 redis-5.0.1
```

---

### Step 2: Start Dragon Core (1 minute)

```bash
# Still in devops_orchestrator directory
python app.py
```

Expected output:
```
✓ Dragon Playground routes loaded
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

**If you see "Dragon Playground not available"** - that's OK for now, we'll fix it.

---

### Step 3: Test Dragon Core (2 minutes)

**Open a NEW terminal** (keep Dragon running in the first one).

**Test 1: Health Check**
```bash
curl http://localhost:8000/health
```

Expected (status may be "degraded" if Dragon API not running - that's OK):
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "service": "dragon-devops-orchestrator",
  "dependencies": {
    "dragon_api": "healthy",
    "incident_api": "healthy",
    "state_store": "healthy"
  }
}
```

✅ **Pass**: Returns JSON with "status" and "dependencies"

---

**Test 2: Correlation ID**
```bash
curl -v http://localhost:8000/health 2>&1 | findstr /i "x-correlation-id"
```

Expected:
```
< X-Correlation-ID: 550e8400-e29b-41d4-a716-446655440000
```

✅ **Pass**: See correlation ID in response headers

---

**Test 3: Rate Limiting**

Test the approvals endpoint (should hit rate limit after 20 requests):

```powershell
# PowerShell
for ($i=1; $i -le 21; $i++) {
    Write-Host "Request $i"
    curl -X POST http://localhost:8000/api/approvals `
      -H "Content-Type: application/json" `
      -d '{\"incident_id\":\"test\",\"decision_id\":\"test\",\"approved\":true,\"approver\":\"test\"}'
    Start-Sleep -Milliseconds 200
}
```

Expected:
- Requests 1-20: Some response (may be error, that's OK)
- Request 21: **"Rate limit exceeded"** or HTTP 429

✅ **Pass**: 21st request shows rate limit error

---

### Step 4: Test Playground API (3 minutes)

**Test Playground Scenarios**
```bash
curl http://localhost:8000/api/playground/scenarios
```

**Expected (SUCCESS)**:
```json
{
  "success": true,
  "scenarios": [
    {
      "id": "prod-deployment",
      "title": "Production Deployment",
      "icon": "⚠️",
      ...
    },
    ...
  ]
}
```

**If you get error** (module not found):
```json
{
  "detail": "Not Found"
}
```

This means playground integration failed. **That's OK** - we'll fix it in Step 5.

---

**Test Playground Stats**
```bash
curl http://localhost:8000/api/playground/stats
```

Expected:
```json
{
  "success": true,
  "stats": {
    "total_decisions_analyzed": 12847,
    "high_risk_caught": 3291,
    ...
  }
}
```

---

**Test Playground Health**
```bash
curl http://localhost:8000/api/playground/health
```

Expected:
```json
{
  "status": "healthy",
  "service": "dragon-playground",
  "version": "1.0.0"
}
```

---

### Step 5: Fix Playground Integration (if needed)

**If playground endpoints return 404**, the integration didn't work.

**Check Dragon startup logs**:
- ✅ See "✓ Dragon Playground routes loaded" → All good!
- ⚠️ See "⚠ Dragon Playground not available" → Need to fix

**Fix #1: Check file exists**
```bash
# Check if playground API exists
ls c:\aimlprojects\klynxaiagent\dragon_playground\backend\api\playground.py
```

Should exist and be ~450 lines.

**Fix #2: Check Python path**
```bash
# In Python
python
>>> import sys
>>> sys.path.insert(0, 'c:/aimlprojects/klynxaiagent')
>>> from dragon_playground.backend.api.playground import router
>>> print(router)
# Should not error
```

**Fix #3: Manual import test**
```bash
cd c:\aimlprojects\klynxaiagent\devops_orchestrator
python
```

```python
import sys
sys.path.insert(0, 'c:/aimlprojects/klynxaiagent')
from dragon_playground.backend.api.playground import router
print("✓ Playground router loaded:", router)
```

If this works, restart Dragon:
```bash
# Ctrl+C to stop
python app.py
```

---

### Step 6: Test Frontend (5 minutes)

**Start Next.js development server**:

```bash
cd c:\aimlprojects\klynxaiagent\chat_ui
npm run dev
```

Expected:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Visit in browser**:
```
http://localhost:3000/playground
```

**Expected**:
- See Dragon Playground landing page
- Stats banner with numbers
- 6 scenario cards
- Click on a scenario
- Fill out decision form
- Submit to Dragon
- See risk visualization

✅ **Pass**: Can complete full flow without errors

---

## 📊 Local Test Results Checklist

Fill this out:

```
Local Testing Results:

Step 1: Dependencies
[ ] slowapi installed
[ ] redis installed

Step 2: Dragon Core Starts
[ ] Server starts without errors
[ ] See port 8000 message

Step 3: Dragon Core Tests
[ ] Health check returns JSON
[ ] Correlation ID in headers
[ ] Rate limiting works (21st request fails)

Step 4: Playground API
[ ] /api/playground/scenarios returns scenarios
[ ] /api/playground/stats returns stats
[ ] /api/playground/health returns healthy

Step 5: Frontend
[ ] http://localhost:3000/playground loads
[ ] Can select scenario
[ ] Can submit decision
[ ] See risk visualization

Overall Status:
[ ] ALL TESTS PASS - Ready for AWS deployment
[ ] SOME FAILURES - Need to fix (list below)
```

**Issues Found**:
1.
2.
3.

---

## 🚀 After Local Testing Passes

### Deploy to AWS Lightsail

**Only proceed if all local tests pass!**

1. SSH to AWS Lightsail
2. Pull latest code
3. Install dependencies
4. Restart services
5. Test on public URL

Full AWS deployment guide: [DEPLOY_TO_AWS.md](DEPLOY_TO_AWS.md) (I can create this next)

---

## 🐛 Common Local Issues

### Issue 1: "Module not found: slowapi"
```
ModuleNotFoundError: No module named 'slowapi'
```

**Fix**:
```bash
pip install slowapi==0.1.9
```

---

### Issue 2: "Port 8000 already in use"
```
ERROR:    [Errno 10048] error while attempting to bind on address ('127.0.0.1', 8000)
```

**Fix**:
```bash
# Find and kill process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or change port in settings
```

---

### Issue 3: Playground routes not loading
```
⚠ Dragon Playground not available: No module named 'dragon_playground'
```

**Fix**:
```bash
# Verify playground files exist
ls c:\aimlprojects\klynxaiagent\dragon_playground\backend\api\playground.py

# If missing, playground wasn't created - go back to previous steps
```

---

### Issue 4: Frontend won't start
```
Error: ENOENT: no such file or directory, open 'package.json'
```

**Fix**:
```bash
# Make sure you're in chat_ui directory
cd c:\aimlprojects\klynxaiagent\chat_ui

# Install dependencies first
npm install

# Then start
npm run dev
```

---

## ✅ Success Criteria

**Local testing is successful when**:

1. ✅ Dragon starts without errors
2. ✅ Health check returns JSON
3. ✅ Rate limiting works
4. ✅ Playground API endpoints respond
5. ✅ Frontend loads at localhost:3000/playground
6. ✅ Can test a scenario end-to-end
7. ✅ No errors in terminal logs

**Then you're ready for AWS deployment!**

---

## 📝 Quick Reference

```bash
# Start Dragon
cd c:\aimlprojects\klynxaiagent\devops_orchestrator
python app.py

# In another terminal, test
curl http://localhost:8000/health
curl http://localhost:8000/api/playground/scenarios

# Start frontend
cd c:\aimlprojects\klynxaiagent\chat_ui
npm run dev

# Visit
http://localhost:3000/playground
```

---

**Status**: Ready for local testing! 🧪

**Next**: After local tests pass → Deploy to AWS Lightsail
