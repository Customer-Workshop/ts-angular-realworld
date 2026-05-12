import { test, expect } from '@playwright/test';
import { register, login, logout, generateUniqueUser } from './helpers/auth';
import { getToken, getAuthState } from './helpers/debug';

test.describe('Authentication', () => {
  test('should register a new user', async ({ page }) => {
    const user = generateUniqueUser();
    await register(page, user.username, user.email, user.password);
    // Should be redirected to home page
    await expect(page).toHaveURL('/');
    // Should see username in header
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible();
    // Should be able to access editor
    await page.click('[data-testid="nav-new-article"]');
    await expect(page).toHaveURL('/editor');
  });

  test('should login with existing user', async ({ page }) => {
    const user = generateUniqueUser();
    // First register a user
    await register(page, user.username, user.email, user.password);
    // Logout
    await logout(page);
    // Should see Sign in link
    await expect(page.locator('[data-testid="nav-sign-in"]')).toBeVisible();
    // Login again
    await login(page, user.email, user.password);
    // Should be logged in
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible();
  });

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', 'nonexistent@example.com');
    await page.fill('[data-testid="input-password"]', 'wrongpassword');
    await page.click('[data-testid="auth-submit"]');
    // Should show error message
    await expect(page.locator('[data-testid="error-messages"]')).toBeVisible();
  });

  test('should fail login with wrong password', async ({ page }) => {
    const user = generateUniqueUser();
    // First register a user with correct credentials
    await register(page, user.username, user.email, user.password);
    // Logout
    await logout(page);
    // Try to login with correct email but wrong password
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', user.email);
    await page.fill('[data-testid="input-password"]', 'wrongpassword123');
    await page.click('[data-testid="auth-submit"]');
    // Should show error message
    await expect(page.locator('[data-testid="error-messages"]')).toBeVisible();
    // Should still be on login page (not redirected)
    await expect(page).toHaveURL('/login');
  });

  test('should logout successfully', async ({ page }) => {
    const user = generateUniqueUser();
    await register(page, user.username, user.email, user.password);
    // User should be logged in
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible();
    // Logout
    await logout(page);
    // Should see Sign in link (user is logged out)
    await expect(page.locator('[data-testid="nav-sign-in"]')).toBeVisible();
    // Should not see profile link
    await expect(page.locator('[data-testid="nav-profile"]')).not.toBeVisible();
  });

  test('should prevent accessing editor when not logged in', async ({ page }) => {
    await page.goto('/editor');
    // Should be redirected to login or home
    await expect(page).not.toHaveURL('/editor');
  });

  test('should maintain session after page reload', async ({ page }) => {
    const user = generateUniqueUser();
    await register(page, user.username, user.email, user.password);
    // Reload the page
    await page.reload();
    // Should still be logged in
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible();
  });

  test('should handle invalid token on page reload gracefully', async ({ page }) => {
    // Set an invalid token in localStorage before navigating
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('jwtToken', 'invalid-token-that-will-cause-401');
    });
    // Reload the page - this should NOT cause a blank screen
    await page.reload();
    // The app should still load and show the unauthenticated UI
    await expect(page.locator('[data-testid="nav-sign-in"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-sign-up"]')).toBeVisible();
    // The invalid token should be cleared (use debug interface)
    const token = await getToken(page);
    expect(token).toBeNull();
    const authState = await getAuthState(page);
    expect(authState).toBe('unauthenticated');
  });
});
