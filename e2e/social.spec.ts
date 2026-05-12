import { test, expect } from '@playwright/test';
import { register, generateUniqueUser } from './helpers/auth';
import { createArticle, generateUniqueArticle } from './helpers/articles';
import { followUser, unfollowUser } from './helpers/profile';

test.describe('Social Features', () => {
  test.afterEach(async ({ context }) => {
    // Close the browser context to ensure complete isolation between tests.
    // This releases browser instances, network connections, and other resources.
    await context.close();
    // Wait 500ms to allow async cleanup operations to complete.
    // Without this delay, running 6+ tests in sequence causes flaky failures
    // due to resource exhaustion (network connections, file descriptors, etc).
    // This timing issue manifests as timeouts when loading article pages.
    // This will be investigated and fixed later.
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  test('should follow and unfollow a user', async ({ page }) => {
    // Register our test user
    const user = generateUniqueUser();
    await register(page, user.username, user.email, user.password);

    // Follow an existing demo user (johndoe is always available on demo backend)
    await followUser(page, 'johndoe');

    // Button should change to Unfollow
    await expect(page.locator('[data-testid="follow-button"]:has-text("Unfollow")')).toBeVisible();

    // Unfollow johndoe
    await unfollowUser(page, 'johndoe');

    // Button should change back to Follow
    await expect(page.locator('[data-testid="follow-button"]:has-text("Follow")')).toBeVisible();
  });

  test('should view own profile', async ({ page }) => {
    const user = generateUniqueUser();
    await register(page, user.username, user.email, user.password);

    // Click on profile link
    await page.click('[data-testid="nav-profile"]');

    // Should show user information
    await expect(page.locator('[data-testid="profile-username"]')).toHaveText(user.username);

    // Should see Edit Profile Settings button (own profile)
    await expect(page.locator('[data-testid="edit-profile-settings"]')).toBeVisible();

    // Should not see Follow button (can't follow yourself)
    await expect(page.locator('[data-testid="follow-button"]')).not.toBeVisible();
  });

  test('should view other user profile', async ({ page }) => {
    // Register our test user
    const user = generateUniqueUser();
    await register(page, user.username, user.email, user.password);

    // Visit johndoe's profile (existing demo user)
    await page.goto('/profile/johndoe', { waitUntil: 'load' });

    // Wait for profile page to load
    await page.waitForSelector('[data-testid="profile-username"]', { timeout: 10000 });

    // Should show johndoe's information
    await expect(page.locator('[data-testid="profile-username"]')).toHaveText('johndoe');

    // Should see Follow button (other user's profile)
    await expect(page.locator('[data-testid="follow-button"]')).toBeVisible();

    // Should not see "Edit Profile Settings" button in the profile area
    await expect(page.locator('[data-testid="edit-profile-settings"]')).not.toBeVisible();

    // Should see johndoe's articles (demo backend has articles from johndoe)
    await expect(page.locator('[data-testid="article-preview"]').first()).toBeVisible();
  });

  test('should display user articles on profile', async ({ page }) => {
    const user = generateUniqueUser();
    await register(page, user.username, user.email, user.password);

    // Create multiple articles
    const article1 = generateUniqueArticle();
    const article2 = generateUniqueArticle();

    await createArticle(page, article1);
    await page.goto('/editor');
    await createArticle(page, article2);

    // Go to profile
    await page.goto(`/profile/${user.username}`);

    // Both articles should be visible (use .first() to avoid strict mode violation)
    await expect(page.locator(`h1:has-text("${article1.title}")`).first()).toBeVisible();
    await expect(page.locator(`h1:has-text("${article2.title}")`).first()).toBeVisible();
  });

  test('should display favorited articles on profile', async ({ page }) => {
    const user = generateUniqueUser();
    await register(page, user.username, user.email, user.password);

    // Go to global feed to find an existing article (can't favorite own articles)
    await page.goto('/', { waitUntil: 'load' });

    // Wait for articles to load
    await page.waitForSelector('[data-testid="article-preview"]', { timeout: 10000 });

    // Get the title of the first article in the feed
    const firstArticleTitle = await page.locator('[data-testid="article-preview-link"] h1').first().textContent();

    // Click on first article to go to its detail page
    await page.click('[data-testid="article-preview-link"] h1');
    await page.waitForURL(/\/article\/.+/, { timeout: 10000 });

    // Wait for article page to load
    await page.waitForSelector('[data-testid="favorite-button"]', { timeout: 10000 });

    // Check if already favorited, if not favorite it
    const isFavorited = (await page.locator('[data-testid="favorite-button"]:has-text("Unfavorite")').count()) > 0;
    if (!isFavorited) {
      await page.click('[data-testid="favorite-button"]:has-text("Favorite")');
      // Wait for the favorite to complete
      await page.waitForSelector('[data-testid="favorite-button"]:has-text("Unfavorite")', { timeout: 10000 });
    }

    // Go to profile and click Favorited tab
    await page.goto(`/profile/${user.username}`, { waitUntil: 'load' });
    await page.waitForSelector('a:has-text("Favorited")', { timeout: 3000 });
    await page.click('a:has-text("Favorited")');

    // Wait for URL to change then for articles to load
    await expect(page).toHaveURL(`/profile/${user.username}/favorites`);
    await expect(page.locator('[data-testid="article-preview"]').first()).toBeVisible({ timeout: 3000 });
  });

  test('should display followed users articles in feed', async ({ page }) => {
    // Register our test user
    const user = generateUniqueUser();
    await register(page, user.username, user.email, user.password);

    // Follow johndoe (existing demo user with articles)
    await followUser(page, 'johndoe');

    // Go to home and click "Your Feed"
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForSelector('[data-testid="feed-toggle"]', { timeout: 10000 });
    await page.click('[data-testid="feed-your"]');

    // Wait for articles to load
    await page.waitForSelector('[data-testid="article-preview"]', { timeout: 10000 });

    // Should see johndoe's articles in feed
    await expect(page.locator('[data-testid="article-preview"]').first()).toBeVisible();
  });
});
