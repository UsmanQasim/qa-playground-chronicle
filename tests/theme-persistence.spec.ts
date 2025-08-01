import { test, expect } from '@playwright/test';

test.describe('Theme Persistence Tests', () => {
  test('should persist theme choice after page reload', async ({ page }) => {
    await page.goto('/');

    // Verify we start in light mode (default)
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    
    // Verify light mode button is visible (moon icon)
    await expect(page.locator('button[aria-label*="Switch to dark mode"]')).toBeVisible();

    // Switch to dark mode
    await page.click('button[aria-label*="Switch to dark mode"]');

    // Verify dark mode is applied
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // Verify dark mode button is visible (sun icon)
    await expect(page.locator('button[aria-label*="Switch to light mode"]')).toBeVisible();

    // Reload the page
    await page.reload();

    // Theme should persist - still in dark mode
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('button[aria-label*="Switch to light mode"]')).toBeVisible();

    // Switch back to light mode
    await page.click('button[aria-label*="Switch to light mode"]');
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // Reload again
    await page.reload();

    // Should now persist light mode
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await expect(page.locator('button[aria-label*="Switch to dark mode"]')).toBeVisible();
  });

  test('should maintain theme across different pages', async ({ page }) => {
    await page.goto('/');

    // Switch to dark mode on gallery page
    await page.click('button[aria-label*="Switch to dark mode"]');
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Navigate to jokes page
    await page.click('nav a[href="/jokes"]');
    await expect(page).toHaveURL('/jokes');

    // Theme should persist
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('button[aria-label*="Switch to light mode"]')).toBeVisible();

    // Navigate back to gallery
    await page.click('nav a[href="/"]');
    await expect(page).toHaveURL('/');

    // Theme should still persist
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should apply correct theme classes and styles', async ({ page }) => {
    await page.goto('/');

    // Test light mode styles
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    
    // Check background color in light mode
    const lightBg = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
    
    // Switch to dark mode
    await page.click('button[aria-label*="Switch to dark mode"]');
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // Check background color in dark mode
    const darkBg = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
    
    // Colors should be different
    expect(lightBg).not.toBe(darkBg);
  });

  test('should have accessible theme toggle button', async ({ page }) => {
    await page.goto('/');

    // Check button has proper aria-label
    const themeButton = page.locator('nav button').last();
    
    // In light mode
    await expect(themeButton).toHaveAttribute('aria-label', expect.stringContaining('Switch to dark mode'));
    
    // Click to switch to dark mode
    await themeButton.click();
    
    // In dark mode
    await expect(themeButton).toHaveAttribute('aria-label', expect.stringContaining('Switch to light mode'));
  });
});