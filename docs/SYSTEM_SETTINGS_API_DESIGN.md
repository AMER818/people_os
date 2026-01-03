System Settings API Design & DB Schema

Purpose
- Provide secure, auditable, and persistent server-side endpoints for System Settings operations currently handled client-side.
- Reduce security exposure (API keys, webhooks), enable audit logs, and support background jobs for heavy operations.

Auth & RBAC
- All endpoints under `/api/system/*` require authentication.
- Require `SystemAdmin` role (use existing `requires_role("SystemAdmin")` dependency) for write operations and sensitive reads.
- Read-only summary endpoints may allow elevated `OrgAdmin` role where safe.

High-level Endpoints

1) API Keys
- POST /api/system/api-keys
  - Payload: { name: string, scope: 'Read-only'|'Read/Write'|'Full Admin' }
  - Auth: SystemAdmin
  - Behavior: generate a secure random secret server-side, store hashed/encrypted form in DB, return created metadata + raw secret ONCE.
  - Response: { id, name, scope, key /* raw secret */, created_at, created_by }

- GET /api/system/api-keys
  - Auth: SystemAdmin
  - Response: list of keys with masked `key` (e.g. `hcm_*****abcd`) and metadata (no raw secret)

- DELETE /api/system/api-keys/{id}
  - Auth: SystemAdmin
  - Behavior: revoke/delete key, persist audit log

- POST /api/system/api-keys/{id}/rotate
  - Auth: SystemAdmin
  - Behavior: create new secret, replace stored hash, return new raw secret once; previous key revoked

DB Model (sqlalchemy / Alembic migration)
- api_keys
  - id: VARCHAR PK
  - name: VARCHAR
  - key_hash: VARCHAR (HMAC/SHA256 or encrypted blob)
  - scope: VARCHAR
  - created_by: VARCHAR (user id)
  - created_at: TIMESTAMP
  - last_used_at: TIMESTAMP NULLABLE
  - revoked: BOOLEAN DEFAULT FALSE
  - metadata: JSON NULLABLE

Security Notes (API Keys)
- Generate raw secret with crypto-secure RNG (32+ bytes, base64url).
- Store only hashed/encrypted secret.
- Return raw secret only on creation; frontend must show copy UI and then discard raw value from state.
- Use server-side rate limits and logging for API key usage.

2) Webhooks
- POST /api/system/webhooks
  - Payload: { name, url, events: string[] }
  - Auth: SystemAdmin
  - Response: webhook metadata

- GET /api/system/webhooks
  - Auth: SystemAdmin
  - Response: list (no secret data)

- PUT /api/system/webhooks/{id}
  - Auth: SystemAdmin
  - Behavior: update metadata

- DELETE /api/system/webhooks/{id}
  - Auth: SystemAdmin

- POST /api/system/webhooks/{id}/deliver (test)
  - Auth: SystemAdmin
  - Behavior: enqueue immediate delivery attempt and return delivery result or job id

DB Models
- webhooks
  - id, name, url, events JSON, status, created_by, created_at
- webhook_delivery_logs
  - id, webhook_id, attempted_at, status, response_code, response_body (truncated), latency_ms

3) System Flags / Settings
- GET /api/system/flags
  - Auth: SystemAdmin
  - Response: { flags: {...} }

- PUT /api/system/flags
  - Payload: Partial flags object
  - Behavior: validate fields, persist, add audit log

DB Model
- system_flags (single row per org)
  - id, org_id, flags JSON, updated_by, updated_at

4) AI Settings
- GET /api/system/ai
- PUT /api/system/ai
  - Store provider selection and metadata; DO NOT store raw API keys in plain text on server — prefer linking to api_keys mechanism or encrypt at rest.

5) Notification Settings
- GET /api/system/notifications
- PUT /api/system/notifications
  - For SMTP/sms creds: store encrypted and only return masked info to UI

6) Infrastructure Jobs
- POST /api/system/jobs/optimize-database -> returns job id
- POST /api/system/jobs/flush-cache -> returns job id
- POST /api/system/jobs/rotate-logs -> returns job id
- GET /api/system/jobs/{jobId} -> status, logs

Implementation Notes
- Use background job mechanism: simple DB-backed jobs table + worker process (or in-process async placeholder with status polling) depending on infra.
- All job requests require SystemAdmin.
- Jobs must emit infrastructure_logs entries and audit logs when complete.

Audit Logging
- Reuse existing `audit_logs` mechanism: call `api.saveAuditLog` or server-side create audit entries for each settings change.
- Record: user_id, action, before_state (masked), after_state (masked), timestamp, ip

Frontend Changes (quick wins)
- Replace `addApiKey` local generation with POST to `/api/system/api-keys` and handle returned raw key once.
- Show created key in a modal with clear instruction: "This key will only be shown once." After modal close, store only masked value in UI state.
- For webhooks, call server endpoints; use `POST /deliver` to test rather than simulating client-side.
- For `optimizeDatabase`, `flushCache`, `rotateLogs`, change store to call job endpoints and show job status.

Backward Compatibility
- Keep existing `useOrgStore` methods but change them to call the server; if server unavailable, fallback to previous optimistic behavior with visible warning.

Testing
- Integration tests: create key -> assert response contains raw secret; then GET list -> assert key masked and present; then DELETE/rotate -> assert previous key revoked.
- Webhook tests: create webhook -> simulate delivery -> assert webhook_delivery_logs entry

Migration Plan
1. Add DB tables for `api_keys`, `webhooks`, `webhook_delivery_logs`, `system_flags`, `jobs`.
2. Implement CRUD and endpoints in backend with role protection.
3. Adjust `useOrgStore` to call new endpoints.
4. Add E2E tests and run audit.

Estimated Effort
- Minimal safe PR (server endpoints + basic DB + frontend wiring for key creation & masking): 1.5 - 3 days
- Full job system + background worker + comprehensive tests: 3 - 6 days

Next Actions I can take now
- Create backend models + migration snippets and implement `api_keys` endpoints (low-risk).  
- Update `useOrgStore` to call new endpoints for `addApiKey` and `addWebhook` (low-risk UI change).  
- Add modal in `SystemSettings.tsx` to display the raw secret once (UI change).

Which of the next actions should I implement first? (I recommend: implement server `api_keys` endpoint + frontend wiring to show raw key once.)
