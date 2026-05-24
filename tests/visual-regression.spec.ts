import { readdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

/**
 * One screenshot test per fixture in tests/fixtures/. The set auto-discovers,
 * so dropping the 8 reference artifacts (S1.7) in there extends coverage with
 * no code change. Each fixture renders at /_render/{name} (its filename without
 * .html is used as the artifact id by the dev filesystem fallback).
 */
const fixturesDir = path.join(__dirname, 'fixtures');

const fixtureNames = readdirSync(fixturesDir)
  .filter((file) => file.endsWith('.html'))
  .map((file) => path.basename(file, '.html'))
  .sort();

test.describe('artifact render fidelity', () => {
  for (const name of fixtureNames) {
    test(`renders ${name} within 2% of baseline`, async ({ page }) => {
      const response = await page.goto(`/_render/${name}`, { waitUntil: 'networkidle' });
      expect(response?.status(), `GET /_render/${name}`).toBe(200);

      await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
    });
  }
});
