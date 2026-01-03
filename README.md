# 🚀 Hunzal People OS (HCM)

> **Enterprise-Grade Human Capital Management System**
> *AI-Driven • Compliance-First • Secure by Design*

![Status](https://img.shields.io/badge/Status-Active_Development-blue)
![Stack](https://img.shields.io/badge/Tech-React_Typescript_Python_FastAPI-teal)
![License](https://img.shields.io/badge/License-Proprietary-red)

## 📖 Overview

Hunzal People OS is a next-generation HCM platform designed to streamline workforce management. It combines a modern, responsive **React** frontend with a robust **Python (FastAPI)** backend, integrating AI capabilities for predictive analytics and intelligent automation.

**Key Features:**
- **Core HR**: Employee Lifecycle (Onboarding -> Offboarding), Payroll, Attendance, Leaves.
- **Admin**: Granular RBAC, System Settings, Audit Logging.
- **AI Engine**: Predictive attrition models, workforce intelligence.
- **Security**: JWT Authentication, Role-Based Access Control, Encrypted Data.

## 🏗️ Architecture

The project follows a modular Client-Server architecture:

- **Frontend**: React 18 (Vite) + TypeScript + Tailwind CSS.
  - State Management: Zustand
  - UI Library: Lucide Icons, Custom Design System
  - Location: `/src`

- **Backend**: Python 3.10+ (FastAPI).
  - Database: SQLite (Dev) / PostgreSQL (Prod Ready)
  - ORM: SQLAlchemy
  - Location: `/backend`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/hcm-web.git
    cd hcm-web
    ```

2.  **Setup Backend:**
    ```bash
    # Create virtual environment
    python -m venv .venv
    source .venv/bin/activate # or .venv\Scripts\activate on Windows

    # Install dependencies
    pip install -r requirements.txt

    # Initialize Database
    python -c "from backend.initialize_auth import seed_db; seed_db()"
    ```

3.  **Setup Frontend:**
    ```bash
    npm install
    ```

### Running the Application

- **Development Mode** (Run Frontend + Backend):
    ```bash
    # Start Backend (Port 8000)
    ./start_backend.bat

    # Start Frontend (Port 5173)
    npm run dev
    ```

- **Access the App:**
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📚 Documentation

Detailed documentation has been consolidated into the [`docs/`](./docs) directory:

- [**Implementation Plans**](./docs/plans/): Roadmap and task tracking.
- [**Reports**](./docs/reports/): Audit logs and verification reports.
- [**Architecture**](./docs/ARCHITECTURE.md): System design and data flow.
- [**Configuration**](./docs/CONFIGURATION.md): Environment variables and settings.
- [**Deployment**](./docs/DEPLOYMENT_GUIDE.md): Production deployment steps.

## 🛠️ Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | React, TypeScript | Application Logic |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Backend** | FastAPI | High-performance Python API |
| **Database** | SQLite / SQLAlchemy | Data Persistence |
| **Icons** | Lucide React | Consistent UI Icons |
| **State** | Zustand | Global State Management |

## 🧪 Testing

- **Frontend Tests**: `npm run test` (Vitest)
- **E2E Tests**: `npx playwright test`

---
*© 2026 Hunzal People OS. All Rights Reserved.*
