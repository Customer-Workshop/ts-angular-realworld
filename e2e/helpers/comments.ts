import { Page } from '@playwright/test';

export async function addComment(page: Page, commentText: string) {
  // Assumes we're on an article page - wait for comment form to be ready
  await page.waitForSelector('[data-testid="comment-input"]', { timeout: 10000 });
  await page.fill('[data-testid="comment-input"]', commentText);

  // Get initial comment count (exclude the comment form itself)
  const initialCount = await page.locator('[data-testid="comment-card"] [data-testid="comment-body"]').count();

  await page.click('[data-testid="post-comment"]');

  // Wait for a new comment to appear (count should increase by 1)
  await page.waitForFunction(
    expectedCount =>
      document.querySelectorAll('[data-testid="comment-card"] [data-testid="comment-body"]').length >= expectedCount,
    initialCount + 1,
    { timeout: 5000 },
  );
}

export async function deleteComment(page: Page, commentText: string) {
  // Find the comment card containing the text and click its delete button
  const commentCard = page.locator('[data-testid="comment-card"]', { has: page.locator(`text="${commentText}"`) });
  await commentCard.locator('[data-testid="delete-comment"]').click();

  // Wait for comment to disappear
}

export async function getCommentCount(page: Page): Promise<number> {
  // Count only actual comment cards (not the comment form)
  const comments = await page.locator('[data-testid="comment-card"] [data-testid="comment-body"]').count();
  return comments;
}
