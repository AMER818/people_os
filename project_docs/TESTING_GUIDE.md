# 🔍 Organization Profile - Testing & Diagnostics Guide

## Quick Start (5 minutes)

### 1. Both servers are running ✅

- **Frontend:** http://localhost:5173
- **Backend:** http://127.0.0.1:3001
- **Backend Status:** Uvicorn running, database connected

### 2. Open the app and test

```
1. Open http://localhost:5173 in your browser
2. Press F12 to open DevTools
3. Go to Console tab
```

### 3. Paste the diagnostic capture script

Copy the entire contents of [diagnostic-capture.js](diagnostic-capture.js) and paste it into the browser console. You should see:

```
✓ Console capture started
✓ Fetch capture started
🚀 Diagnostic system ready!
1. Complete your login and actions
2. Run: DIAGNOSTIC.save()
3. The report will be logged and copied to clipboard
```

### 4. Login and wait for page to load

- Login with your credentials
- Wait for dashboard to fully load
- The diagnostic system is capturing everything

### 5. Run the diagnostic save command

After login completes, paste this in the console:

```javascript
DIAGNOSTIC.save();
```

This will:

- ✅ Generate a detailed report
- ✅ Log it to the console
- ✅ Copy it to your clipboard
- ✅ Show storage status, API calls, and logs

### 6. Share the report

Paste the report output here so I can analyze it.

---

## What the Diagnostic Captures

### 📊 System Information

- Test duration
- Number of logs and API calls
- Error count

### 💾 Storage Check

- Token presence and size
- Current user email
- Cached organization profile

### 🌐 API Calls

- Method and URL
- HTTP status code
- Response duration
- Response size and preview

### 📝 Key Logs

- All `[getOrganization]` logs
- All `[request]` logs
- All `[fetchProfile]` logs
- Any AbortError or NetworkError messages

### 💡 Recommendations

- Whether token is present
- Whether API calls succeeded
- Whether profile is cached

---

## Manual Alternative (if console fails)

If the diagnostic script doesn't work, do this manually:

### In DevTools Console:

**Check Storage:**

```javascript
// Token check
console.log('Token:', sessionStorage.getItem('hunzal_token') ? '✓' : '✗');

// Organization profile check
const org = localStorage.getItem('org_profile');
console.log('Org:', org ? '✓ ' + JSON.parse(org).name : '✗');
```

**Check Network:**

1. Open DevTools → Network tab
2. Find request to `api/organizations`
3. Note:
   - Status code (should be 200)
   - Response body
   - Headers (look for CORS headers)
   - Timing

**Look for Logs:**

1. Open DevTools → Console tab
2. Look for lines starting with:
   - `[getOrganization]`
   - `[request]`
   - `[fetchProfile]`

---

## Expected Results ✅

### If everything works:

```
✓ Token is present (20+ chars)
✓ API call to /api/organizations: 200 OK
✓ Response includes organization data
✓ org_profile cached in localStorage
✓ Organization profile displays in UI
```

### If there's an error:

The diagnostic will show:

- ❌ Which step failed
- The error type (AbortError, NetworkError, etc.)
- The response status code
- Duration and timing info

This will tell us exactly what's wrong!

---

## Common Issues & Fixes

| Issue                            | What to check    | Fix                                       |
| -------------------------------- | ---------------- | ----------------------------------------- |
| API returns 401                  | Token valid?     | Re-login                                  |
| API returns 0/connection refused | Backend running? | Backend may have crashed                  |
| NS_BINDING_ABORTED               | Page reloading?  | Wait for full page load before navigating |
| Empty response                   | Database?        | Database may not have org data            |
| CORS error                       | Origin header    | CORS configuration issue                  |

---

## System Configuration ✓

### Backend

- ✅ Framework: FastAPI
- ✅ Server: Uvicorn 127.0.0.1:3001
- ✅ Database: SQLite (hunzal_hcm.db)
- ✅ CORS: Configured for localhost:5173

### Frontend

- ✅ Framework: React + TypeScript
- ✅ Dev Server: Vite on localhost:5173
- ✅ Store: Zustand (orgStore)
- ✅ Logging: Enhanced with timestamps

### API Endpoint

- ✅ GET /api/organizations
- ✅ Returns: Array of OrganizationProfile objects
- ✅ Requires: Bearer token in Authorization header
- ✅ Response time: ~12ms

### Data

- ✅ Organizations in DB: 2
- ✅ Primary: "People's Organization"
- ✅ Fields: name, email, phone, industry, taxId, etc.

---

## Testing Workflow

```
1. Open app & DevTools
   ↓
2. Paste diagnostic-capture.js into console
   ↓
3. Login to application
   ↓
4. Wait for dashboard to load
   ↓
5. Run: DIAGNOSTIC.save()
   ↓
6. Share report (will be in clipboard)
   ↓
7. I analyze and fix any issues
```

---

## Need Help?

If you encounter issues:

1. **Verify both servers are running:**

   ```powershell
   netstat -ano | findstr :3001   # Backend
   netstat -ano | findstr :5173   # Frontend
   ```

2. **Check backend logs** in the terminal

3. **Check frontend console** for red error messages

4. **Run the diagnostic** to capture detailed info

5. **Share the diagnostic report** with me

---

## Files Referenced

- [diagnostic-capture.js](diagnostic-capture.js) - Automated capture script
- [DIAGNOSTIC_CHECKLIST.html](DIAGNOSTIC_CHECKLIST.html) - Visual step-by-step guide
- [DEBUG_HELPERS.md](DEBUG_HELPERS.md) - Manual console commands
- src/services/api.ts - Enhanced with detailed logging
- src/store/orgStore.ts - Enhanced with timing info
- backend/main.py - FastAPI application

---

**Status: All systems ready for testing! 🚀**

Ready when you are. Start with the Quick Start section above.
