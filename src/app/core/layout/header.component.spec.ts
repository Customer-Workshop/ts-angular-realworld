import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { HeaderComponent } from './header.component';
import { UserService } from '../auth/services/user.service';
import { User } from '../auth/user.model';
import { AuthState } from '../auth/services/user.service';

describe('HeaderComponent', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let currentUser$: BehaviorSubject<User | null>;
  let authState$: BehaviorSubject<AuthState>;

  beforeEach(() => {
    currentUser$ = new BehaviorSubject<User | null>(null);
    authState$ = new BehaviorSubject<AuthState>('loading');

    TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [
        {
          provide: UserService,
          useValue: {
            currentUser: currentUser$.asObservable(),
            authState: authState$.asObservable(),
          },
        },
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should expose currentUser$', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance.currentUser$).toBeTruthy();
  });

  it('should expose authState$', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance.authState$).toBeTruthy();
  });
});
