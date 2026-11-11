import { defineConfig } from '@playwright/test';
const database = process.env.TEST_DATABASE_URL;
if (
  !database ||
  !['localhost', '127.0.0.1'].includes(new URL(database).hostname) ||
  new URL(database).pathname !== '/emit_audit'
)
  throw new Error('Use the isolated local emit_audit database.');
export default defineConfig({
  testDir: './tests',
  timeout: 90000,
  workers: 1,
  use: {
    baseURL: 'http://localhost:5174',
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'node dist/src/main.js',
      cwd: '../backend',
      url: 'http://localhost:3001/api/referentiel/mentions',
      env: {
        DATABASE_URL: database,
        JWT_SECRET: 'local-audit-secret-not-for-production',
        PORT: '3001',
        FRONTEND_URL: 'http://localhost:5174',
        API_BASE_ETUDIANT_EMIT: 'http://127.0.0.1:1',
      },
      reuseExistingServer: false,
    },
    {
      command:
        'node node_modules/vite/bin/vite.js --host localhost --port 5174',
      url: 'http://localhost:5174',
      env: { VITE_API_LOCAL_URL: 'http://localhost:3001' },
      reuseExistingServer: false,
    },
  ],
});
