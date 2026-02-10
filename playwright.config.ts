import { defineConfig, devices } from '@playwright/test';

/**
 * 编辑器与发布流程 E2E 测试配置
 * 运行方式: pnpm run test:e2e（会先启动 dev 服务器）
 * 本地已有 dev 运行时可用: pnpm exec playwright test --project=no-server
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
