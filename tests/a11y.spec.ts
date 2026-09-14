import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Checks', () => {
  test('homepage should not have any automatically detectable accessibility issues', async ({
    page,
    baseURL,
  }) => {
    test.skip(
      !baseURL,
      'Skipping accessibility test: no baseURL or test server running'
    );
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
