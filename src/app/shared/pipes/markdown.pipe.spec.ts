import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let pipe: MarkdownPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MarkdownPipe],
    });
    pipe = TestBed.inject(MarkdownPipe);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform markdown to sanitized HTML', async () => {
    const result = await pipe.transform('**bold text**');
    expect(result).toContain('<strong>bold text</strong>');
  });

  it('should transform markdown headings', async () => {
    const result = await pipe.transform('# Hello');
    expect(result).toContain('Hello');
  });

  it('should handle plain text', async () => {
    const result = await pipe.transform('plain text');
    expect(result).toContain('plain text');
  });

  it('should sanitize dangerous HTML', async () => {
    const result = await pipe.transform('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
  });

  it('should return empty string for empty content', async () => {
    const result = await pipe.transform('');
    expect(result).toBe('');
  });
});
