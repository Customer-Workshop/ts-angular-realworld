import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, throwError, EMPTY } from 'rxjs';
import ArticleComponent from './article.component';
import { ArticlesService } from '../../services/articles.service';
import { CommentsService } from '../../services/comments.service';
import { UserService } from '../../../../core/auth/services/user.service';
import { ProfileService } from '../../../profile/services/profile.service';
import { Article } from '../../models/article.model';
import { Comment } from '../../models/comment.model';

describe('ArticleComponent', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let component: ArticleComponent;
  let articlesService: any;
  let commentsService: any;
  let router: Router;

  const mockArticle: Article = {
    slug: 'test-article',
    title: 'Test Article',
    description: 'Test description',
    body: 'Test body',
    tagList: ['test'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-02',
    favorited: false,
    favoritesCount: 5,
    author: { username: 'testuser', bio: null, image: null, following: false },
  };

  const mockComment: Comment = {
    id: '1',
    body: 'Test comment',
    createdAt: '2024-01-01',
    author: { username: 'testuser', bio: null, image: null, following: false },
  };

  beforeEach(() => {
    articlesService = {
      get: vi.fn(() => of(mockArticle)),
      delete: vi.fn(() => of({})),
      favorite: vi.fn(() => EMPTY),
      unfavorite: vi.fn(() => EMPTY),
    };
    commentsService = {
      getAll: vi.fn(() => of([mockComment])),
      add: vi.fn(() => of(mockComment)),
      delete: vi.fn(() => of({})),
    };

    TestBed.configureTestingModule({
      imports: [ArticleComponent, RouterTestingModule],
      providers: [
        { provide: ArticlesService, useValue: articlesService },
        { provide: CommentsService, useValue: commentsService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { slug: 'test-article' } } },
        },
        {
          provide: UserService,
          useValue: {
            currentUser: new BehaviorSubject({
              username: 'testuser',
              email: 'test@test.com',
              token: 'token',
              bio: null,
              image: null,
            }).asObservable(),
            isAuthenticated: new BehaviorSubject(true).asObservable(),
          },
        },
        {
          provide: ProfileService,
          useValue: { follow: vi.fn(() => EMPTY), unfollow: vi.fn(() => EMPTY) },
        },
      ],
    });

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    const fixture = TestBed.createComponent(ArticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load article on init', () => {
    expect(component.article()).toEqual(mockArticle);
  });

  it('should load comments on init', () => {
    expect(component.comments()).toEqual([mockComment]);
  });

  it('should set canModify when user is the author', () => {
    expect(component.canModify()).toBe(true);
  });

  it('should toggle favorite', () => {
    component.onToggleFavorite(true);
    expect(component.article()!.favorited).toBe(true);
    expect(component.article()!.favoritesCount).toBe(6);
  });

  it('should toggle following', () => {
    const profile = { username: 'testuser', bio: null, image: null, following: true };
    component.toggleFollowing(profile);
    expect(component.article()!.author.following).toBe(true);
  });

  it('should delete article', () => {
    component.deleteArticle();
    expect(articlesService.delete).toHaveBeenCalledWith('test-article');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should add comment', () => {
    component.commentControl.setValue('New comment');
    component.addComment();
    expect(commentsService.add).toHaveBeenCalledWith('test-article', 'New comment');
  });

  it('should reset form after adding comment', () => {
    component.commentControl.setValue('New comment');
    component.addComment();
    expect(component.commentControl.value).toBe('');
    expect(component.isSubmitting()).toBe(false);
  });

  it('should handle add comment error', () => {
    const errors = { errors: { body: "can't be blank" } };
    commentsService.add.mockReturnValue(throwError(() => errors));
    component.commentControl.setValue('New comment');
    component.addComment();
    expect(component.commentFormErrors()).toEqual(errors);
    expect(component.isSubmitting()).toBe(false);
  });

  it('should delete comment', () => {
    component.deleteComment(mockComment);
    expect(commentsService.delete).toHaveBeenCalledWith('1', 'test-article');
  });

  it('should handle delete comment error', () => {
    const errors = { errors: { comment: 'not found' } };
    commentsService.delete.mockReturnValue(throwError(() => errors));
    component.deleteComment(mockComment);
    expect(component.deleteCommentErrors()).toEqual(errors);
  });

  it('should handle null article for deleteArticle', () => {
    component.article.set(null);
    component.deleteArticle();
    expect(articlesService.delete).not.toHaveBeenCalled();
  });

  it('should handle null article for addComment', () => {
    component.article.set(null);
    component.addComment();
    expect(commentsService.add).not.toHaveBeenCalled();
  });
});
