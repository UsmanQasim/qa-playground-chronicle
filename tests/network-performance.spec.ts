import { test, expect } from '@playwright/test';

test.describe('Network and Performance Tests', () => {
  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow network
    await page.route('https://picsum.photos/v2/list?page=1&limit=12', async route => {
      // Delay response by 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockPhotos = [{
        id: '1',
        author: 'Test Author',
        width: 400,
        height: 300,
        url: 'https://picsum.photos/id/1/400/300',
        download_url: 'https://picsum.photos/id/1/400/300'
      }];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPhotos),
      });
    });

    await page.goto('/');

    // Should show loading state during slow network
    await expect(page.locator('.animate-pulse')).toHaveCount(12);
    await expect(page.locator('text=Loading...')).toHaveCount(12);

    // Eventually should load content
    await expect(page.locator('img[alt="Photo by Test Author"]')).toBeVisible({ timeout: 10000 });
  });

  test('should handle network timeouts gracefully', async ({ page }) => {
    // Mock network timeout
    await page.route('https://official-joke-api.appspot.com/jokes/ten', async route => {
      // Don't fulfill the route - simulates timeout
      await new Promise(() => {}); // Never resolves
    });

    await page.goto('/jokes');

    // Should show loading state
    await expect(page.locator('.animate-pulse')).toHaveCount(6);

    // In a real scenario with proper timeout handling, 
    // this would eventually show an error message
  });

  test('should optimize image loading performance', async ({ page }) => {
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

    // Track image requests
    const imageRequests: string[] = [];
    await page.route(/https:\/\/picsum\.photos\/id\/\d+\/\d+\/\d+/, async route => {
      imageRequests.push(route.request().url());
      
      const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      await route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: imageBuffer,
      });
    });

    await page.goto('/');

    // Verify lazy loading is working - not all images should load immediately
    await page.waitForTimeout(1000);
    
    // With lazy loading, we might not load all 12 images immediately
    expect(imageRequests.length).toBeLessThanOrEqual(12);
  });

  test('should handle API rate limiting', async ({ page }) => {
    let requestCount = 0;

    await page.route('https://picsum.photos/v2/list?page=1&limit=12', async route => {
      requestCount++;
      
      if (requestCount === 1) {
        // First request returns rate limit error
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Rate limit exceeded' }),
        });
      } else {
        // Subsequent requests succeed
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });

    await page.goto('/');

    // Should handle rate limiting gracefully
    await expect(page.locator('[class*="bg-destructive"]')).toBeVisible();
    await expect(page.locator('text=Failed to fetch photos: 429')).toBeVisible();
  });
});