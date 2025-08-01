import { test, expect } from '@playwright/test';

test.describe('Joke Interaction Tests', () => {
  test('should toggle punchline visibility and button text', async ({ page }) => {
    // Mock a single joke for testing
    const mockJoke = {
      id: 1,
      type: 'general',
      setup: 'Why did the scarecrow win an award?',
      punchline: 'Because he was outstanding in his field!'
    };

    await page.route('https://official-joke-api.appspot.com/jokes/ten', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockJoke]),
      });
    });

    await page.goto('/jokes');

    // Wait for joke to load
    await expect(page.locator('text=Why did the scarecrow win an award?')).toBeVisible();

    // Initially, punchline should be hidden
    await expect(page.locator('text=Because he was outstanding in his field!')).not.toBeVisible();
    await expect(page.locator('button:has-text("Show Punchline")')).toBeVisible();

    // Click to show punchline
    await page.click('button:has-text("Show Punchline")');

    // Punchline should now be visible
    await expect(page.locator('text=Because he was outstanding in his field!')).toBeVisible();
    await expect(page.locator('button:has-text("Hide Punchline")')).toBeVisible();

    // Click to hide punchline
    await page.click('button:has-text("Hide Punchline")');

    // Punchline should be hidden again
    await expect(page.locator('text=Because he was outstanding in his field!')).not.toBeVisible();
    await expect(page.locator('button:has-text("Show Punchline")')).toBeVisible();
  });

  test('should increment like counter for individual jokes', async ({ page }) => {
    // Mock multiple jokes for testing isolation
    const mockJokes = [
      {
        id: 1,
        type: 'general',
        setup: 'First joke setup',
        punchline: 'First punchline'
      },
      {
        id: 2,
        type: 'general',
        setup: 'Second joke setup',
        punchline: 'Second punchline'
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

    // Wait for jokes to load
    await expect(page.locator('.bg-joke-card')).toHaveCount(2);

    // Get like buttons for each joke
    const likeButtons = page.locator('button:has(svg)');
    
    // Initially, both should show 0 likes
    await expect(likeButtons.nth(0)).toContainText('0');
    await expect(likeButtons.nth(1)).toContainText('0');

    // Click like on first joke multiple times
    await likeButtons.nth(0).click();
    await expect(likeButtons.nth(0)).toContainText('1');
    await expect(likeButtons.nth(1)).toContainText('0'); // Second joke should still be 0

    await likeButtons.nth(0).click();
    await expect(likeButtons.nth(0)).toContainText('2');
    await expect(likeButtons.nth(1)).toContainText('0');

    // Click like on second joke
    await likeButtons.nth(1).click();
    await expect(likeButtons.nth(0)).toContainText('2'); // First joke should remain 2
    await expect(likeButtons.nth(1)).toContainText('1');

    // Click like on second joke again
    await likeButtons.nth(1).click();
    await expect(likeButtons.nth(0)).toContainText('2');
    await expect(likeButtons.nth(1)).toContainText('2');
  });

  test('should maintain joke state independence', async ({ page }) => {
    // Mock jokes
    const mockJokes = [
      {
        id: 1,
        type: 'general',
        setup: 'Joke 1 setup',
        punchline: 'Joke 1 punchline'
      },
      {
        id: 2,
        type: 'general',
        setup: 'Joke 2 setup',
        punchline: 'Joke 2 punchline'
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

    // Wait for jokes to load
    await expect(page.locator('.bg-joke-card')).toHaveCount(2);

    // Show punchline for first joke only
    const showPunchlineButtons = page.locator('button:has-text("Show Punchline")');
    await showPunchlineButtons.nth(0).click();

    // First joke punchline should be visible, second should not
    await expect(page.locator('text=Joke 1 punchline')).toBeVisible();
    await expect(page.locator('text=Joke 2 punchline')).not.toBeVisible();

    // Verify button states
    await expect(page.locator('button:has-text("Hide Punchline")')).toHaveCount(1);
    await expect(page.locator('button:has-text("Show Punchline")')).toHaveCount(1);
  });
});