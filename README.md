# 🚀 PeopleOS (HCM)

> **Enterprise-Grade Human Capital Management System**
> _AI-Driven • Compliance-First • Secure by Design_

![Status](https://img.shields.io/badge/Status-Active_Development-blue)
![Stack](https://img.shields.io/badge/Tech-React_Typescript_Python_FastAPI-teal)
![License](https://img.shields.io/badge/License-Proprietary-red)

## 📖 Overview

PeopleOS is a next-generation HCM platform designed to streamline workforce management. It combines a modern, responsive **React** frontend with a robust **Python (FastAPI)** backend, integrating AI capabilities for predictive analytics and intelligent automation.

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

> **See the [PROJECT HANDBOOK](./docs/PROJECT_HANDBOOK.md) for the complete manual.**

The Handbook covers:

- **Architecture & System Diagrams**
- **The Golden Rules (Change Management)**
- **Security & RBAC Matrix (L0-L5)**
- **Configuration & Deployment**
- **Testing & Diagnostics Guide**

---

## 🚀 Quick Start

1. **Backend**: `./start_backend.bat` (Port 8000)
2. **Frontend**: `npm run dev` (Port 5173)
3. **Login**: `admin` / `admin123`

---

_© 2026 PeopleOS. All Rights Reserved._
