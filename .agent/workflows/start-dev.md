---
description: How to start the development environment
---

## Starting the Development Environment

// turbo-all

1. Start the backend server:
```bash
cd d:\Python\HCM_WEB
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

2. Start the frontend dev server:
```bash
cd d:\Python\HCM_WEB
npm run dev
```

3. Access the application at http://localhost:5173

## Test Credentials

- Username: `amer`
- Password: `amer123` (or check database)

## Stopping Services

- Press Ctrl+C in each terminal to stop the servers
