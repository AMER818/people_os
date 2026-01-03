# HCM_WEB Cleanup & Restructuring Guide

## Phase 1: Emergency Cleanup (Do This First) 🚨

### Step 1: Protect Your Secrets
```bash
# Remove all .env files from git
git rm --cached .env.development
git rm --cached .env.production
git rm --cached .env.test

# Add to .gitignore
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore

# Rotate any exposed API keys/secrets immediately
```

### Step 2: Remove Unnecessary Files
```bash
# Remove database files
git rm hunzal_hrms.db.backup
echo "*.db" >> .gitignore
echo "*.db.backup" >> .gitignore

# Remove temp/test files
git rm temp_candidate.json
git rm test_audit.json
git rm test_results.json

# Remove test reports from git
git rm -r playwright-report/
git rm -r test-results/
echo "playwright-report/" >> .gitignore
echo "test-results/" >> .gitignore
```

### Step 3: Update .gitignore
```bash
# Add to .gitignore
cat >> .gitignore << EOF

# Environment files
.env*
!.env.example

# Database files
*.db
*.db.backup
*.sqlite
*.sqlite3

# Test outputs
playwright-report/
test-results/
coverage/
*.test.json

# Temporary files
temp_*
*.tmp

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
EOF
```

## Phase 2: Consolidate Documentation 📚

### Merge Your 25 Docs Into 5

**Keep These:**
1. `README.md` - Main project overview
2. `CONTRIBUTING.md` - How to contribute
3. `docs/ARCHITECTURE.md` - Technical architecture
4. `docs/DEPLOYMENT.md` - Deployment guide
5. `docs/API.md` - API documentation

**Delete These (merge content into above):**
- `AUDIT_REPORT.md` → Move to `docs/` if needed
- `CHANGELOG.md` → Use GitHub Releases instead
- `CONFIGURATION.md` → Merge into README
- `DEPLOYMENT_GUIDE.md` → Rename to `docs/DEPLOYMENT.md`
- `DEVELOPMENT_PLAN.md` → Delete (use Issues/Projects)
- `DOCUMENTATION.md` → Delete (meta-doc about docs?)
- `EMPLOYEE_*.md` → Move to `docs/modules/`
- `FINAL_HANDOVER.md` → Delete or archive
- `FUTURE_ROADMAP.md` → Use GitHub Projects
- `IMPLEMENTATION_PLAN.md` → Use GitHub Issues
- `LIBRARIES.md` → Merge into README tech stack
- `POSTGRES_MIGRATION.md` → Move to `docs/migrations/`
- `PROJECT_SUMMARY.md` → Merge into README
- `RESTART_INSTRUCTIONS.md` → Merge into README
- `TASK.md` → Use GitHub Issues
- `VERIFICATION_REPORT.md` → Delete
- `WALKTHROUGH.md` → Merge into README

### New README.md Structure
```markdown
# HCM Web - Human Capital Management System

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)](https://www.python.org/)

Modern Human Capital Management system with AI-powered features.

## Features

- 👥 Employee Management
- 📊 Organization Structure
- 🤖 AI-Powered Analytics
- 📈 Performance Tracking
- 📅 Attendance & Leave Management

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (Build tool)
- TailwindCSS (Styling)
- Zustand (State management)

**Backend:**
- Python (AI Engine)
- Node.js/Express (API)
- PostgreSQL (Database)

**Testing:**
- Vitest (Unit tests)
- Playwright (E2E tests)

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+

### Installation

1. Clone the repository
```bash
git clone https://github.com/aamerjaved818/HCM_WEB.git
cd HCM_WEB
```

2. Install dependencies
```bash
npm install
cd backend && pip install -r requirements.txt
```

3. Setup environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run migrations
```bash
npm run db:migrate
```

5. Start development servers
```bash
npm run dev        # Frontend (port 5173)
npm run dev:api    # Backend API (port 3000)
npm run dev:ai     # AI Engine (port 8000)
```

Visit `http://localhost:5173`

## Project Structure

