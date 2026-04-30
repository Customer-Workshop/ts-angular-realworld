import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { FavoriteButtonComponent } from './favorite-button.component';
import { ArticlesService } from '../services/articles.service';
import { UserService } from '../../../core/auth/services/user.service';
import { Article } from '../models/article.model';

describe('FavoriteButtonComponent', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let component: FavoriteButtonComponent;
  let articlesService: any;
  let router: any;
  let isAuthenticated$: BehaviorSubject<boolean>;

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
    isAuthenticated$ = new BehaviorSubject<boolean>(true);
    articlesService = {
      favorite: vi.fn(() => of(mockArticle)),
      unfavorite: vi.fn(() => of(mockArticle)),
    };
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      imports: [FavoriteButtonComponent],
      providers: [
        { provide: ArticlesService, useValue: articlesService },
        { provide: Router, useValue: router },
        {
          provide: UserService,
          useValue: {
            isAuthenticated: isAuthenticated$.asObservable(),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(FavoriteButtonComponent);
    component = fixture.componentInstance;
    component.article = mockArticle;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call favorite when article is not favorited', () => {
    component.toggleFavorite();
    expect(articlesService.favorite).toHaveBeenCalledWith('test-article');
  });

  it('should call unfavorite when article is already favorited', () => {
    component.article = { ...mockArticle, favorited: true };
    component.toggleFavorite();
    expect(articlesService.unfavorite).toHaveBeenCalledWith('test-article');
  });

  it('should redirect to register when not authenticated', () => {
    isAuthenticated$.next(false);
    component.toggleFavorite();
    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('should emit toggle event on success', () => {
    const toggleSpy = vi.fn();
    component.toggle.subscribe(toggleSpy);
    component.toggleFavorite();
    expect(toggleSpy).toHaveBeenCalledWith(true);
    expect(component.isSubmitting()).toBe(false);
  });

  it('should set isSubmitting to false on error', () => {
    articlesService.favorite.mockReturnValue(throwError(() => new Error('fail')));
    component.toggleFavorite();
    expect(component.isSubmitting()).toBe(false);
  });
});
