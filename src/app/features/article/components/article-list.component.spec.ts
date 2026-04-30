import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, BehaviorSubject, EMPTY } from 'rxjs';
import { ArticleListComponent } from './article-list.component';
import { ArticlesService } from '../services/articles.service';
import { UserService } from '../../../core/auth/services/user.service';
import { Article } from '../models/article.model';
import { SimpleChange } from '@angular/core';
import { LoadingState } from '../../../core/models/loading-state.model';

describe('ArticleListComponent', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let component: ArticleListComponent;
  let articlesService: any;

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
    articlesService = {
      query: vi.fn(() => of({ articles: [mockArticle], articlesCount: 1 })),
      favorite: vi.fn(() => EMPTY),
      unfavorite: vi.fn(() => EMPTY),
    };

    TestBed.configureTestingModule({
      imports: [ArticleListComponent, RouterTestingModule],
      providers: [
        { provide: ArticlesService, useValue: articlesService },
        {
          provide: UserService,
          useValue: {
            currentUser: new BehaviorSubject(null).asObservable(),
            isAuthenticated: new BehaviorSubject(false).asObservable(),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(ArticleListComponent);
    component = fixture.componentInstance;
    component.limit = 10;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run query when config changes', () => {
    const config = { type: 'all', filters: {} };
    component.ngOnChanges({
      config: new SimpleChange(null, config, true),
    });

    expect(articlesService.query).toHaveBeenCalledWith(config);
    expect(component.loading()).toBe(LoadingState.LOADED);
    expect(component.results()).toEqual([mockArticle]);
  });

  it('should reset page to 1 when config changes without page', () => {
    component.page.set(3);
    const config = { type: 'all', filters: {} };
    component.ngOnChanges({
      config: new SimpleChange(null, config, true),
    });

    expect(component.page()).toBe(1);
  });

  it('should set page when currentPage changes', () => {
    const config = { type: 'all', filters: {} };
    component.ngOnChanges({
      config: new SimpleChange(null, config, true),
      currentPage: new SimpleChange(null, 3, true),
    });

    expect(component.page()).toBe(3);
  });

  it('should emit pageChange when setPageTo is called', () => {
    const pageChangeSpy = vi.fn();
    component.pageChange.subscribe(pageChangeSpy);

    const config = { type: 'all', filters: {} };
    component.config = config;
    component.ngOnChanges({
      config: new SimpleChange(null, config, true),
    });

    component.setPageTo(2);
    expect(pageChangeSpy).toHaveBeenCalledWith(2);
    expect(component.page()).toBe(2);
  });

  it('should not emit pageChange when page is the same', () => {
    const pageChangeSpy = vi.fn();
    component.pageChange.subscribe(pageChangeSpy);

    const config = { type: 'all', filters: {} };
    component.config = config;
    component.ngOnChanges({
      config: new SimpleChange(null, config, true),
    });

    component.setPageTo(1);
    expect(pageChangeSpy).not.toHaveBeenCalled();
  });

  it('should calculate totalPages correctly', () => {
    articlesService.query.mockReturnValue(of({ articles: [mockArticle], articlesCount: 25 }));

    const config = { type: 'all', filters: {} };
    component.ngOnChanges({
      config: new SimpleChange(null, config, true),
    });

    expect(component.totalPages()).toEqual([1, 2, 3]);
  });
});
