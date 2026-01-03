# People OS - NexusHR (HCM_WEB)

A powerful, AI-integrated Human Capital Management (HCM) system designed for global orchestration of workforce intelligence.

## 🚀 Overview

NexusHR is a modern Enterprise Resource Planning (ERP) specialized in Human Resources. It features a high-performance React frontend, a robust FastAPI backend, and an integrated AI Heuristic Engine for predictive analytics and workforce optimization.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand (OrgStore, SystemStore, UIStore)
- **Styling**: Vanilla CSS with modern aesthetics (Glassmorphism, Vibrant Palettes)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Testing**: Vitest + React Testing Library

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: SQLite (SQLAlchemy ORM)
- **Authentication**: JWT with secure Bcrypt hashing
- **Task Management**: APScheduler
- **AI Integration**: Google Gemini AI (Heuristic Engine)

## 📦 Getting Started

### Prerequisites
- Python 3.10 or higher
- Node.js (v18+) and npm

### Environment Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd HCM_WEB
   ```

2. **Backend Setup**:
   Run the automatic setup script to create a self-contained virtual environment and install dependencies:
   ```bash
   setup_env.bat
   ```
   *Note: This script uses `--copies` to ensure environment independence.*

3. **Initialize Database**:
   ```bash
   .venv\Scripts\python.exe seed_organization.py
   ```
   This will create a fresh `hunzal_hcm.db` and seed the default **admin** user (Password: `admin`).

4. **Frontend Setup**:
   ```bash
   npm install
   ```

## 🏃 Running the Application

- **Server + Frontend (Dev Mode)**:
  ```bash
  launch_dev.bat
  ```
  Access the app at `http://localhost:5173`. Backend runs on `http://localhost:3002`.

- **Individual Components**:
  - Backend: `run_server.bat`
  - Frontend: `npm run dev`

## 🧪 Testing

### Frontend Tests
```bash
npm run test
```

### Backend Tests
```bash
pytest backend/tests
```

## 🛡️ Security
- **Bcrypt Hashing**: All passwords (including system users) are hashed using secure salt rounds.
- **RBAC**: Fine-grained Role-Based Access Control via `RBACContext` and `PermissionGate`.
- **Environment Isolation**: Sensitive keys are managed via `.env` (refer to `.env.example`).

## 📄 License
Internal / Proprietary

---
*Built with ❤️ for People OS*
