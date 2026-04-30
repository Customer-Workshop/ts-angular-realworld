import { test, expect } from '@playwright/test';
import { register, generateUniqueUser } from './helpers/auth';

test.describe('Feature: Registration', () => {
  test.afterEach(async ({ context }) => {
    await context.close();
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  test('Scenario: Should register a new user successfully', async ({ page }) => {
    // Given - navigate to the registration page
    const user = generateUniqueUser();
    await page.goto('/register');

    // When - fill in username, email, password fields and submit the form
    await page.fill('input[formControlName="username"]', user.username);
    await page.fill('input[formControlName="email"]', user.email);
    await page.fill('input[formControlName="password"]', user.password);
    await page.click('button[type="submit"]');

    // Then - user is redirected to home page, username link is visible in the header
    await expect(page).toHaveURL('/');
    await expect(page.locator(`a[href="/profile/${user.username}"]`)).toBeVisible();
  });

  test('Scenario: Should show validation errors for empty registration form', async ({ page }) => {
    // Given - navigate to the registration page
    await page.goto('/register');

    // When - click submit without filling any fields
    await page.click('button[type="submit"]');

    // Then - error messages are displayed, user remains on /register
    await expect(page.locator('.error-messages')).toBeVisible();
    await expect(page).toHaveURL('/register');
  });

  test('Scenario: Should show error for duplicate username/email', async ({ page }) => {
    // Given - register a user, then navigate to /register again
    const user = generateUniqueUser();
    await register(page, user.username, user.email, user.password);
    await page.goto('/register');

    // When - try to register with the same email/username
    await page.fill('input[formControlName="username"]', user.username);
    await page.fill('input[formControlName="email"]', user.email);
    await page.fill('input[formControlName="password"]', user.password);
    await page.click('button[type="submit"]');

    // Then - error messages are displayed
    await expect(page.locator('.error-messages')).toBeVisible();
    await expect(page).toHaveURL('/register');
  });
});

test.describe('Feature: Login', () => {
  test.afterEach(async ({ context }) => {
    await context.close();
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  test('Scenario: Should login with valid credentials', async ({ page }) => {
    // Given - register a new user first to have valid credentials
    const user = generateUniqueUser();
    await register(page, user.username, user.email, user.password);

    // Navigate to login page
    await page.goto('/login');

    // When - fill in email and password, click submit
    await page.fill('input[formControlName="email"]', user.email);
    await page.fill('input[formControlName="password"]', user.password);
    await page.click('button[type="submit"]');

    // Then - user is redirected to home page, username is visible in header
    await expect(page).toHaveURL('/');
    await expect(page.locator(`a[href="/profile/${user.username}"]`)).toBeVisible();
  });

  test('Scenario: Should show error for invalid credentials', async ({ page }) => {
    // Given - navigate to /login
    await page.goto('/login');

    // When - fill in wrong email/password and submit
    await page.fill('input[formControlName="email"]', 'nonexistent@example.com');
    await page.fill('input[formControlName="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Then - error messages are displayed, user stays on /login
    await expect(page.locator('.error-messages')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('Scenario: Should show validation errors for empty login form', async ({ page }) => {
    // Given - navigate to /login
    await page.goto('/login');

    // When - click submit without filling fields
    await page.click('button[type="submit"]');

    // Then - error messages or validation feedback displayed, user stays on /login
    await expect(page.locator('.error-messages')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });
});
