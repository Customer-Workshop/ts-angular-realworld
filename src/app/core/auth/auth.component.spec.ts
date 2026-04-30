import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import AuthComponent from './auth.component';
import { UserService } from './services/user.service';

describe('AuthComponent', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let component: AuthComponent;
  let userService: any;
  let router: Router;

  const loginRoute = {
    snapshot: {
      url: [{ path: 'login' }],
    },
  };

  const registerRoute = {
    snapshot: {
      url: [{ path: 'register' }],
    },
  };

  beforeEach(() => {
    userService = {
      login: vi.fn(),
      register: vi.fn(),
    };
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  function createComponent(route: any) {
    TestBed.configureTestingModule({
      imports: [AuthComponent, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: UserService, useValue: userService },
      ],
    });
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    const fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    return fixture;
  }

  it('should create', () => {
    createComponent(loginRoute);
    expect(component).toBeTruthy();
  });

  it('should set title to "Sign in" for login route', () => {
    const fixture = createComponent(loginRoute);
    fixture.detectChanges();
    expect(component.title).toBe('Sign in');
    expect(component.authType).toBe('login');
  });

  it('should set title to "Sign up" for register route', () => {
    const fixture = createComponent(registerRoute);
    fixture.detectChanges();
    expect(component.title).toBe('Sign up');
    expect(component.authType).toBe('register');
  });

  it('should add username control for register', () => {
    const fixture = createComponent(registerRoute);
    fixture.detectChanges();
    expect(component.authForm.get('username')).toBeTruthy();
  });

  it('should not have username control for login', () => {
    const fixture = createComponent(loginRoute);
    fixture.detectChanges();
    expect(component.authForm.get('username')).toBeNull();
  });

  it('should call userService.login on login submit', () => {
    const fixture = createComponent(loginRoute);
    fixture.detectChanges();

    userService.login.mockReturnValue(of({ user: {} }));

    component.authForm.setValue({ email: 'test@test.com', password: 'pass' });
    component.submitForm();

    expect(userService.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'pass' });
  });

  it('should call userService.register on register submit', () => {
    const fixture = createComponent(registerRoute);
    fixture.detectChanges();

    userService.register.mockReturnValue(of({ user: {} }));

    component.authForm.setValue({ email: 'test@test.com', password: 'pass', username: 'user' });
    component.submitForm();

    expect(userService.register).toHaveBeenCalledWith({ email: 'test@test.com', password: 'pass', username: 'user' });
  });

  it('should navigate to home on successful login', () => {
    const fixture = createComponent(loginRoute);
    fixture.detectChanges();

    userService.login.mockReturnValue(of({ user: {} }));

    component.authForm.setValue({ email: 'test@test.com', password: 'pass' });
    component.submitForm();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should set errors on failed login', () => {
    const fixture = createComponent(loginRoute);
    fixture.detectChanges();

    const errorResp = { errors: { credentials: 'invalid' } };
    userService.login.mockReturnValue(throwError(() => errorResp));

    component.authForm.setValue({ email: 'test@test.com', password: 'wrong' });
    component.submitForm();

    expect(component.errors()).toEqual(errorResp);
    expect(component.isSubmitting()).toBe(false);
  });

  it('should set isSubmitting to true on submit', () => {
    const fixture = createComponent(loginRoute);
    fixture.detectChanges();

    userService.login.mockReturnValue(of({ user: {} }));

    component.authForm.setValue({ email: 'test@test.com', password: 'pass' });
    component.submitForm();

    // isSubmitting was set to true before observable resolved
    // After subscribe next, it navigates but doesn't reset isSubmitting
    expect(component.isSubmitting()).toBe(true);
  });
});
