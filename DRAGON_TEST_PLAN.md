# 🧪 Dragon Improvements - Test Plan

## 📋 Pre-Testing Setup

### 1. Install Dependencies
```bash
cd c:\aimlprojects\klynxaiagent\devops_orchestrator
pip install -r requirements.txt
```

Expected output:
```
Successfully installed slowapi-0.1.9 redis-5.0.1
# (Other packages already installed)
```

### 2. Start Dragon DevOps Orchestrator
```bash
cd c:\aimlprojects\klynxaiagent\devops_orchestrator
python app.py
```

Expected output:
```
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

## ✅ Test 1: Health Check Enhancement

### Test Command
```bash
curl http://localhost:8000/health
```

### Expected Response
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

### ✅ Pass Criteria
- Status is "healthy" or "degraded" (not error)
- Has "dependencies" object
- Shows version "0.1.0"

---

## ✅ Test 2: Correlation ID Middleware

### Test Command
```bash
# Test 1: Without correlation ID
curl -v http://localhost:8000/health 2>&1 | grep -i "x-correlation-id"

# Test 2: With custom correlation ID
curl -v -H "X-Correlation-ID: test-trace-123" http://localhost:8000/health 2>&1 | grep -i "x-correlation-id"
```

### Expected Response
```
# Test 1: Should see auto-generated UUID
< X-Correlation-ID: 550e8400-e29b-41d4-a716-446655440000

# Test 2: Should see your custom ID echoed back
< X-Correlation-ID: test-trace-123
```

### ✅ Pass Criteria
- Response header contains `X-Correlation-ID`
- Custom correlation ID is preserved

---

## ✅ Test 3: Rate Limiting - Approvals Endpoint

### Test Command
```bash
# Make 21 approval requests quickly (limit is 20/hour)
for i in {1..21}; do
  echo "Request $i:"
  curl -X POST http://localhost:8000/api/approvals \
    -H "Content-Type: application/json" \
    -d '{
      "incident_id": "test-incident",
      "decision_id": "test-decision",
      "approved": true,
      "approver": "test-user",
      "justification": "testing rate limit"
    }'
  echo ""
  sleep 0.5
done
```

### Expected Response
```json
# Requests 1-20: Should succeed (or fail for other reasons like decision not found)
{"status": "denied"} or {"detail": "decision_not_approved"}

# Request 21: Should be rate limited
{"error": "Rate limit exceeded: 20 per 1 hour"}
```

### ✅ Pass Criteria
- First 20 requests: Return 200/403 (not 429)
- 21st request: Return **429 Too Many Requests**
- Response includes rate limit error message

---

## ✅ Test 4: Rate Limiting - Generate Endpoint

### Test Command
```bash
# Test generate endpoint (limit: 50/hour)
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "repo": "test/repo",
    "prompt": "generate a test function"
  }'
