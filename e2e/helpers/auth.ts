import { Page } from '@playwright/test';

export async function register(page: Page, username: string, email: string, password: string) {
  await page.goto('/register', { waitUntil: 'load' });
  await page.fill('[data-testid="input-username"]', username);
  await page.fill('[data-testid="input-email"]', email);
  await page.fill('[data-testid="input-password"]', password);

  // Wait for navigation to complete or error to appear
  try {
    await Promise.all([page.waitForURL('/'), page.click('[data-testid="auth-submit"]')]);
  } catch (error) {
    // If navigation fails, check for errors
    const errorMsg = await page
      .locator('[data-testid="error-messages"]')
      .textContent()
      .catch(() => '');
    if (errorMsg) {
      throw new Error(`Registration failed: ${errorMsg}`);
    }
    throw error;
  }
}

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login', { waitUntil: 'load' });
  await page.fill('[data-testid="input-email"]', email);
  await page.fill('[data-testid="input-password"]', password);

  // Wait for navigation to complete or error to appear
  try {
    await Promise.all([page.waitForURL('/'), page.click('[data-testid="auth-submit"]')]);
  } catch (error) {
    // If navigation fails, check for errors
    const errorMsg = await page
      .locator('[data-testid="error-messages"]')
      .textContent()
      .catch(() => '');
    if (errorMsg) {
      throw new Error(`Login failed: ${errorMsg}`);
    }
    throw error;
  }
}

export async function logout(page: Page) {
  await page.click('[data-testid="nav-settings"]');
  await Promise.all([page.waitForURL('/'), page.click('[data-testid="logout-button"]')]);
}

export function generateUniqueUser() {
  const timestamp = Date.now();
  return {
    username: `testuser${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'password123',
  };
}
