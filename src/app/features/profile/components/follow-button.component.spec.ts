import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { FollowButtonComponent } from './follow-button.component';
import { ProfileService } from '../services/profile.service';
import { UserService } from '../../../core/auth/services/user.service';
import { Profile } from '../models/profile.model';

describe('FollowButtonComponent', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let component: FollowButtonComponent;
  let profileService: any;
  let router: any;
  let isAuthenticated$: BehaviorSubject<boolean>;

  const mockProfile: Profile = {
    username: 'testuser',
    bio: 'Test bio',
    image: 'https://example.com/avatar.jpg',
    following: false,
  };

  beforeEach(() => {
    isAuthenticated$ = new BehaviorSubject<boolean>(true);
    profileService = {
      follow: vi.fn(() => of({ ...mockProfile, following: true })),
      unfollow: vi.fn(() => of({ ...mockProfile, following: false })),
    };
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      imports: [FollowButtonComponent],
      providers: [
        { provide: ProfileService, useValue: profileService },
        { provide: Router, useValue: router },
        {
          provide: UserService,
          useValue: { isAuthenticated: isAuthenticated$.asObservable() },
        },
      ],
    });

    const fixture = TestBed.createComponent(FollowButtonComponent);
    component = fixture.componentInstance;
    component.profile = mockProfile;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call follow when not following', () => {
    component.toggleFollowing();
    expect(profileService.follow).toHaveBeenCalledWith('testuser');
  });

  it('should call unfollow when already following', () => {
    component.profile = { ...mockProfile, following: true };
    component.toggleFollowing();
    expect(profileService.unfollow).toHaveBeenCalledWith('testuser');
  });

  it('should redirect to login when not authenticated', () => {
    isAuthenticated$.next(false);
    component.toggleFollowing();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should emit toggle event on success', () => {
    const toggleSpy = vi.fn();
    component.toggle.subscribe(toggleSpy);
    component.toggleFollowing();
    expect(toggleSpy).toHaveBeenCalledWith({ ...mockProfile, following: true });
    expect(component.isSubmitting()).toBe(false);
  });

  it('should set isSubmitting to false on error', () => {
    profileService.follow.mockReturnValue(throwError(() => new Error('fail')));
    component.toggleFollowing();
    expect(component.isSubmitting()).toBe(false);
  });
});
