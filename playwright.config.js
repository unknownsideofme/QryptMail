import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45000,
  expect: {
    timeout: 8000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5175',
    trace: 'on-first-retry',
    channel: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 720 }
  },
  webServer: [
    {
      command: 'npm --prefix qrypt.mail.server run dev',
      url: 'http://localhost:5001/health',
      reuseExistingServer: true,
      timeout: 15000
    },
    {
      command: 'npm --prefix qrypt.mail.frontend run dev',
      url: 'http://localhost:5175',
      reuseExistingServer: true,
      timeout: 15000
    }
  ]
});
