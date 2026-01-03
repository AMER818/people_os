# System Configuration Standard (Proposed)

To ensure uniformity across all environments, the following constants are proposed as the **Single Source of Truth**.

### 1. Port Assignments
| Environment | Port | Usage | Script |
| :--- | :--- | :--- | :--- |
| **Live Server** | `5000` | Development (Hot Reload) | `run_app.bat` |
| **Test Server** | `4000` | Production Preview (Build + Serve) | `run_tests.bat` |
| **Production** | `3000` | Real World Deployment (Node.js) | `run_production.bat` |
| **Backend API** | `2000` | Python FastAPI Server | `run_backend.bat` |

### 2. File Organization
All configurations should reside in:
- `d:/Python/HCM_WEB/.env` (Environment Variables)
- `d:/Python/HCM_WEB/vite.config.ts` (Consumes .env)
- `d:/Python/HCM_WEB/config/constants.ts` (Frontend constants)

### 3. Proposed Changes
1.  Create `.env` file with these exact values.
2.  Update `vite.config.ts` to read ports from `.env`.
3.  Update `server.cjs` to read port from `.env` (or fallback to 3000).
4.  Update `App.tsx` badge logic to use imported constants instead of hardcoded numbers.

**Do you approve this standard?**
