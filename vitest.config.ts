import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/hcm_api/**',
      '**/backend/**',
      '**/ai_engine/**',
      '**/dist/**',
      '**/backup app/**',
      '**/legacy_archive/**',
      '**/deployments/**',
      '**/*.spec.ts', // Exclude Jest tests (NestJS uses .spec.ts)
    ],
    include: [
      '**/*.test.ts',
      '**/*.test.tsx',
      'tests/**/*.spec.ts', // Only E2E specs from tests folder
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'text-summary'],
      exclude: [
        'node_modules/',
        'dist/',
        'backup/',
        'backups/',
        'legacy_archive/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/*.config.js',
        '**/*.config.cjs',
        'test/',
        '**/types.ts',
        '**/*.spec.ts',
        'playwright.config.ts',
        'vite-env.d.ts',
      ],
      thresholds: {
        lines: 75,
        functions: 70,
        branches: 65,
        statements: 75,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@components': path.resolve(__dirname, './src/components'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
});
