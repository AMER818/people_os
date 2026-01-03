# System Configuration Standard (Cheat Sheet)

## 🚀 Quick Reference
| Port | Name | Simple Explanation |
| :--- | :--- | :--- |
| **5000** | **LIVE (Construction Site)** | Use this while **Coding**. It updates specifically as you type. (Hot Reload) |
| **4000** | **TEST (Inspection)** | Check this before going live. It looks exactly like the real app but is safe to break. |
| **3000** | **PROD (Showroom)** | This is the final version your users will see. Optimized for speed. |
| **2000** | **API (The Brain)** | The backend server. It handles data, logic, and saves things to the database. |

---

# Detailed Configuration Standard
 (Proposed)

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
- `d:/Python/HCM_WEB/backend/data/hunzal_hcm.db` (Primary Database)
- `d:/Python/HCM_WEB/config/constants.ts` (Frontend constants)

### 3. Proposed Changes
1.  Create `.env` file with these exact values.
2.  Update `vite.config.ts` to read ports from `.env`.
3.  Update `server.cjs` to read port from `.env` (or fallback to 3000).
4.  Update `App.tsx` badge logic to use imported constants instead of hardcoded numbers.

**Do you approve this standard?**