```

### Expected Response
```json
{
  "draft_id": "some-decision-id",
  "summary": "Draft generated. Pending approval.",
  "files": [],
  "decision_gate": {
    "decision_id": "some-decision-id",
    "approved": false,
    "status": "pending"
  }
}
```

### ✅ Pass Criteria
- Returns 200 OK (if Dragon API is running)
- Has rate limit: 50/hour (won't hit limit in single test)

---

## ✅ Test 5: Exception Handler

### Test Command
```bash
# This will trigger an error if the endpoint validation fails
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{}'  # Empty payload - should fail validation
```

### Expected Response
```json
{
  "detail": [
    {
      "loc": ["body", "repo"],
      "msg": "field required",
      "type": "value_error.missing"
    },
    {
      "loc": ["body", "prompt"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### ✅ Pass Criteria
- Returns 422 Unprocessable Entity (Pydantic validation)
- Error message is clear

---

## ✅ Test 6: Authentication Module (Unit Test)

### Test Command
```bash
# Create test script
cat > test_auth.py << 'EOF'
import sys
sys.path.insert(0, 'c:/aimlprojects/klynxaiagent')

from devops_orchestrator.auth import create_access_token, decode_access_token, User

# Test 1: Create JWT token
print("Test 1: Create JWT Token")
token = create_access_token(
    user_id="test-user-123",
    email="test@klynxai.com",
    roles=["developer", "approver"]
)
print(f"✓ Token created: {token[:50]}...")

# Test 2: Decode token
print("\nTest 2: Decode JWT Token")
payload = decode_access_token(token)
print(f"✓ User ID: {payload['user_id']}")
print(f"✓ Email: {payload['email']}")
print(f"✓ Roles: {payload['roles']}")

# Test 3: User permissions
print("\nTest 3: User Permissions")
user = User(
    user_id=payload['user_id'],
    email=payload['email'],
    roles=payload['roles']
)
print(f"✓ Can approve: {user.can_approve('test-decision')}")
print(f"✓ Has approver role: {user.has_role('approver')}")
print(f"✓ Has admin role: {user.has_role('admin')}")

print("\n✅ All authentication tests passed!")
EOF

python test_auth.py
```

### Expected Output
```
Test 1: Create JWT Token
✓ Token created: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Test 2: Decode JWT Token
✓ User ID: test-user-123
✓ Email: test@klynxai.com
✓ Roles: ['developer', 'approver']

Test 3: User Permissions
✓ Can approve: True
✓ Has approver role: True
✓ Has admin role: False

✅ All authentication tests passed!
```

### ✅ Pass Criteria
- Token is created successfully
- Token can be decoded
- User permissions work correctly

---

## ✅ Test 7: Webhook Signature Verification (Existing Feature)

### Test Command
```bash
# Test webhook without signature (should be rejected if GITHUB_WEBHOOK_SECRET is set)
curl -X POST http://localhost:8000/webhooks/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: workflow_run" \
  -d '{
    "action": "completed",
    "workflow_run": {
      "id": 123,
      "conclusion": "failure"
    },
    "repository": {
      "full_name": "test/repo"
    }
  }'
```

### Expected Response (if webhook secret is configured)
```json
{"detail": "invalid_signature"}
```

### ✅ Pass Criteria
- If `GITHUB_WEBHOOK_SECRET` is set: Returns 401 Unauthorized
- If not set: Processes webhook (returns 200)

---

## 📊 Test Results Summary

Fill in after testing:

| Test | Status | Notes |
|------|--------|-------|
| 1. Health Check | ⬜ Pass / ❌ Fail | |
| 2. Correlation ID | ⬜ Pass / ❌ Fail | |
| 3. Rate Limiting (Approvals) | ⬜ Pass / ❌ Fail | |
| 4. Rate Limiting (Generate) | ⬜ Pass / ❌ Fail | |
| 5. Exception Handler | ⬜ Pass / ❌ Fail | |
| 6. Authentication Module | ⬜ Pass / ❌ Fail | |
| 7. Webhook Signature | ⬜ Pass / ❌ Fail | |

---

## 🐛 Common Issues & Solutions

### Issue 1: Import Error - slowapi not found
```
ModuleNotFoundError: No module named 'slowapi'
```

**Solution**:
```bash
pip install slowapi==0.1.9
```

---

### Issue 2: Import Error - exceptions module not found
```
ModuleNotFoundError: No module named 'devops_orchestrator.exceptions'
```

**Solution**: File was created, restart Python server:
```bash
# Ctrl+C to stop server
python app.py  # Restart
```

---

### Issue 3: Rate limit not working
```
All 21 requests succeed, no 429 error
```

**Solution**: Rate limiter uses in-memory storage, check:
```python
# In app.py, verify limiter is initialized
app.state.limiter = limiter
```

---

### Issue 4: Health check shows degraded
```
{"status": "degraded", "dependencies": {"dragon_api": "unhealthy: ..."}}
```

**Solution**: This is expected if Dragon API is not running. Health check still works, just shows degraded status.

---

## 🎯 Decision Point After Testing

### Option A: Launch Playground Now ✅
**If all tests pass**, you can safely launch the Dragon Playground:

**Pros**:
- Rate limiting prevents abuse
- Better error handling
- Monitoring ready
- Playground has its own rate limiting

**Cons**:
- Authentication not enforced yet (but playground is demo-only)
- Core endpoints still public (but rate limited)

**Action**: Deploy playground and monitor

---

### Option B: Apply Authentication First ⚙️
**If you want full security**, continue with authentication:

**Next Steps** (2 hours):
1. Protect `/api/approvals` with `require_approver`
2. Protect `/api/generate` with `require_developer`
3. Protect `/api/pr` with `require_developer`
4. Update audit logs to track user identity
5. Test with JWT tokens

**Pros**:
- Full authentication enforced
- Audit trail of who did what
- Production-ready security

**Cons**:
- Delays playground launch by 2 hours
- Need to generate/distribute JWT tokens

---

## 📝 Test Execution Checklist

```bash
# Step 1: Install dependencies
[ ] cd devops_orchestrator
[ ] pip install -r requirements.txt

# Step 2: Start server
[ ] python app.py
[ ] Server starts without errors

# Step 3: Run tests
[ ] Test 1: Health check
[ ] Test 2: Correlation ID
[ ] Test 3: Rate limiting (approvals)
[ ] Test 4: Rate limiting (generate)
[ ] Test 5: Exception handler
[ ] Test 6: Authentication module
[ ] Test 7: Webhook signature

# Step 4: Review results
[ ] All tests pass OR issues documented
[ ] Decision made: Option A (launch) or Option B (auth first)
```

---

## 🚀 Ready to Test!

**Start here**:
```bash
cd c:\aimlprojects\klynxaiagent\devops_orchestrator
pip install -r requirements.txt
python app.py
```

Then run through tests 1-7 above and report back results!
