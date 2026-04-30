import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './api';
import { getAll, add, deleteComment } from './comments.service';

vi.mock('./api');
const mockedApi = vi.mocked(api);

describe('CommentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all comments for an article', async () => {
      const mockComments = [{ id: '1', body: 'Test comment' }];
      mockedApi.get.mockResolvedValue({ data: { comments: mockComments } });

      const result = await getAll('test-slug');

      expect(mockedApi.get).toHaveBeenCalledWith('/articles/test-slug/comments');
      expect(result).toEqual(mockComments);
    });
  });

  describe('add', () => {
    it('should add a comment to an article', async () => {
      const mockComment = { id: '1', body: 'New comment' };
      mockedApi.post.mockResolvedValue({ data: { comment: mockComment } });

      const result = await add('test-slug', 'New comment');

      expect(mockedApi.post).toHaveBeenCalledWith('/articles/test-slug/comments', {
        comment: { body: 'New comment' },
      });
      expect(result).toEqual(mockComment);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment from an article', async () => {
      mockedApi.delete.mockResolvedValue({});

      await deleteComment('1', 'test-slug');

      expect(mockedApi.delete).toHaveBeenCalledWith('/articles/test-slug/comments/1');
    });
  });
});
