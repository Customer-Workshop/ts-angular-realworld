import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import EditorComponent from './editor.component';
import { ArticlesService } from '../../services/articles.service';
import { UserService } from '../../../../core/auth/services/user.service';
import { Article } from '../../models/article.model';

describe('EditorComponent', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let component: EditorComponent;
  let articlesService: any;
  let router: any;

  const mockArticle: Article = {
    slug: 'test-article',
    title: 'Test Title',
    description: 'Test Description',
    body: 'Test Body',
    tagList: ['tag1', 'tag2'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-02',
    favorited: false,
    favoritesCount: 0,
    author: { username: 'testuser', bio: null, image: null, following: false },
  };

  beforeEach(() => {
    articlesService = {
      create: vi.fn(() => of(mockArticle)),
      update: vi.fn(() => of(mockArticle)),
      get: vi.fn(() => of(mockArticle)),
    };
    router = { navigate: vi.fn() };
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  function createComponent(slug?: string) {
    TestBed.configureTestingModule({
      imports: [EditorComponent],
      providers: [
        { provide: ArticlesService, useValue: articlesService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: slug ? { slug } : {} } },
        },
        {
          provide: UserService,
          useValue: {
            getCurrentUser: vi.fn(() =>
              of({ user: { username: 'testuser', email: 'test@test.com', token: 'token', bio: null, image: null } }),
            ),
            currentUser: new BehaviorSubject(null).asObservable(),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    return fixture;
  }

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form for new article', () => {
    const fixture = createComponent();
    fixture.detectChanges();
    expect(component.articleForm.value).toEqual({ title: '', description: '', body: '' });
    expect(component.tagList()).toEqual([]);
  });

  it('should load article data when editing existing article', () => {
    const fixture = createComponent('test-article');
    fixture.detectChanges();
    expect(articlesService.get).toHaveBeenCalledWith('test-article');
  });

  it('should add a tag', () => {
    createComponent();
    component.tagField.setValue('newtag');
    component.addTag();
    expect(component.tagList()).toContain('newtag');
    expect(component.tagField.value).toBe('');
  });

  it('should not add duplicate tags', () => {
    createComponent();
    component.tagField.setValue('tag1');
    component.addTag();
    component.tagField.setValue('tag1');
    component.addTag();
    expect(component.tagList().filter(t => t === 'tag1').length).toBe(1);
  });

  it('should not add empty tags', () => {
    createComponent();
    component.tagField.setValue('');
    component.addTag();
    expect(component.tagList()).toEqual([]);
  });

  it('should not add whitespace-only tags', () => {
    createComponent();
    component.tagField.setValue('   ');
    component.addTag();
    expect(component.tagList()).toEqual([]);
  });

  it('should remove a tag', () => {
    createComponent();
    component.tagField.setValue('tag1');
    component.addTag();
    component.tagField.setValue('tag2');
    component.addTag();
    component.removeTag('tag1');
    expect(component.tagList()).toEqual(['tag2']);
  });

  it('should create article on submit for new article', () => {
    const fixture = createComponent();
    fixture.detectChanges();

    component.articleForm.patchValue({ title: 'New', description: 'Desc', body: 'Body' });
    component.submitForm();

    expect(articlesService.create).toHaveBeenCalled();
  });

  it('should update article on submit for existing article', () => {
    const fixture = createComponent('test-article');
    fixture.detectChanges();

    component.submitForm();
    expect(articlesService.update).toHaveBeenCalled();
  });

  it('should navigate to article on successful submit', () => {
    const fixture = createComponent();
    fixture.detectChanges();

    component.submitForm();
    expect(router.navigate).toHaveBeenCalledWith(['/article/', 'test-article']);
  });

  it('should set errors on failed submit', () => {
    const errors = { errors: { title: 'is required' } };
    articlesService.create.mockReturnValue(throwError(() => errors));

    const fixture = createComponent();
    fixture.detectChanges();

    component.submitForm();
    expect(component.errors()).toEqual(errors);
    expect(component.isSubmitting()).toBe(false);
  });
});
