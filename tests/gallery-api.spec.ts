import { test, expect } from '@playwright/test';

test.describe('Gallery API Tests', () => {
  test('should intercept Picsum API and render exactly 12 images', async ({ page }) => {
    // Mock the Picsum API response
    const mockPhotos = Array.from({ length: 12 }, (_, i) => ({
      id: `${i + 1}`,
      author: `Test Author ${i + 1}`,
      width: 400,
      height: 300 + (i * 50), // Varying heights
      url: `https://picsum.photos/id/${i + 1}/400/400`,
      download_url: `https://picsum.photos/id/${i + 1}/400/400`
    }));

    await page.route('https://picsum.photos/v2/list?page=1&limit=12', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPhotos),
      });
    });

    // Mock individual image requests
    await page.route(/https:\/\/picsum\.photos\/id\/\d+\/\d+\/\d+/, async route => {
      // Return a simple 1x1 pixel image for testing
      const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      await route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: imageBuffer,
      });
    });

    await page.goto('/');

    // Wait for photos to load and verify exactly 12 images
    await expect(page.locator('img[alt*="Photo by"]')).toHaveCount(12);

    // Verify each image has the correct alt text format
    for (let i = 1; i <= 12; i++) {
      await expect(page.locator(`img[alt="Photo by Test Author ${i}"]`)).toBeVisible();
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('https://picsum.photos/v2/list?page=1&limit=12', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/');

    // Verify error banner is displayed
    await expect(page.locator('[class*="bg-destructive"]')).toBeVisible();
    await expect(page.locator('text=Error:')).toBeVisible();
    await expect(page.locator('text=Failed to fetch photos: 500')).toBeVisible();
  });

  test('should show loading skeletons initially', async ({ page }) => {
    // Delay the API response to test loading state
    await page.route('https://picsum.photos/v2/list?page=1&limit=12', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/');

    // Verify loading skeletons are visible
    await expect(page.locator('.animate-pulse')).toHaveCount(12);
    await expect(page.locator('text=Loading...')).toHaveCount(12);
  });
});