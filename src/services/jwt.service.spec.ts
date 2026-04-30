import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getToken, saveToken, destroyToken } from './jwt.service';

describe('JwtService', () => {
  let localStorageSpy: Record<string, unknown>;

  beforeEach(() => {
    localStorageSpy = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getToken', () => {
    it('should retrieve token from localStorage', () => {
      const mockToken = 'test-jwt-token-123';
      localStorageSpy['jwtToken'] = mockToken;
      const token = getToken();
      expect(token).toBe(mockToken);
    });

    it('should return undefined when no token exists', () => {
      const token = getToken();
      expect(token).toBeUndefined();
    });

    it('should handle empty string token', () => {
      localStorageSpy['jwtToken'] = '';
      const token = getToken();
      expect(token).toBe('');
    });

    it('should handle null token', () => {
      localStorageSpy['jwtToken'] = null;
      const token = getToken();
      expect(token).toBeNull();
    });

    it('should retrieve token multiple times consistently', () => {
      const mockToken = 'consistent-token';
      localStorageSpy['jwtToken'] = mockToken;
      const token1 = getToken();
      const token2 = getToken();
      const token3 = getToken();
      expect(token1).toBe(mockToken);
      expect(token2).toBe(mockToken);
      expect(token3).toBe(mockToken);
    });

    it('should handle long JWT token', () => {
      const longToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 'a'.repeat(500);
      localStorageSpy['jwtToken'] = longToken;
      const token = getToken();
      expect(token).toBe(longToken);
    });

    it('should handle token with special characters', () => {
      const specialToken = 'token.with-special_chars!@#$%^&*()';
      localStorageSpy['jwtToken'] = specialToken;
      const token = getToken();
      expect(token).toBe(specialToken);
    });
  });

  describe('saveToken', () => {
    it('should save token to localStorage', () => {
      const mockToken = 'new-jwt-token-456';
      saveToken(mockToken);
      expect(localStorageSpy['jwtToken']).toBe(mockToken);
    });

    it('should overwrite existing token', () => {
      const oldToken = 'old-token';
      const newToken = 'new-token';
      localStorageSpy['jwtToken'] = oldToken;
      saveToken(newToken);
      expect(localStorageSpy['jwtToken']).toBe(newToken);
    });

    it('should handle empty string token', () => {
      saveToken('');
      expect(localStorageSpy['jwtToken']).toBe('');
    });

    it('should handle very long token', () => {
      const longToken = 'a'.repeat(1000);
      saveToken(longToken);
      expect(localStorageSpy['jwtToken']).toBe(longToken);
    });

    it('should handle special characters in token', () => {
      const specialToken = 'token.with-special_chars!@#$%';
      saveToken(specialToken);
      expect(localStorageSpy['jwtToken']).toBe(specialToken);
    });

    it('should handle JWT format tokens', () => {
      const jwtToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      saveToken(jwtToken);
      expect(localStorageSpy['jwtToken']).toBe(jwtToken);
    });

    it('should persist token after save', () => {
      const token = 'persist-test-token';
      saveToken(token);
      const retrievedToken = getToken();
      expect(retrievedToken).toBe(token);
    });

    it('should handle rapid successive saves', () => {
      const tokens = ['token1', 'token2', 'token3', 'token4', 'token5'];
      tokens.forEach(token => {
        saveToken(token);
      });
      expect(localStorageSpy['jwtToken']).toBe(tokens[tokens.length - 1]);
    });
  });

  describe('destroyToken', () => {
    it('should remove token from localStorage', () => {
      localStorageSpy['jwtToken'] = 'test-token';
      destroyToken();
      expect(localStorageSpy.removeItem).toHaveBeenCalledWith('jwtToken');
    });

    it('should handle destroying when no token exists', () => {
      destroyToken();
      expect(localStorageSpy.removeItem).toHaveBeenCalledWith('jwtToken');
    });

    it('should handle multiple destroys', () => {
      destroyToken();
      destroyToken();
      destroyToken();
      expect(localStorageSpy.removeItem).toHaveBeenCalledTimes(3);
    });
  });
});
