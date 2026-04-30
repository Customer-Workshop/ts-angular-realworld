import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, EMPTY } from 'rxjs';
import ProfileFavoritesComponent from './profile-favorites.component';
import { ProfileService } from '../services/profile.service';
import { ArticlesService } from '../../article/services/articles.service';
import { UserService } from '../../../core/auth/services/user.service';
import { Profile } from '../models/profile.model';

describe('ProfileFavoritesComponent', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let component: ProfileFavoritesComponent;
  let profileService: any;

  const mockProfile: Profile = {
    username: 'testuser',
    bio: 'Test bio',
    image: 'https://example.com/avatar.jpg',
    following: false,
  };

  beforeEach(() => {
    profileService = {
      get: vi.fn(() => of(mockProfile)),
    };

    TestBed.configureTestingModule({
      imports: [ProfileFavoritesComponent],
      providers: [
        { provide: ProfileService, useValue: profileService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { username: 'testuser' } },
            parent: { snapshot: { params: { username: 'testuser' } } },
          },
        },
        {
          provide: ArticlesService,
          useValue: {
            query: vi.fn(() => of({ articles: [], articlesCount: 0 })),
            favorite: vi.fn(() => EMPTY),
            unfavorite: vi.fn(() => EMPTY),
          },
        },
        {
          provide: UserService,
          useValue: {
            currentUser: new BehaviorSubject(null).asObservable(),
            isAuthenticated: new BehaviorSubject(false).asObservable(),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(ProfileFavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile on init', () => {
    expect(profileService.get).toHaveBeenCalledWith('testuser');
    expect(component.profile()).toEqual(mockProfile);
  });

  it('should set favoritesConfig with favorited filter', () => {
    const config = component.favoritesConfig();
    expect(config).toBeTruthy();
    expect(config!.type).toBe('all');
    expect(config!.filters.favorited).toBe('testuser');
  });
});
