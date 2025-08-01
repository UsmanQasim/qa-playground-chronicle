import { test, expect } from '@playwright/test';

test.describe('404 Page Tests', () => {
  test('should display 404 page for unknown routes', async ({ page }) => {
    // Visit an unknown route
    await page.goto('/nonexistent-page');

    // Verify 404 page elements
    await expect(page.locator('h1')).toContainText('404');
    await expect(page.locator('h2')).toContainText('Page Not Found');
    await expect(page.locator('text=Oops! The page you\'re looking for doesn\'t exist.')).toBeVisible();
    
    // Verify return home button
    await expect(page.locator('a[href="/"]')).toContainText('Return to Gallery');
  });

  test('should navigate back to gallery from 404 page', async ({ page }) => {
    await page.goto('/invalid-route');

    // Verify we're on 404 page
    await expect(page.locator('h1')).toContainText('404');

    // Click return to gallery button
    await page.click('a[href="/"]');

    // Should navigate to gallery
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Photo Gallery');
  });

  test('should log 404 errors to console', async ({ page }) => {
    const consoleLogs: string[] = [];
    
    // Listen for console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });

    await page.goto('/missing-page');

    // Verify error was logged
    expect(consoleLogs.some(log => 
      log.includes('404 Error: User attempted to access non-existent route: /missing-page')
    )).toBe(true);
  });

  test('should maintain navigation and theme on 404 page', async ({ page }) => {
    await page.goto('/nonexistent');

    // Verify navigation is still present
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav a[href="/"]')).toContainText('Gallery');
    await expect(page.locator('nav a[href="/jokes"]')).toContainText('Jokes');

    // Verify theme toggle is present
    await expect(page.locator('nav button[aria-label*="Switch to"]')).toBeVisible();

    // Test navigation from 404 page
    await page.click('nav a[href="/jokes"]');
    await expect(page).toHaveURL('/jokes');
    await expect(page.locator('h1')).toContainText('Dad Jokes');
  });

  test('should show 404 for routes with query parameters', async ({ page }) => {
    await page.goto('/nonexistent?param=value');

    await expect(page.locator('h1')).toContainText('404');
    await expect(page.locator('h2')).toContainText('Page Not Found');
  });

  test('should show 404 for nested routes', async ({ page }) => {
    await page.goto('/some/nested/route');

    await expect(page.locator('h1')).toContainText('404');
    await expect(page.locator('h2')).toContainText('Page Not Found');
  });
});