```
HCM_WEB/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom hooks
│   ├── store/             # State management
│   └── utils/             # Utilities
├── backend/               # Backend services
│   ├── api/              # REST API
│   ├── ai_engine/        # AI/ML features
│   └── migrations/       # Database migrations
├── tests/                # Test files
│   ├── unit/
│   └── e2e/
└── docs/                 # Documentation
```

## Available Scripts

- `npm run dev` - Start frontend dev server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run lint` - Lint code
- `npm run format` - Format code

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing](./CONTRIBUTING.md)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT License - See LICENSE file for details
```

## Phase 3: Restructure Directories 📁

### Proposed New Structure

```bash
HCM_WEB/
├── .github/
│   └── workflows/          # CI/CD pipelines
├── .husky/                 # Git hooks
├── docs/                   # All documentation
│   ├── architecture/
│   ├── api/
│   └── guides/
├── src/                    # Frontend application
│   ├── app/               # Main app setup
│   ├── components/        # Reusable components
│   │   ├── ui/           # Base UI components
│   │   └── features/     # Feature-specific components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── store/            # State management (Zustand)
│   ├── services/         # API services
│   ├── types/            # TypeScript types
│   ├── utils/            # Helper functions
│   └── styles/           # Global styles
├── backend/               # Backend services
│   ├── api/              # REST API (Node.js)
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── models/
│   ├── ai_engine/        # Python AI/ML service
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   └── shared/           # Shared backend code
├── tests/                 # All tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/               # Build/deployment scripts
│   ├── deploy.sh
│   ├── migrate.sh
│   └── seed.sh
├── config/                # Configuration files
│   ├── database.config.ts
│   └── app.config.ts
├── public/                # Static assets
├── .env.example           # Example environment variables
├── package.json
├── tsconfig.json
└── README.md
```

### Migration Commands

```bash
# Create new structure
mkdir -p docs/{architecture,api,guides}
mkdir -p src/{app,components/{ui,features},pages,hooks,store,services,types,utils,styles}
mkdir -p backend/{api/{routes,controllers,middleware,models},ai_engine/{models,services,utils},shared}
mkdir -p tests/{unit,integration,e2e}
mkdir -p scripts config

# Move files
mv components/* src/components/
mv hooks/* src/hooks/
mv store/* src/store/
mv services/* src/services/
mv utils/* src/utils/

# Move root TypeScript files
mv App.tsx src/app/
mv index.tsx src/
mv types.ts src/types/

# Move backend
mv hcm_api/* backend/api/ 2>/dev/null || true
mv ai_engine/* backend/ai_engine/

# Move tests
mv test/* tests/unit/
mv tests/e2e tests/e2e

# Move scripts
mv *.bat scripts/
mv *.ps1 scripts/

# Clean up empty directories
find . -type d -empty -delete
```

## Phase 4: Modernize Deployment 🚀

### Replace Batch Files with npm Scripts

**Update package.json:**
```json
{
  "scripts": {
    "dev": "vite",
    "dev:api": "cd backend/api && npm run dev",
    "dev:ai": "cd backend/ai_engine && python -m uvicorn main:app --reload",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:api\" \"npm run dev:ai\"",
    
    "build": "tsc && vite build",
    "build:api": "cd backend/api && npm run build",
    
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:coverage": "vitest --coverage",
    
    "lint": "eslint . --ext ts,tsx",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    
    "db:migrate": "node scripts/migrate.js",
    "db:seed": "node scripts/seed.js",
    "db:reset": "npm run db:migrate && npm run db:seed",
    
    "deploy:staging": "node scripts/deploy.js --env=staging",
    "deploy:prod": "node scripts/deploy.js --env=production",
    
    "prepare": "husky install"
  }
}
```

### Setup CI/CD with GitHub Actions

**Create .github/workflows/ci.yml:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Build
        run: npm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Staging
        run: npm run deploy:staging
        env:
          DEPLOY_KEY: ${{ secrets.STAGING_DEPLOY_KEY }}

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Production
        run: npm run deploy:prod
        env:
          DEPLOY_KEY: ${{ secrets.PROD_DEPLOY_KEY }}
