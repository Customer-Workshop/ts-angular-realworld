import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './error.interceptor';
import { UserService } from '../auth/services/user.service';
import { JwtService } from '../auth/services/jwt.service';
import { Router } from '@angular/router';

describe('errorInterceptor', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let httpMock: HttpTestingController;
  let http: HttpClient;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        UserService,
        { provide: JwtService, useValue: { saveToken: vi.fn(), destroyToken: vi.fn(), getToken: vi.fn() } },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    userService = TestBed.inject(UserService);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should call purgeAuth on 401 for non-/user endpoints', () => {
    const purgeAuthSpy = vi.spyOn(userService, 'purgeAuth');

    http.get('/articles').subscribe({ error: () => {} });
    httpMock.expectOne('/articles').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(purgeAuthSpy).toHaveBeenCalled();
  });

  it('should NOT call purgeAuth on 401 for /user endpoint', () => {
    const purgeAuthSpy = vi.spyOn(userService, 'purgeAuth');

    http.get('/user').subscribe({ error: () => {} });
    httpMock.expectOne('/user').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(purgeAuthSpy).not.toHaveBeenCalled();
  });

  it('should normalize error body with errors property', () => {
    const errorBody = { errors: { email: ['is already taken'] } };

    http.get('/articles').subscribe({
      error: err => {
        expect(err.errors).toEqual(errorBody.errors);
        expect(err.status).toBe(422);
      },
    });

    httpMock.expectOne('/articles').flush(errorBody, { status: 422, statusText: 'Unprocessable Entity' });
  });

  it('should provide fallback message for network errors', () => {
    http.get('/articles').subscribe({
      error: err => {
        expect(err.errors.network).toBeDefined();
      },
    });

    httpMock.expectOne('/articles').error(new ProgressEvent('error'));
  });

  it('should not call purgeAuth on non-401 errors', () => {
    const purgeAuthSpy = vi.spyOn(userService, 'purgeAuth');

    http.get('/articles').subscribe({ error: () => {} });
    httpMock.expectOne('/articles').flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(purgeAuthSpy).not.toHaveBeenCalled();
  });
});
