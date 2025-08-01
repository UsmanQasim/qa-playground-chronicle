import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test('should navigate between Gallery and Jokes pages with correct URLs', async ({ page }) => {
    // Start on Gallery page
    await page.goto('/');
    
    // Verify we're on the Gallery page
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Photo Gallery');
    
    // Verify Gallery link is active
    await expect(page.locator('nav a[href="/"]')).toHaveClass(/bg-primary/);
    
    // Navigate to Jokes page
    await page.click('nav a[href="/jokes"]');
    
    // Verify we're on the Jokes page
    await expect(page).toHaveURL('/jokes');
    await expect(page.locator('h1')).toContainText('Dad Jokes');
    
    // Verify Jokes link is active
    await expect(page.locator('nav a[href="/jokes"]')).toHaveClass(/bg-primary/);
    
    // Navigate back to Gallery
    await page.click('nav a[href="/"]');
    
    // Verify we're back on Gallery
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Photo Gallery');
  });

  test('should show correct active link styling', async ({ page }) => {
    await page.goto('/');
    
    // Gallery should be active
    const galleryLink = page.locator('nav a[href="/"]');
    const jokesLink = page.locator('nav a[href="/jokes"]');
    
    await expect(galleryLink).toHaveClass(/bg-primary/);
    await expect(jokesLink).not.toHaveClass(/bg-primary/);
    
    // Navigate to jokes
    await page.click('nav a[href="/jokes"]');
    
    // Jokes should be active
    await expect(jokesLink).toHaveClass(/bg-primary/);
    await expect(galleryLink).not.toHaveClass(/bg-primary/);
  });
});