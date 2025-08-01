import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should not have any automatically detectable accessibility issues on Gallery page', async ({ page }) => {
    const mockPhotos = Array.from({ length: 3 }, (_, i) => ({
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

    // Wait for content to load
    await expect(page.locator('h1')).toContainText('Photo Gallery');

    // Run accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have any automatically detectable accessibility issues on Jokes page', async ({ page }) => {
    const mockJokes = [{
      id: 1,
      type: 'general',
      setup: 'Test setup',
      punchline: 'Test punchline'
    }];

    await page.route('https://official-joke-api.appspot.com/jokes/ten', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockJokes),
      });
    });

    await page.goto('/jokes');

    // Wait for content to load
    await expect(page.locator('h1')).toContainText('Dad Jokes');

    // Run accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab through navigation elements
    await page.keyboard.press('Tab'); // Focus on first link
    await expect(page.locator('nav a[href="/"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Focus on second link
    await expect(page.locator('nav a[href="/jokes"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Focus on theme button
    await expect(page.locator('nav button')).toBeFocused();

    // Test Enter key navigation
    await page.keyboard.press('Tab'); // Go back to first link
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Should navigate to jokes
    await expect(page).toHaveURL('/jokes');
  });

  test('should have proper focus management', async ({ page }) => {
    const mockJokes = [{
      id: 1,
      type: 'general',
      setup: 'Test setup',
      punchline: 'Test punchline'
    }];

    await page.route('https://official-joke-api.appspot.com/jokes/ten', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockJokes),
      });
    });

    await page.goto('/jokes');

    // Wait for content to load
    await expect(page.locator('button:has-text("Show Punchline")')).toBeVisible();

    // Tab to the show punchline button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Navigate to the button

    // Press Enter to activate
    await page.keyboard.press('Enter');

    // Verify punchline is shown and button text changed
    await expect(page.locator('text=Test punchline')).toBeVisible();
    await expect(page.locator('button:has-text("Hide Punchline")')).toBeFocused();
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/');

    // Check navigation has proper structure
    await expect(page.locator('nav')).toBeVisible();

    // Check theme button has proper aria-label
    await expect(page.locator('button[aria-label*="Switch to"]')).toBeVisible();

    // Check heading hierarchy
    await expect(page.locator('h1')).toContainText('Photo Gallery');
  });

  test('should support screen reader users with proper alt text', async ({ page }) => {
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

    await page.route(/https:\/\/picsum\.photos\/id\/\d+\/\d+\/\d+/, async route => {
      const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      await route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: imageBuffer,
      });
    });

    await page.goto('/');

    // Wait for image to load
    await expect(page.locator('img[alt="Photo by Test Author"]')).toBeVisible();

    // Verify alt text is descriptive and meaningful
    const altText = await page.locator('img').first().getAttribute('alt');
    expect(altText).toBeTruthy();
    expect(altText).toContain('Photo by');
    expect(altText!.length).toBeGreaterThan(5);
  });
});