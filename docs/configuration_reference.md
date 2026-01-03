# Application Configuration & Environment Reference

This document serves as the single source of truth for the application's runtime configuration, port assignments, and startup scripts.

## 🌍 Environment Configuration

The application is configured to run in two distinct modes to separate verified code from work-in-progress.

| Environment | Purpose | Port | Script | URL |
|-------------|---------|------|--------|-----|
| **Live Server** | Active Development (Hot Reloading) | `5050` | `run_app.bat` | [http://localhost:5050](http://localhost:5050) |
| **Test Server** | Production Preview (Verified Build) | `4040` | `run_tests.bat` | [http://localhost:4040](http://localhost:4040) |
| **Production** | Full Deployment (Node Server) | `3000` | `dep_production.bat` | [http://localhost:3000](http://localhost:3000) |

## 🛠️ Startup Scripts

### 1. `run_app.bat` (Live)
- **Mode**: `development` (`npm run dev`)
- **Port**: `8080`
- **Features**: Hot Module Replacement (HMR), React Error Overlay.
- **Use Case**: Daily development and debugging.

### 2. `run_tests.bat` (Test)
- **Mode**: `production` (`npm run build` + `npm run preview`)
- **Port**: `4040`
- **Features**: Minified build, optimized performance, clean state.
- **Use Case**: Verifying the build before deployment.

## ⚙️ Configuration Files

### `vite.config.ts`
Defines the server ports and preview settings.

```typescript
export default defineConfig({
  server: {
    port: 5050,       // Live Server (Development)
    host: '0.0.0.0', // Allow network access
    open: true,
  },
  preview: {
    port: 4040,       // Test Server (Production Preview)
    host: '0.0.0.0',
  }
})
```

### `package.json`
Defines the core scripts.

```json
"scripts": {
  "dev": "vite",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview --port 4040"
}
```

## 🔍 Debugging Info
- **Live Server Blank Screen**: If `localhost:8080` is blank, check the console for "application failed to mount". The entry point `index.tsx` contains a try-catch block to display startup errors on-screen.
- **Cache Clearing**: If weird issues persist, run:
  ```powershell
  rmdir /s /q node_modules/.vite
  ```
