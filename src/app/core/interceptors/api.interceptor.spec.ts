import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './api.interceptor';

describe('apiInterceptor', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let httpMock: HttpTestingController;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiInterceptor])), provideHttpClientTesting()],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should prepend the API base URL to the request', () => {
    http.get('/articles').subscribe();
    const req = httpMock.expectOne('https://api.realworld.show/api/articles');
    expect(req.request.url).toBe('https://api.realworld.show/api/articles');
    req.flush({});
  });

  it('should prepend the API base URL for POST requests', () => {
    http.post('/users/login', {}).subscribe();
    const req = httpMock.expectOne('https://api.realworld.show/api/users/login');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
