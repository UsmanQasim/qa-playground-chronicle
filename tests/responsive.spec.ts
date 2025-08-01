import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');

    // Navigation should be visible and functional on mobile
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav a[href="/"]')).toBeVisible();
    await expect(page.locator('nav a[href="/jokes"]')).toBeVisible();

    // Gallery should adapt to mobile layout
    await expect(page.locator('h1')).toContainText('Photo Gallery');
    
    // Navigate to jokes page on mobile
    await page.click('nav a[href="/jokes"]');
    await expect(page).toHaveURL('/jokes');
  });

  test('should adapt masonry layout on different screen sizes', async ({ page }) => {
    // Mock some photos for testing
    const mockPhotos = Array.from({ length: 6 }, (_, i) => ({
      id: `${i + 1}`,
      author: `Test Author ${i + 1}`,
      width: 400,
      height: 300,
      url: `https://picsum.photos/id/${i + 1}/400/300`,
      download_url: `https://picsum.photos/id/${i + 1}/400/300`
    }));

    await page.route('https://picsum.photos/v2/list?page=1&limit=12', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPhotos),
      });
    });

    await page.route(/https:\/\/picsum\.photos\/id\/\d+\/\d+\/\d+/, async route => {
      const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      await route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: imageBuffer,
      });
    });

    // Test desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    const galleryContainer = page.locator('.columns-1');
    await expect(galleryContainer).toBeVisible();

    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(galleryContainer).toBeVisible();

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await expect(galleryContainer).toBeVisible();
  });

  test('should maintain functionality across different viewport sizes', async ({ page }) => {
    const mockJoke = {
      id: 1,
      type: 'general',
      setup: 'Test setup',
      punchline: 'Test punchline'
    };

    await page.route('https://official-joke-api.appspot.com/jokes/ten', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockJoke]),
      });
    });

    // Test on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/jokes');

    // Joke functionality should work on mobile
    await expect(page.locator('button:has-text("Show Punchline")')).toBeVisible();
    await page.click('button:has-text("Show Punchline")');
    await expect(page.locator('text=Test punchline')).toBeVisible();

    // Like button should work on mobile
    const likeButton = page.locator('button:has(svg)');
    await expect(likeButton).toContainText('0');
    await likeButton.click();
    await expect(likeButton).toContainText('1');

    // Test on desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();

    // Functionality should still work on desktop
    await expect(page.locator('button:has-text("Show Punchline")')).toBeVisible();
  });
});