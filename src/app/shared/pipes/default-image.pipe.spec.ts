import { describe, it, expect, beforeEach } from 'vitest';
import { DefaultImagePipe } from './default-image.pipe';

describe('DefaultImagePipe', () => {
  let pipe: DefaultImagePipe;

  beforeEach(() => {
    pipe = new DefaultImagePipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the image when provided', () => {
    expect(pipe.transform('https://example.com/avatar.jpg')).toBe('https://example.com/avatar.jpg');
  });

  it('should return default avatar when image is null', () => {
    expect(pipe.transform(null)).toBe('/assets/images/default-avatar.svg');
  });

  it('should return default avatar when image is undefined', () => {
    expect(pipe.transform(undefined)).toBe('/assets/images/default-avatar.svg');
  });

  it('should return default avatar when image is empty string', () => {
    expect(pipe.transform('')).toBe('/assets/images/default-avatar.svg');
  });
});
