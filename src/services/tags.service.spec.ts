import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './api';
import { getAll } from './tags.service';

vi.mock('./api');
const mockedApi = vi.mocked(api);

describe('TagsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all tags', async () => {
      const mockTags = ['tag1', 'tag2', 'tag3'];
      mockedApi.get.mockResolvedValue({ data: { tags: mockTags } });

      const result = await getAll();

      expect(mockedApi.get).toHaveBeenCalledWith('/tags');
      expect(result).toEqual(mockTags);
    });

    it('should return empty array when no tags', async () => {
      mockedApi.get.mockResolvedValue({ data: { tags: [] } });

      const result = await getAll();

      expect(result).toEqual([]);
    });
  });
});