```

## Phase 5: Fix TypeScript Configuration ⚙️

### Update tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@store/*": ["src/store/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Update vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@store': path.resolve(__dirname, './src/store'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/ai': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
```

## Phase 6: Backend Consolidation 🔧

### Choose Your Architecture

**Option A: Monolithic Node.js API (Recommended for small teams)**
```
backend/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── validators/
│   ├── ai/
│   │   ├── services/
│   │   └── models/
│   ├── database/
│   │   ├── models/
│   │   ├── migrations/
│   │   └── seeds/
│   └── utils/
├── tests/
└── package.json
```

**Option B: Microservices (For larger scale)**
```
backend/
├── services/
│   ├── api/          # Main REST API (Node.js)
│   ├── ai/           # AI/ML Service (Python)
│   ├── auth/         # Authentication Service
│   └── notifications/ # Notification Service
├── shared/           # Shared code/types
└── docker-compose.yml
```

### Database Choice

**Migrate from SQLite to PostgreSQL:**

```bash
# Install PostgreSQL locally or use Docker
docker run --name hcm-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Update .env.example
cat > .env.example << EOF
DATABASE_URL=postgresql://user:password@localhost:5432/hcm_db
NODE_ENV=development
API_PORT=3000
AI_PORT=8000
JWT_SECRET=your-secret-key
EOF
```

## Phase 7: Git Hygiene 🧹

### Commit Strategy

```bash
# Create feature branch
git checkout -b cleanup/restructure-project

# Stage changes in logical groups
git add .gitignore
git commit -m "chore: update .gitignore with security best practices"

git add README.md
git commit -m "docs: rewrite README with comprehensive setup guide"

git add src/
git commit -m "refactor: reorganize frontend structure"

git add backend/
git commit -m "refactor: consolidate backend services"

git add .github/
git commit -m "ci: add GitHub Actions workflow"

# Push and create PR
git push origin cleanup/restructure-project
```

### Branching Strategy

```
main          (production)
  ├── develop (integration)
      ├── feature/employee-module
      ├── feature/ai-analytics
      ├── bugfix/login-issue
      └── hotfix/critical-security-patch
```

## Phase 8: Developer Experience 🎨

### Setup Pre-commit Hooks

```bash
# Install husky
npm install --save-dev husky lint-staged

# Initialize
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

**Add to package.json:**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Setup VSCode Workspace

**Create .vscode/settings.json:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

**Create .vscode/extensions.json:**
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright"
  ]
}
```

## Phase 9: Testing Strategy 🧪

### Test Structure

```
tests/
├── unit/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── utils/
├── integration/
│   ├── api/
│   └── database/
└── e2e/
    ├── auth.spec.ts
    ├── employee.spec.ts
    └── dashboard.spec.ts
```

### Example Test Setup

**tests/unit/components/Button.test.tsx:**
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    await userEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Phase 10: Monitoring & Logging 📊

### Add Error Tracking

```bash
npm install @sentry/react @sentry/tracing
```

**src/app/sentry.ts:**
```typescript
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}
```

### Add Analytics

```typescript
// src/services/analytics.ts
export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (import.meta.env.PROD) {
      // Send to your analytics provider
      console.log('Analytics:', event, properties);
    }
  },
};
```

## Quick Win Checklist ✅

Day 1:
- [ ] Remove .env files from git
- [ ] Clean up temp/test files
- [ ] Update .gitignore
- [ ] Rotate any exposed secrets

Day 2:
- [ ] Consolidate docs (25 → 5)
- [ ] Write proper README
- [ ] Move files to src/

Day 3:
- [ ] Consolidate backend structure
- [ ] Replace batch files with npm scripts
- [ ] Update tsconfig.json

Day 4:
- [ ] Setup GitHub Actions
- [ ] Add pre-commit hooks
- [ ] Configure VSCode workspace

Day 5:
- [ ] Write basic tests
- [ ] Setup Sentry
- [ ] Deploy to staging

## Resources 📚

- [12 Factor App](https://12factor.net/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Remember:** Don't try to do everything at once. Pick one phase, execute it, commit it, then move to the next. Small consistent improvements beat massive rewrites.

Good luck! 🚀