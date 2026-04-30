import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IfAuthenticatedDirective } from './if-authenticated.directive';
import { UserService } from './services/user.service';

@Component({
  template: `<span *ifAuthenticated="true">Authenticated</span>`,
  standalone: true,
  imports: [IfAuthenticatedDirective],
})
class TestAuthComponent {}

@Component({
  template: `<span *ifAuthenticated="false">Not Authenticated</span>`,
  standalone: true,
  imports: [IfAuthenticatedDirective],
})
class TestUnauthComponent {}

describe('IfAuthenticatedDirective', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let isAuthenticated$: BehaviorSubject<boolean>;

  beforeEach(() => {
    isAuthenticated$ = new BehaviorSubject<boolean>(false);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  function createFixture(componentClass: any) {
    TestBed.configureTestingModule({
      imports: [componentClass],
      providers: [
        {
          provide: UserService,
          useValue: {
            isAuthenticated: isAuthenticated$.asObservable(),
            currentUser: new BehaviorSubject(null).asObservable(),
          },
        },
      ],
    });
    return TestBed.createComponent(componentClass);
  }

  it('should show content when authenticated and condition is true', () => {
    isAuthenticated$.next(true);
    const fixture = createFixture(TestAuthComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Authenticated');
  });

  it('should hide content when not authenticated and condition is true', () => {
    isAuthenticated$.next(false);
    const fixture = createFixture(TestAuthComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Authenticated');
  });

  it('should show content when not authenticated and condition is false', () => {
    isAuthenticated$.next(false);
    const fixture = createFixture(TestUnauthComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Not Authenticated');
  });

  it('should hide content when authenticated and condition is false', () => {
    isAuthenticated$.next(true);
    const fixture = createFixture(TestUnauthComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Not Authenticated');
  });

  it('should update when auth state changes', () => {
    isAuthenticated$.next(false);
    const fixture = createFixture(TestAuthComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Authenticated');

    isAuthenticated$.next(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Authenticated');
  });
});
