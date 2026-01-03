# Browser Debug Helpers

Paste these commands into your browser console (DevTools → Console tab) to diagnose the organization profile fetch issue:

## Check Authentication & Storage

```javascript
// Check if you have a valid token
const token = sessionStorage.getItem('hunzal_token');
console.log('Token in sessionStorage:', token ? '✓ Present' : '✗ Missing');

// Check if org profile is cached
const cachedOrg = localStorage.getItem('org_profile');
console.log(
  'Cached org_profile:',
  cachedOrg ? '✓ Present (' + JSON.parse(cachedOrg)?.name + ')' : '✗ Missing'
);

// Check current user
const currentUser = sessionStorage.getItem('current_user') || localStorage.getItem('current_user');
console.log('Current user:', currentUser ? JSON.parse(currentUser)?.email : 'Not set');
```

## Test Direct API Call

```javascript
// Test if backend is responding with your token
async function testOrgFetch() {
  const token = sessionStorage.getItem('hunzal_token') || localStorage.getItem('hunzal_token');
  if (!token) {
    console.error('No token found. Please log in first.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3001/api/organizations', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', {
      contentType: response.headers.get('content-type'),
      corsOrigin: response.headers.get('access-control-allow-origin'),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Organizations returned:', data);
    } else {
      console.error('Error response:', await response.text());
    }
  } catch (error) {
    console.error('Fetch error:', error.name, error.message);
    console.error('Stack:', error.stack);
  }
}

testOrgFetch();
```

## Monitor Network Aborts

```javascript
// Replace fetch to log all network calls and their results
const originalFetch = window.fetch;
window.fetch = function (...args) {
  const [url, options] = args;
  const method = options?.method || 'GET';
  const isApiCall = url.includes('/api/');

  if (isApiCall) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] 📤 ${method} ${url}`);
  }

  return originalFetch
    .apply(this, args)
    .then((response) => {
      if (isApiCall) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] 📥 ${method} ${url} → ${response.status}`);
      }
      return response;
    })
    .catch((error) => {
      if (isApiCall) {
        const timestamp = new Date().toLocaleTimeString();
        console.error(`[${timestamp}] ❌ ${method} ${url} → ${error.name}: ${error.message}`);
      }
      throw error;
    });
};

console.log('Fetch monitor installed. Check console for API calls.');
```

## Check App State

```javascript
// Look at the Zustand org store state (if accessible)
if (window.__ZUSTAND_DEBUG__) {
  console.log('Org store state:', window.__ZUSTAND_DEBUG__.orgStore.getState?.());
} else {
  console.warn('Zustand DevTools not available. Try accessing store via React DevTools.');
}
```

## Export Network HAR (for sending to developer)

```javascript
// Copy the following into DevTools Network tab and export:
// 1. Open DevTools → Network tab
// 2. Preserve logs (checkbox)
// 3. Reproduce the issue (login, page load)
// 4. Right-click in Network tab → Save all as HAR with content
// 5. Send the .har file

console.log('To export HAR: DevTools > Network > Right-click > Save all as HAR with content');
```

## Reproduce the Exact Issue

1. **Open DevTools** (F12) and go to **Console** tab
2. **Enable "Preserve log"** (checkbox at top of Console)
3. **Do NOT clear console between steps**
4. **Login** to the application
5. **Wait for page to load**
6. **Copy all console output** (Ctrl+A, Ctrl+C)
7. **Go to Network tab**, find the failed `GET /api/organizations` request:
   - Check **Status** code
   - Check **Response** tab for the body
   - Check **Headers** tab for CORS headers
   - Note the **Initiator** column (what triggered this request)

## After Gathering Data

Share the following with the developer:

1. Console output (all `[getOrganization]` and `[request]` lines)
2. Network tab entry for `GET /api/organizations` with its response
3. Result of the storage check (token, org_profile, current_user)
4. Result of the direct API test
5. If available: export HAR file (DevTools → Network → Right-click → Save all as HAR)
