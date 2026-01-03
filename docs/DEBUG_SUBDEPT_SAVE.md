# Sub-Department Not Saving - Debug Guide

**Issue:** Sub departments are not persisting after save despite backend tests passing.

**Root Cause Analysis:**
✅ Backend API working (verified with `test_subdept_fix.py`)  
✅ Frontend store functions exist (`orgStore.ts` lines 461-483)  
✅ Frontend API service functions exist (`api.ts` line 1502, 1984, 2014)  
✅ Save handler in UI correct (`OrgSetup.tsx` lines 403-412)  

**Likely Issues:**
1. Frontend not calling backend (CORS, auth, network)
2. Data format mismatch between frontend/backend
3. Store not refreshing after save
4. UI not re-rendering after store update

---

## Debugging Steps (Manual)

### Step 1: Check Browser Console
1. Open application: `http://localhost:5173`
2. Press `F12` to open DevTools
3. Go to Console tab
4. Try to create a sub-department
5. **Look for:**
   - Red errors
   - Failed HTTP requests
   - JavaScript exceptions

### Step 2: Check Network Tab
1. In DevTools, go to Network tab
2. Create a subdepartment
3. **Find the request:**
   - `POST http://localhost:3001/api/sub-departments`
4. **Check:**
   - Status code (should be 200)
   - Request payload
   - Response payload
5. **Screenshot the request/response**

### Step 3: Check Backend Logs
1. Look at the terminal running `python -m uvicorn main:app --reload --port 3001`
2. When you save a sub-department, you should see:
   ```
   INFO:     127.0.0.1:XXXXX - "POST /api/sub-departments HTTP/1.1" 200 OK
   ```
3. If you see `401`, `403`, `500` → Backend error

### Step 4: Test Backend Directly
Run this in PowerShell:

```powershell
# Get auth token first
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
  -Method POST `
  -Body (@{username="admin"; password="admin"} | ConvertTo-Json) `
  -ContentType "application/json"

$token = $loginResponse.access_token

# Create test sub-department
$subdept = @{
  id = "TEST-SUB-999"
  name = "PowerShell Test Sub"
  code = "PS-TEST"
  parentDepartmentId = "DEPT-001"  # Use actual parent ID
  organizationId = "c54b46e2-7c02-47ae-9428-e3647e0e32e5"
  isActive = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/sub-departments" `
  -Method POST `
  -Headers @{Authorization="Bearer $token"} `
  -Body $subdept `
  -ContentType "application/json"

# Verify it was created
Invoke-RestMethod -Uri "http://localhost:3001/api/sub-departments" `
  -Headers @{Authorization="Bearer $token"}
```

**Expected:** You should see your test sub-department in the list.

---

## Common Issues & Fixes

### Issue 1: CORS Error in Console
**Symptom:** `Access-Control-Allow-Origin` error  
**Fix:** Backend CORS not configured for frontend port  
**Solution:** Check `backend/main.py` CORS settings

###Issue 2: 401 Unauthorized
**Symptom:** Network tab shows 401 status  
**Fix:** Auth token not sent or expired  
**Solution:**  
1. Check localStorage for `auth_token`
2. Re-login if missing

### Issue 3: 500 Internal Server Error
**Symptom:** Network tab shows 500  
**Fix:** Backend crash (likely the dict vs string bug we fixed)  
**Solution:**  
1. Check backend terminal for Python stacktrace
2. Check `backend/debug_error.txt` if it exists

### Issue 4: Sub-Department Appears Then Disappears
**Symptom:** Shows in list initially, gone after reload  
**Fix:** Saved to sessionStorage but not backend  
**Solution:**  
1. Backend might be offline
2. Check Network tab - if requests failing, backend not reachable

### Issue 5: Parent Department Not Showing Sub-Departments
**Symptom:** Sub-department created but not in tree  
**Fix:** `DepartmentTree.tsx` filtering logic  
**Solution:**  
1. Check console logs (we added debug logs)
2. Verify `parentDepartmentId` matches `dept.id` exactly
3. Check types (string vs number)

---

## Quick Verification

### Is Backend Running?
```powershell
curl http://localhost:3001/api/organizations
```
Should return JSON (not connection refused)

### Is Frontend Calling Backend?
1. Open Network tab
2. Filter by "sub-departments"
3. Save a sub-department
4. **Should see:**  
   - `POST /api/sub-departments` with status 200
   - `GET /api/sub-departments` to refresh list

### Is Data Persisting to Database?
```powershell
# Check SQLite database directly
cd backend
python
```
```python
import sqlite3
conn = sqlite3.connect('hunzal_hcm.db')
cursor = conn.cursor()
cursor.execute("SELECT * FROM sub_departments")
print(cursor.fetchall())
conn.close()
```

---

## Report Back

Please provide:
1. **Console errors** (screenshot or copy/paste)
2. **Network tab** for sub-department requests (screenshot)
3. **Backend logs** when saving
4. **Result of PowerShell test** (did backend test work?)

This will help me pinpoint exactly where it's failing!
