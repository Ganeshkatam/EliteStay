import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'iPhone SE (320px)', width: 320, height: 568 },
  { name: 'Android Baseline (360px)', width: 360, height: 800 },
  { name: 'iPhone Mini (375px)', width: 375, height: 812 },
  { name: 'iPhone 14/15 (390px)', width: 390, height: 844 },
  { name: 'Tablet (768px)', width: 768, height: 1024 },
  { name: 'Desktop (1280px)', width: 1280, height: 800 },
];

const ROUTES = [
  { path: '/', name: 'Homepage' },
  { path: '/s', name: 'Search Results' },
  { path: '/login', name: 'Authentication Login' },
  { path: '/signup', name: 'Authentication Signup' },
];

test.describe('Responsive UI v1 - Viewport Matrix & Root Invariant', () => {
  for (const vp of VIEWPORTS) {
    for (const route of ROUTES) {
      test(`${route.name} (${route.path}) at ${vp.name} [${vp.width}x${vp.height}] satisfies root overflow invariant`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route.path, { waitUntil: 'domcontentloaded' });

        // Evaluate root horizontal overflow: document root must not horizontally overflow the viewport window
        const overflowResult = await page.evaluate(() => {
          const root = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(root.scrollWidth, body.scrollWidth);
          const clientWidth = root.clientWidth;
          const windowWidth = window.innerWidth;
          // Allow 1px subpixel rendering tolerance
          const overflows = scrollWidth > windowWidth + 1;
          return {
            scrollWidth,
            clientWidth,
            windowWidth,
            overflows,
          };
        });

        expect(
          overflowResult.overflows,
          `Root horizontal overflow detected on ${route.path} at ${vp.name}: scrollWidth (${overflowResult.scrollWidth}px) > windowWidth (${overflowResult.windowWidth}px)`
        ).toBe(false);
      });
    }
  }
});
