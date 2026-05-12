import { Page } from '@playwright/test';

export interface ArticleData {
  title: string;
  description: string;
  body: string;
  tags?: string[];
}

export async function createArticle(page: Page, article: ArticleData) {
  await page.goto('/editor', { waitUntil: 'load' });

  await page.fill('[data-testid="editor-title"]', article.title);
  await page.fill('[data-testid="editor-description"]', article.description);
  await page.fill('[data-testid="editor-body"]', article.body);

  if (article.tags && article.tags.length > 0) {
    for (const tag of article.tags) {
      await page.fill('[data-testid="editor-tags"]', tag);
      await page.press('[data-testid="editor-tags"]', 'Enter');
    }
  }

  // Start waiting for navigation before clicking to avoid race condition
  await Promise.all([page.waitForURL(/\/article\/.+/), page.click('[data-testid="editor-publish"]')]);
}

export async function editArticle(page: Page, slug: string, updates: Partial<ArticleData>) {
  await page.goto(`/editor/${slug}`, { waitUntil: 'load' });

  // Wait for form to be populated before clearing/filling
  await page.waitForSelector('[data-testid="editor-title"]');

  if (updates.title) {
    await page.fill('[data-testid="editor-title"]', '');
    await page.fill('[data-testid="editor-title"]', updates.title);
  }
  if (updates.description) {
    await page.fill('[data-testid="editor-description"]', '');
    await page.fill('[data-testid="editor-description"]', updates.description);
  }
  if (updates.body) {
    await page.fill('[data-testid="editor-body"]', '');
    await page.fill('[data-testid="editor-body"]', updates.body);
  }

  await Promise.all([page.waitForURL(/\/article\/.+/), page.click('[data-testid="editor-publish"]')]);
}

export async function deleteArticle(page: Page) {
  // Assumes we're already on the article page
  await Promise.all([page.waitForURL('/'), page.click('[data-testid="delete-article"]')]);
}

export async function favoriteArticle(page: Page) {
  await page.click('[data-testid="favorite-button"]:has-text("Favorite")');
  // Wait for the button to update to "Unfavorite"
  await page.waitForSelector('[data-testid="favorite-button"]:has-text("Unfavorite")');
}

export async function unfavoriteArticle(page: Page) {
  await page.click('[data-testid="favorite-button"]:has-text("Unfavorite")');
  // Wait for the button to update back to "Favorite"
  await page.waitForSelector('[data-testid="favorite-button"]:has-text("Favorite")');
}

export function generateUniqueArticle(): ArticleData {
  const timestamp = Date.now();
  return {
    title: `Test Article ${timestamp}`,
    description: `Description for test article ${timestamp}`,
    body: `This is the body content for test article created at ${timestamp}. It contains enough text to be meaningful.`,
    tags: ['test', 'playwright'],
  };
}
