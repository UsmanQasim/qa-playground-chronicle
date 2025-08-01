import { test, expect } from '@playwright/test';

test.describe('Image Loading and Accessibility Tests', () => {
  test('should ensure all images have non-empty alt attributes', async ({ page }) => {
    // Mock the API for consistent testing
    const mockPhotos = Array.from({ length: 12 }, (_, i) => ({
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

    await page.goto('/');

    // Wait for images to load
    await expect(page.locator('img[alt*="Photo by"]')).toHaveCount(12);

    // Check that all images have non-empty alt attributes
    const images = await page.locator('img').all();
    
    for (const image of images) {
      const altText = await image.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText!.length).toBeGreaterThan(0);
      expect(altText).toMatch(/^Photo by Test Author \d+$/);
    }
  });

  test('should verify skeleton placeholder disappears after image load', async ({ page }) => {
    // Mock API response
    const mockPhotos = [{
      id: '1',
      author: 'Test Author',
      width: 400,
      height: 300,
      url: 'https://picsum.photos/id/1/400/300',
      download_url: 'https://picsum.photos/id/1/400/300'
    }];

    await page.route('https://picsum.photos/v2/list?page=1&limit=12', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPhotos),
      });
    });

    // First, show skeleton while image loads
    let imageLoaded = false;
    await page.route('https://picsum.photos/id/1/400/300', async route => {
      if (!imageLoaded) {
        // Delay the first request to test skeleton
        await new Promise(resolve => setTimeout(resolve, 500));
        imageLoaded = true;
      }
      
      const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      await route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: imageBuffer,
      });
    });

    await page.goto('/');

    // Initially, skeleton should be visible
    await expect(page.locator('.animate-pulse').first()).toBeVisible();

    // Wait for image to load and skeleton to disappear
    await expect(page.locator('img[alt="Photo by Test Author"]')).toBeVisible();
    
    // Skeleton should be gone
    await expect(page.locator('.animate-pulse')).toHaveCount(0);
  });

  test('should verify lazy loading behavior', async ({ page }) => {
    const mockPhotos = Array.from({ length: 3 }, (_, i) => ({
      id: `${i + 1}`,
      author: `Test Author ${i + 1}`,
      width: 400,
      height: 600, // Tall images to test lazy loading
      url: `https://picsum.photos/id/${i + 1}/400/600`,
      download_url: `https://picsum.photos/id/${i + 1}/400/600`
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

    await page.goto('/');

    // Verify images have loading="lazy" attribute
    const images = await page.locator('img[alt*="Photo by"]').all();
    
    for (const image of images) {
      const loadingAttr = await image.getAttribute('loading');
      expect(loadingAttr).toBe('lazy');
    }
  });
});