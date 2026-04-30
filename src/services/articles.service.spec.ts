import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './api';
import { query, get, deleteArticle, create, update, favorite, unfavorite } from './articles.service';

vi.mock('./api');
const mockedApi = vi.mocked(api);

describe('ArticlesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('query', () => {
    it('should fetch articles with config', async () => {
      const mockData = { articles: [], articlesCount: 0 };
      mockedApi.get.mockResolvedValue({ data: mockData });

      const result = await query({ type: 'all', filters: {} });

      expect(mockedApi.get).toHaveBeenCalledWith('/articles', { params: {} });
      expect(result).toEqual(mockData);
    });

    it('should fetch feed articles when type is feed', async () => {
      const mockData = { articles: [], articlesCount: 0 };
      mockedApi.get.mockResolvedValue({ data: mockData });

      await query({ type: 'feed', filters: {} });

      expect(mockedApi.get).toHaveBeenCalledWith('/articles/feed', { params: {} });
    });

    it('should include filters as params', async () => {
      const mockData = { articles: [], articlesCount: 0 };
      mockedApi.get.mockResolvedValue({ data: mockData });

      await query({ type: 'all', filters: { tag: 'test', limit: 10, offset: 0 } });

      expect(mockedApi.get).toHaveBeenCalledWith('/articles', {
        params: { tag: 'test', limit: 10, offset: 0 },
      });
    });
  });

  describe('get', () => {
    it('should fetch a single article by slug', async () => {
      const mockArticle = { slug: 'test-slug', title: 'Test' };
      mockedApi.get.mockResolvedValue({ data: { article: mockArticle } });

      const result = await get('test-slug');

      expect(mockedApi.get).toHaveBeenCalledWith('/articles/test-slug');
      expect(result).toEqual(mockArticle);
    });
  });

  describe('deleteArticle', () => {
    it('should delete an article by slug', async () => {
      mockedApi.delete.mockResolvedValue({});

      await deleteArticle('test-slug');

      expect(mockedApi.delete).toHaveBeenCalledWith('/articles/test-slug');
    });
  });

  describe('create', () => {
    it('should create a new article', async () => {
      const mockArticle = { slug: 'new-article', title: 'New' };
      mockedApi.post.mockResolvedValue({ data: { article: mockArticle } });

      const result = await create({ title: 'New', description: 'desc', body: 'body' });

      expect(mockedApi.post).toHaveBeenCalledWith('/articles/', {
        article: { title: 'New', description: 'desc', body: 'body' },
      });
      expect(result).toEqual(mockArticle);
    });
  });

  describe('update', () => {
    it('should update an existing article', async () => {
      const mockArticle = { slug: 'test-slug', title: 'Updated' };
      mockedApi.put.mockResolvedValue({ data: { article: mockArticle } });

      const result = await update({ slug: 'test-slug', title: 'Updated' });

      expect(mockedApi.put).toHaveBeenCalledWith('/articles/test-slug', {
        article: { slug: 'test-slug', title: 'Updated' },
      });
      expect(result).toEqual(mockArticle);
    });
  });

  describe('favorite', () => {
    it('should favorite an article', async () => {
      const mockArticle = { slug: 'test-slug', favorited: true };
      mockedApi.post.mockResolvedValue({ data: { article: mockArticle } });

      const result = await favorite('test-slug');

      expect(mockedApi.post).toHaveBeenCalledWith('/articles/test-slug/favorite', {});
      expect(result).toEqual(mockArticle);
    });
  });

  describe('unfavorite', () => {
    it('should unfavorite an article', async () => {
      mockedApi.delete.mockResolvedValue({});

      await unfavorite('test-slug');

      expect(mockedApi.delete).toHaveBeenCalledWith('/articles/test-slug/favorite');
    });
  });
});
