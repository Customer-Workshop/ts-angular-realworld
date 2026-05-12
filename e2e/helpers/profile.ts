import { Page } from '@playwright/test';

export async function followUser(page: Page, username: string) {
  await page.goto(`/profile/${username}`, { waitUntil: 'load' });
  // Wait for profile page to load and Follow button to appear
  await page.waitForSelector('[data-testid="follow-button"]', { timeout: 10000 });
  await page.click('[data-testid="follow-button"]');
}

export async function unfollowUser(page: Page, username: string) {
  await page.goto(`/profile/${username}`, { waitUntil: 'load' });
  // Wait for profile page to load and Unfollow button to appear
  await page.waitForSelector('[data-testid="follow-button"]:has-text("Unfollow")', { timeout: 10000 });
  await page.click('[data-testid="follow-button"]');
}

export async function updateProfile(
  page: Page,
  updates: {
    image?: string;
    username?: string;
    bio?: string;
    email?: string;
    password?: string;
  },
) {
  await page.goto('/settings', { waitUntil: 'load' });

  if (updates.image) {
    await page.fill('[data-testid="settings-image"]', updates.image);
  }
  if (updates.username) {
    await page.fill('[data-testid="settings-username"]', updates.username);
  }
  if (updates.bio) {
    await page.fill('[data-testid="settings-bio"]', updates.bio);
  }
  if (updates.email) {
    await page.fill('[data-testid="settings-email"]', updates.email);
  }
  if (updates.password) {
    await page.fill('[data-testid="settings-password"]', updates.password);
  }

  // Click submit and wait for API call to complete, then navigation
  await Promise.all([
    page.waitForResponse(response => response.url().includes('/user') && response.request().method() === 'PUT'),
    page.waitForURL(url => !url.toString().includes('/settings')),
    page.click('[data-testid="settings-submit"]'),
  ]);
}
