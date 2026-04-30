import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, throwError, EMPTY } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { ProfileService } from '../../services/profile.service';
import { UserService } from '../../../../core/auth/services/user.service';
import { Profile } from '../../models/profile.model';

describe('ProfileComponent', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let component: ProfileComponent;
  let profileService: any;
  let currentUser$: BehaviorSubject<any>;

  const mockProfile: Profile = {
    username: 'testuser',
    bio: 'Test bio',
    image: 'https://example.com/avatar.jpg',
    following: false,
  };

  beforeEach(() => {
    currentUser$ = new BehaviorSubject({
      username: 'testuser',
      email: 'test@test.com',
      token: 'token',
      bio: null,
      image: null,
    });

    profileService = {
      get: vi.fn(() => of(mockProfile)),
      follow: vi.fn(() => EMPTY),
      unfollow: vi.fn(() => EMPTY),
    };

    TestBed.configureTestingModule({
      imports: [ProfileComponent, RouterTestingModule],
      providers: [
        { provide: ProfileService, useValue: profileService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { username: 'testuser' } } },
        },
        {
          provide: UserService,
          useValue: {
            currentUser: currentUser$.asObservable(),
            isAuthenticated: new BehaviorSubject(true).asObservable(),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(ProfileComponent);
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

  it('should set isUser when profile matches current user', () => {
    expect(component.isUser()).toBe(true);
  });

  it('should set isUser to false when profile does not match', () => {
    currentUser$.next({
      username: 'otheruser',
      email: 'other@test.com',
      token: 'token',
      bio: null,
      image: null,
    });
    // Re-create to pick up new user
    TestBed.resetTestingModule();
    currentUser$ = new BehaviorSubject({
      username: 'otheruser',
      email: 'other@test.com',
      token: 'token',
      bio: null,
      image: null,
    });
    profileService = { get: vi.fn(() => of(mockProfile)), follow: vi.fn(() => EMPTY), unfollow: vi.fn(() => EMPTY) };

    TestBed.configureTestingModule({
      imports: [ProfileComponent, RouterTestingModule],
      providers: [
        { provide: ProfileService, useValue: profileService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { username: 'testuser' } } },
        },
        {
          provide: UserService,
          useValue: {
            currentUser: currentUser$.asObservable(),
            isAuthenticated: new BehaviorSubject(true).asObservable(),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.isUser()).toBe(false);
  });

  it('should update profile on toggle following', () => {
    const updatedProfile = { ...mockProfile, following: true };
    component.onToggleFollowing(updatedProfile);
    expect(component.profile()).toEqual(updatedProfile);
  });

  it('should set errors when profile load fails', () => {
    TestBed.resetTestingModule();
    profileService = {
      get: vi.fn(() => throwError(() => ({ errors: { profile: 'not found' } }))),
      follow: vi.fn(() => EMPTY),
      unfollow: vi.fn(() => EMPTY),
    };

    TestBed.configureTestingModule({
      imports: [ProfileComponent, RouterTestingModule],
      providers: [
        { provide: ProfileService, useValue: profileService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { username: 'nonexistent' } } },
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

    const fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.errors()).toBeTruthy();
  });
});
