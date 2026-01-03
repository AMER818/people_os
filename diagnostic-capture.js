/**
 * Automated Diagnostic Capture for Organization Profile Issue
 *
 * Instructions:
 * 1. Open http://localhost:5173 in your browser
 * 2. Open DevTools (F12)
 * 3. Go to Console tab
 * 4. BEFORE logging in, paste the code below
 * 5. This will automatically capture all logs during login
 * 6. After login completes, run: saveDiagnostics()
 */

window.DIAGNOSTIC = {
  logs: [],
  requests: [],
  errors: [],
  startTime: Date.now(),

  // Patch console to capture all logs
  initConsoleCapture() {
    const original = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };

    const captureLog = (level, args) => {
      const msg = args
        .map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)))
        .join(' ');

      this.logs.push({
        level,
        time: Date.now() - this.startTime,
        message: msg,
      });

      original[level](...args);
    };

    console.log = (...args) => captureLog('log', args);
    console.info = (...args) => captureLog('info', args);
    console.warn = (...args) => captureLog('warn', args);
    console.error = (...args) => captureLog('error', args);
    console.debug = (...args) => captureLog('debug', args);

    console.log('✓ Console capture started');
  },

  // Patch fetch to capture network calls
  initFetchCapture() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options] = args;
      const method = options?.method || 'GET';
      const isApiCall = url.includes('/api/');

      if (isApiCall) {
        const startTime = Date.now();
        const reqInfo = {
          method,
          url,
          startTime: startTime - this.startTime,
          status: null,
          duration: null,
          error: null,
          responseSize: null,
        };

        try {
          const response = await originalFetch(...args);
          reqInfo.status = response.status;
          reqInfo.duration = Date.now() - startTime;

          // Clone response to read body
          const cloned = response.clone();
          try {
            const body = await cloned.text();
            reqInfo.responseSize = body.length;
            reqInfo.response = body.substring(0, 200); // First 200 chars
          } catch (e) {
            // ignore
          }

          this.requests.push(reqInfo);
          return response;
        } catch (error) {
          reqInfo.error = {
            name: error.name,
            message: error.message,
          };
          reqInfo.duration = Date.now() - startTime;
          this.requests.push(reqInfo);
          throw error;
        }
      }

      return originalFetch(...args);
    };

    console.log('✓ Fetch capture started');
  },

  // Format and display diagnostics
  formatDiagnostics() {
    const report = [];
    report.push('═══════════════════════════════════════════════════════');
    report.push('         ORGANIZATION PROFILE DIAGNOSTIC REPORT');
    report.push('═══════════════════════════════════════════════════════');
    report.push('');

    // System Info
    report.push('📊 SYSTEM INFORMATION');
    report.push('-'.repeat(60));
    report.push(`Timestamp: ${new Date().toISOString()}`);
    report.push(`Total Test Duration: ${Date.now() - this.startTime}ms`);
    report.push(`Total Logs Captured: ${this.logs.length}`);
    report.push(`Total API Calls: ${this.requests.length}`);
    report.push(`Total Errors: ${this.errors.length}`);
    report.push('');

    // Storage Check
    report.push('💾 STORAGE CHECK');
    report.push('-'.repeat(60));
    const token = sessionStorage.getItem('hunzal_token');
    const orgProfile = localStorage.getItem('org_profile');
    const currentUser =
      sessionStorage.getItem('current_user') || localStorage.getItem('current_user');

    report.push(
      `Token in sessionStorage: ${token ? '✓ Present (' + token.length + ' chars)' : '✗ Missing'}`
    );
    report.push(
      `Current User: ${currentUser ? '✓ ' + JSON.parse(currentUser)?.email : '✗ Missing'}`
    );
    report.push(
      `Cached org_profile: ${orgProfile ? '✓ ' + JSON.parse(orgProfile)?.name : '✗ Missing'}`
    );
    report.push('');

    // API Calls
    report.push('🌐 API CALLS CAPTURED');
    report.push('-'.repeat(60));
    this.requests.forEach((req, idx) => {
      const statusEmoji = req.status === 200 ? '✓' : req.error ? '✗' : '?';
      const statusOrError = req.status ? `${req.status}` : `${req.error?.name}`;
      report.push(`${idx + 1}. ${statusEmoji} ${req.method} ${req.url}`);
      report.push(`   Status: ${statusOrError}`);
      report.push(`   Duration: ${req.duration}ms`);
      if (req.responseSize) report.push(`   Response Size: ${req.responseSize} bytes`);
      if (req.response) report.push(`   Preview: ${req.response}`);
      report.push('');
    });

    // Key Logs (filtered for getOrganization and request)
    report.push('📝 KEY LOGS (Filtered)');
    report.push('-'.repeat(60));
    const keyLogs = this.logs.filter(
      (l) =>
        l.message.includes('[getOrganization]') ||
        l.message.includes('[request]') ||
        l.message.includes('[fetchProfile]') ||
        l.message.includes('AbortError') ||
        l.message.includes('NetworkError')
    );

    if (keyLogs.length > 0) {
      keyLogs.forEach((log) => {
        const emoji = log.level === 'error' ? '❌' : log.level === 'warn' ? '⚠️' : 'ℹ️';
        report.push(
          `${emoji} [${log.time}ms] ${log.level.toUpperCase()} ${log.message.substring(0, 100)}`
        );
      });
    } else {
      report.push('⚠️ No key logs found');
    }
    report.push('');

    // Recommendations
    report.push('💡 RECOMMENDATIONS');
    report.push('-'.repeat(60));

    const hasToken = !!token;
    const hasOrgProfile = !!orgProfile;
    const apiCalls = this.requests.filter((r) => r.url.includes('/api/organizations'));
    const successfulApiCall = apiCalls.some((r) => r.status === 200);

    if (!hasToken) {
      report.push('❌ No authentication token found. Login may have failed.');
    } else {
      report.push('✓ Token is present');
    }

    if (apiCalls.length === 0) {
      report.push(
        '❌ No /api/organizations calls detected. fetchProfile() may not have been called.'
      );
    } else if (successfulApiCall) {
      report.push(`✓ /api/organizations API call succeeded (200 OK)`);
    } else {
      report.push('❌ /api/organizations API call failed or returned error');
    }

    if (hasOrgProfile) {
      report.push('✓ Organization profile is cached in localStorage');
    } else {
      report.push('❌ Organization profile NOT in localStorage - fetch may have failed');
    }

    report.push('');
    report.push('═══════════════════════════════════════════════════════');

    return report.join('\n');
  },

  // Save and export diagnostics
  save() {
    const report = this.formatDiagnostics();

    // Log to console
    console.log('\n' + report);

    // Copy to clipboard
    navigator.clipboard
      .writeText(report)
      .then(() => {
        console.log('\n✓ Report copied to clipboard!');
      })
      .catch(() => {
        console.log('\n⚠️ Could not copy to clipboard. See report above.');
      });

    // Return for manual copy if needed
    return report;
  },
};

// Start capturing
DIAGNOSTIC.initConsoleCapture();
DIAGNOSTIC.initFetchCapture();

console.log('🚀 Diagnostic system ready!');
console.log('1. Complete your login and actions');
console.log('2. Run: DIAGNOSTIC.save()');
console.log('3. The report will be logged and copied to clipboard');
