import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { UserService } from '../../../core/auth/services/user.service';
import { User } from '../../../core/auth/user.model';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { Comment } from '../models/comment.model';
import { AsyncPipe, DatePipe } from '@angular/common';
import { DefaultImagePipe } from '../../../shared/pipes/default-image.pipe';

@Component({
  selector: 'app-article-comment',
  template: `
    @if (comment) {
      <div class="card" data-testid="comment-card">
        <div class="card-block" data-testid="comment-body">
          <p class="card-text">
            {{ comment.body }}
          </p>
        </div>
        <div class="card-footer">
          <a class="comment-author" [routerLink]="['/profile', comment.author.username]">
            <img
              [src]="comment.author.image | defaultImage"
              class="comment-author-img"
              data-testid="comment-author-img"
            />
          </a>
          &nbsp;
          <a class="comment-author" [routerLink]="['/profile', comment.author.username]">
            {{ comment.author.username }}
          </a>
          <span class="date-posted">
            {{ comment.createdAt | date: 'longDate' }}
          </span>
          @if (canModify$ | async) {
            <span class="mod-options">
              <i class="ion-trash-a" (click)="delete.emit(true)" data-testid="delete-comment"></i>
            </span>
          }
        </div>
      </div>
    }
  `,
  imports: [RouterLink, DatePipe, AsyncPipe, DefaultImagePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleCommentComponent {
  @Input() comment!: Comment;
  @Output() delete = new EventEmitter<boolean>();

  canModify$ = inject(UserService).currentUser.pipe(
    map((userData: User | null) => userData?.username === this.comment.author.username),
  );
}
