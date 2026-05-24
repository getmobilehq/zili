import { defineConfig, devices } from '@playwright/test';

/**
 * Visual-regression harness (S1.6). Renders each reference artifact through the
 * real /_render pipeline and diffs it against a committed baseline. The DoD
 * gate is a >2% pixel difference (maxDiffPixelRatio 0.02).
 *
 * Baselines live in tests/snapshots/. Generate/update with
 * `pnpm test:e2e:update`, then verify each baseline visually before committing
 * (SK-11). The dev server serves artifacts from tests/fixtures/ via the
 * renderer's filesystem fallback when R2 is unconfigured.
 */
export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate: '{testDir}/snapshots/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1280, height: 800 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
