import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './api';
import { get, follow, unfollow } from './profile.service';

vi.mock('./api');
const mockedApi = vi.mocked(api);

describe('ProfileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('should fetch a profile by username', async () => {
      const mockProfile = { username: 'testuser', bio: null, image: null, following: false };
      mockedApi.get.mockResolvedValue({ data: { profile: mockProfile } });

      const result = await get('testuser');

      expect(mockedApi.get).toHaveBeenCalledWith('/profiles/testuser');
      expect(result).toEqual(mockProfile);
    });
  });

  describe('follow', () => {
    it('should follow a user', async () => {
      const mockProfile = { username: 'testuser', bio: null, image: null, following: true };
      mockedApi.post.mockResolvedValue({ data: { profile: mockProfile } });

      const result = await follow('testuser');

      expect(mockedApi.post).toHaveBeenCalledWith('/profiles/testuser/follow', {});
      expect(result).toEqual(mockProfile);
    });
  });

  describe('unfollow', () => {
    it('should unfollow a user', async () => {
      const mockProfile = { username: 'testuser', bio: null, image: null, following: false };
      mockedApi.delete.mockResolvedValue({ data: { profile: mockProfile } });

      const result = await unfollow('testuser');

      expect(mockedApi.delete).toHaveBeenCalledWith('/profiles/testuser/follow');
      expect(result).toEqual(mockProfile);
    });
  });
});
