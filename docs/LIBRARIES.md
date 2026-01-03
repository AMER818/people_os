# 📚 Project Libraries & Dependencies

**Version:** 2.0 (Split Brain Architecture)
**Date:** 2025-12-29

---

## 🏗️ Backend (NestJS)

**Configured in:** `hcm_api/package.json`

### Core Framework
| Library | Version | Purpose |
|---------|---------|---------|
| `@nestjs/core` | ^11.0.1 | Main framework runtime |
| `@nestjs/common` | ^11.0.1 | Common utilities & decorators |
| `@nestjs/platform-express` | ^11.0.1 | Underlying HTTP server |

### Security & Auth
| Library | Version | Purpose |
|---------|---------|---------|
| `@nestjs/jwt` | ^11.0.2 | JSON Web Token handling |
| `@nestjs/passport` | ^11.0.5 | Authentication middleware |
| `bcrypt` | ^6.0.0 | Password hashing |
| `passport-jwt` | ^4.0.1 | JWT strategy |

### Data & Caching
| Library | Version | Purpose |
|---------|---------|---------|
| `@prisma/client` | ^5.22.0 | ORM for Database access |
| `sqlite3` | ^5.1.7 | SQLite database driver |
| `cache-manager` | ^7.2.7 | Caching abstraction layer |
| `cache-manager-redis-store` | ^3.0.1 | Redis storage engine |

---

## 🧠 AI Engine (Python)

**Configured in:** `ai_engine/requirements.txt`

### Runtime & API
| Library | Version | Purpose |
|---------|---------|---------|
| `fastapi` | Latest | High-performance API framework |
| `uvicorn` | Latest | ASGI Server |
| `requests` | Latest | HTTP Client for Internal API calls |

### Data Processing
| Library | Version | Purpose |
|---------|---------|---------|
| `pydantic` | Latest | Data validation & settings |
| `sqlalchemy` | Latest | Database toolkit (Future use) |

---

## 🎨 Frontend (React)

**Configured in:** `package.json` (Root)

### UI & UX
| Library | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.2.0 | UI Library |
| `lucide-react` | ^0.294.0 | Icon set |
| `recharts` | ^2.10.3 | Data visualization charts |
| `tailwindcss` | ^3.4.0 | Styling framework |

### State & Logic
| Library | Version | Purpose |
|---------|---------|---------|
| `zustand` | (In Plan) | State management |
| `date-fns` | (In Plan) | Date manipulation |

---

## 🛠️ Dev Tools

| Tool | Version | Purpose |
|------|---------|---------|
| `vite` | ^5.0.0 | Frontend build tool |
| `typescript` | ^5.3.0 | Static typing |
| `eslint` | ^8.55.0 | Linting |
| `prettier` | ^3.1.0 | Code formatting |
| `prisma` | ^5.22.0 | Database schema management |

---
