import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { User } from '../../../../core/auth/user.model';
import { Article } from '../../models/article.model';
import { ArticlesService } from '../../services/articles.service';
import { CommentsService } from '../../services/comments.service';
import { UserService } from '../../../../core/auth/services/user.service';
import { ArticleMetaComponent } from '../../components/article-meta.component';
import { AsyncPipe, NgClass } from '@angular/common';
import { MarkdownPipe } from '../../../../shared/pipes/markdown.pipe';
import { ListErrorsComponent } from '../../../../shared/components/list-errors.component';
import { ArticleCommentComponent } from '../../components/article-comment.component';
import { catchError } from 'rxjs/operators';
import { combineLatest, throwError } from 'rxjs';
import { Comment } from '../../models/comment.model';
import { IfAuthenticatedDirective } from '../../../../core/auth/if-authenticated.directive';
import { Errors } from '../../../../core/models/errors.model';
import { Profile } from '../../../profile/models/profile.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FavoriteButtonComponent } from '../../components/favorite-button.component';
import { FollowButtonComponent } from '../../../profile/components/follow-button.component';

@Component({
  selector: 'app-article-page',
  templateUrl: './article.component.html',
  imports: [
    ArticleMetaComponent,
    RouterLink,
    NgClass,
    FollowButtonComponent,
    FavoriteButtonComponent,
    MarkdownPipe,
    AsyncPipe,
    ListErrorsComponent,
    FormsModule,
    ArticleCommentComponent,
    ReactiveFormsModule,
    IfAuthenticatedDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ArticleComponent implements OnInit {
  article = signal<Article>(null!);
  currentUser = signal<User | null>(null);
  comments = signal<Comment[]>([]);
  canModify = signal(false);

  commentControl = new FormControl<string>('', { nonNullable: true });
  commentFormErrors = signal<Errors | null>(null);

  isSubmitting = signal(false);
  isDeleting = signal(false);
  destroyRef = inject(DestroyRef);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly articleService: ArticlesService,
    private readonly commentsService: CommentsService,
    private readonly router: Router,
    private readonly userService: UserService,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.params['slug'];
    combineLatest([this.articleService.get(slug), this.commentsService.getAll(slug), this.userService.currentUser])
      .pipe(
        catchError(err => {
          void this.router.navigate(['/']);
          return throwError(() => err);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(([article, comments, currentUser]) => {
        this.article.set(article);
        this.comments.set(comments);
        this.currentUser.set(currentUser);
        this.canModify.set(currentUser?.username === article.author.username);
      });
  }

  onToggleFavorite(favorited: boolean): void {
    this.article.update(article => ({
      ...article,
      favorited,
      favoritesCount: favorited ? article.favoritesCount + 1 : article.favoritesCount - 1,
    }));
  }

  toggleFollowing(profile: Profile): void {
    this.article.update(article => ({
      ...article,
      author: { ...article.author, following: profile.following },
    }));
  }

  deleteArticle(): void {
    this.isDeleting.set(true);

    this.articleService
      .delete(this.article().slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        void this.router.navigate(['/']);
      });
  }

  addComment() {
    this.isSubmitting.set(true);
    this.commentFormErrors.set(null);

    this.commentsService
      .add(this.article().slug, this.commentControl.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: comment => {
          this.comments.update(comments => [comment, ...comments]);
          this.commentControl.reset('');
          this.isSubmitting.set(false);
        },
        error: errors => {
          this.isSubmitting.set(false);
          this.commentFormErrors.set(errors);
        },
      });
  }

  deleteComment(comment: Comment): void {
    this.commentsService
      .delete(comment.id, this.article().slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.comments.update(comments => comments.filter(item => item !== comment));
      });
  }
}
