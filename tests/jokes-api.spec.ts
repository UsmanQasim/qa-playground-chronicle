import { test, expect } from '@playwright/test';

test.describe('Jokes API and Functionality Tests', () => {
  test('should fetch jokes and display them correctly', async ({ page }) => {
    // Mock the jokes API response
    const mockJokes = [
      {
        id: 1,
        type: 'general',
        setup: 'Why did the scarecrow win an award?',
        punchline: 'Because he was outstanding in his field!'
      },
      {
        id: 2,
        type: 'general',
        setup: 'What do you call a fake noodle?',
        punchline: 'An impasta!'
      },
      {
        id: 3,
        type: 'general',
        setup: 'Why don\'t scientists trust atoms?',
        punchline: 'Because they make up everything!'
      }
    ];

    await page.route('https://official-joke-api.appspot.com/jokes/ten', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockJokes),
      });
    });

    await page.goto('/jokes');

    // Verify page title
    await expect(page.locator('h1')).toContainText('Dad Jokes');

    // Verify all jokes are displayed
    await expect(page.locator('.bg-joke-card')).toHaveCount(3);

    // Verify joke content
    await expect(page.locator('text=Why did the scarecrow win an award?')).toBeVisible();
    await expect(page.locator('text=What do you call a fake noodle?')).toBeVisible();
    await expect(page.locator('text=Why don\'t scientists trust atoms?')).toBeVisible();

    // Verify all jokes have "Show Punchline" buttons initially
    await expect(page.locator('button:has-text("Show Punchline")')).toHaveCount(3);
  });

  test('should handle jokes API errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('https://official-joke-api.appspot.com/jokes/ten', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/jokes');

    // Verify error banner is displayed
    await expect(page.locator('[class*="bg-destructive"]')).toBeVisible();
    await expect(page.locator('text=Error:')).toBeVisible();
    await expect(page.locator('text=Failed to fetch jokes: 500')).toBeVisible();
  });

  test('should show loading skeletons while fetching jokes', async ({ page }) => {
    // Delay the API response
    await page.route('https://official-joke-api.appspot.com/jokes/ten', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/jokes');

    // Verify loading skeletons are visible
    await expect(page.locator('.animate-pulse')).toHaveCount(6);
  });
});