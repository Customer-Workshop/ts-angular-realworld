import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ArticleCommentComponent } from './article-comment.component';
import { UserService } from '../../../core/auth/services/user.service';
import { Comment } from '../models/comment.model';
import { User } from '../../../core/auth/user.model';

describe('ArticleCommentComponent', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let component: ArticleCommentComponent;
  let currentUser$: BehaviorSubject<User | null>;

  const mockComment: Comment = {
    id: '1',
    body: 'Test comment body',
    createdAt: '2024-01-01T00:00:00.000Z',
    author: {
      username: 'testuser',
      bio: 'Test bio',
      image: 'https://example.com/avatar.jpg',
      following: false,
    },
  };

  beforeEach(() => {
    currentUser$ = new BehaviorSubject<User | null>(null);

    TestBed.configureTestingModule({
      imports: [ArticleCommentComponent, RouterTestingModule],
      providers: [
        {
          provide: UserService,
          useValue: {
            currentUser: currentUser$.asObservable(),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(ArticleCommentComponent);
    component = fixture.componentInstance;
    component.comment = mockComment;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit delete event', () => {
    const deleteSpy = vi.fn();
    component.delete.subscribe(deleteSpy);
    component.delete.emit(true);
    expect(deleteSpy).toHaveBeenCalledWith(true);
  });

  it('should have canModify$ observable', () => {
    expect(component.canModify$).toBeTruthy();
  });

  it('should allow delete when current user is the comment author', async () => {
    currentUser$.next({
      username: 'testuser',
      email: 'test@test.com',
      token: 'token',
      bio: null,
      image: null,
    });

    const canModify = await firstValueFrom(component.canModify$);
    expect(canModify).toBe(true);
  });

  it('should not allow delete when current user is not the author', async () => {
    currentUser$.next({
      username: 'otheruser',
      email: 'other@test.com',
      token: 'token',
      bio: null,
      image: null,
    });

    const canModify = await firstValueFrom(component.canModify$);
    expect(canModify).toBe(false);
  });
});
