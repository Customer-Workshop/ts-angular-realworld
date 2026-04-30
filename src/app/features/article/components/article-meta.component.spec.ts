import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ArticleMetaComponent } from './article-meta.component';
import { Article } from '../models/article.model';

describe('ArticleMetaComponent', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  const mockArticle: Article = {
    slug: 'test-article',
    title: 'Test Article',
    description: 'Test description',
    body: 'Test body',
    tagList: ['test'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    favorited: false,
    favoritesCount: 5,
    author: {
      username: 'testuser',
      bio: 'Test bio',
      image: 'https://example.com/avatar.jpg',
      following: false,
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ArticleMetaComponent, RouterTestingModule],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ArticleMetaComponent);
    fixture.componentInstance.article = mockArticle;
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display author username', () => {
    const fixture = TestBed.createComponent(ArticleMetaComponent);
    fixture.componentInstance.article = mockArticle;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('testuser');
  });
});
