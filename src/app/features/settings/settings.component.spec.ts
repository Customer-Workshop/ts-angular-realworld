import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { Router } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import SettingsComponent from './settings.component';
import { UserService } from '../../core/auth/services/user.service';
import { User } from '../../core/auth/user.model';

describe('SettingsComponent', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let component: SettingsComponent;
  let userService: any;
  let router: any;

  const mockUser: User = {
    email: 'test@example.com',
    token: 'test-token',
    username: 'testuser',
    bio: 'Test bio',
    image: 'https://example.com/avatar.jpg',
  };

  beforeEach(() => {
    userService = {
      getCurrentUserSync: vi.fn(() => mockUser),
      update: vi.fn(() => of({ user: mockUser })),
      logout: vi.fn(),
      currentUser: new BehaviorSubject(mockUser).asObservable(),
    };
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: Router, useValue: router },
      ],
    });

    const fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate form with current user data on init', () => {
    expect(component.settingsForm.value.username).toBe('testuser');
    expect(component.settingsForm.value.email).toBe('test@example.com');
    expect(component.settingsForm.value.bio).toBe('Test bio');
    expect(component.settingsForm.value.image).toBe('https://example.com/avatar.jpg');
  });

  it('should handle null user on init', () => {
    TestBed.resetTestingModule();
    userService = {
      getCurrentUserSync: vi.fn(() => null),
      update: vi.fn(() => of({ user: mockUser })),
      logout: vi.fn(),
      currentUser: new BehaviorSubject(null).asObservable(),
    };

    TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: Router, useValue: router },
      ],
    });

    const fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.settingsForm.value.username).toBe('');
  });

  it('should call logout', () => {
    component.logout();
    expect(userService.logout).toHaveBeenCalled();
  });

  it('should call update on submit', () => {
    component.submitForm();
    expect(userService.update).toHaveBeenCalled();
    expect(component.isSubmitting()).toBe(true);
  });

  it('should navigate to profile on successful update', () => {
    component.submitForm();
    expect(router.navigate).toHaveBeenCalledWith(['/profile/', 'testuser']);
  });

  it('should set errors on failed update', () => {
    const errors = { errors: { email: 'is already taken' } };
    userService.update.mockReturnValue(throwError(() => errors));

    component.submitForm();
    expect(component.errors()).toEqual(errors);
    expect(component.isSubmitting()).toBe(false);
  });
});
