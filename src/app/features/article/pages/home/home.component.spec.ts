import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, EMPTY } from 'rxjs';
import HomeComponent from './home.component';
import { UserService } from '../../../../core/auth/services/user.service';
import { TagsService } from '../../services/tags.service';
import { ArticlesService } from '../../services/articles.service';

describe('HomeComponent', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let component: HomeComponent;
  let isAuthenticated$: BehaviorSubject<boolean>;
  let params$: BehaviorSubject<any>;
  let queryParams$: BehaviorSubject<any>;
  let router: Router;

  beforeEach(() => {
    isAuthenticated$ = new BehaviorSubject<boolean>(false);
    params$ = new BehaviorSubject<any>({});
    queryParams$ = new BehaviorSubject<any>({});

    TestBed.configureTestingModule({
      imports: [HomeComponent, RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: params$.asObservable(),
            queryParams: queryParams$.asObservable(),
            snapshot: { queryParams: {} },
          },
        },
        {
          provide: UserService,
          useValue: {
            isAuthenticated: isAuthenticated$.asObservable(),
            currentUser: new BehaviorSubject(null).asObservable(),
          },
        },
        { provide: TagsService, useValue: { getAll: vi.fn(() => of(['tag1', 'tag2'])) } },
        {
          provide: ArticlesService,
          useValue: {
            query: vi.fn(() => of({ articles: [], articlesCount: 0 })),
            favorite: vi.fn(() => EMPTY),
            unfavorite: vi.fn(() => EMPTY),
          },
        },
      ],
    });

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should set listConfig to global feed by default', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.listConfig().type).toBe('all');
  });

  it('should set listConfig with tag filter for tag route', () => {
    params$.next({ tag: 'angular' });
    const fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.listConfig().type).toBe('all');
    expect(component.listConfig().filters.tag).toBe('angular');
  });

  it('should set listConfig to following feed when authenticated', () => {
    isAuthenticated$.next(true);
    queryParams$.next({ feed: 'following' });
    const fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.listConfig().type).toBe('feed');
    expect(component.isFollowingFeed()).toBe(true);
  });

  it('should redirect to login when following feed requested but not authenticated', () => {
    isAuthenticated$.next(false);
    queryParams$.next({ feed: 'following' });
    const fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle page change', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.onPageChange(3);
    expect(router.navigate).toHaveBeenCalled();
  });
});
