import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { ArticlePreviewComponent } from './article-preview.component';
import { ArticlesService } from '../services/articles.service';
import { UserService } from '../../../core/auth/services/user.service';
import { Article } from '../models/article.model';

describe('ArticlePreviewComponent', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let component: ArticlePreviewComponent;

  const mockArticle: Article = {
    slug: 'test-article',
    title: 'Test Article',
    description: 'Test description',
    body: 'Test body',
    tagList: ['test', 'angular'],
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
      imports: [ArticlePreviewComponent, RouterTestingModule],
      providers: [
        { provide: ArticlesService, useValue: { favorite: vi.fn(() => EMPTY), unfavorite: vi.fn(() => EMPTY) } },
        {
          provide: UserService,
          useValue: {
            currentUser: new BehaviorSubject(null).asObservable(),
            isAuthenticated: new BehaviorSubject(false).asObservable(),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(ArticlePreviewComponent);
    component = fixture.componentInstance;
    component.articleInput = mockArticle;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set article via input', () => {
    expect(component.article()).toEqual(mockArticle);
  });

  it('should toggle favorite to true', () => {
    component.toggleFavorite(true);
    const updated = component.article();
    expect(updated.favorited).toBe(true);
    expect(updated.favoritesCount).toBe(6);
  });

  it('should toggle favorite to false', () => {
    component.articleInput = { ...mockArticle, favorited: true, favoritesCount: 5 };
    component.toggleFavorite(false);
    const updated = component.article();
    expect(updated.favorited).toBe(false);
    expect(updated.favoritesCount).toBe(4);
  });
});
