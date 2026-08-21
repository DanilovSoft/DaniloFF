// @ts-check
import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: true,
  workers: 2,
  reporter: [['html', { outputFolder: 'tests/report', open: 'never' }], ['list']],

  // Эталоны общие для всех платформ: тесты запускаются только в образе
  // Playwright (npm run test:visual), поэтому суффикс ОС в имени не нужен.
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',

  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      // Небольшой допуск на субпиксельное сглаживание текста.
      maxDiffPixelRatio: 0.002,
    },
  },

  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    command: `node tests/static-server.mjs`,
    url: `http://127.0.0.1:${PORT}/index.html`,
    reuseExistingServer: false,
    env: { PORT: String(PORT) },
  },
});
