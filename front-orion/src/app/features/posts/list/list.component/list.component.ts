import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import {
  catchError,
  finalize,
  map,
  startWith,
  switchMap,
  take,
} from 'rxjs/operators';
import { Header } from '../../../../shared/header/header';
import { AUTH_USER_KEY } from '../../../../core/auth/auth-storage.constants';
import { PostListState } from '../../interfaces/post.interface';
import {
  SORT_OPTIONS,
  SORT_OPTION_MAP,
  SortValue,
} from '../../interfaces/post-sort.constants';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-list.component',
  imports: [CommonModule, Header, RouterModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {
  private readonly postService = inject(PostService);

  readonly sortOptions = SORT_OPTIONS;
  readonly skeletonPlaceholders = [0, 1, 2, 3];

  private readonly selectedSort = signal<SortValue>('date_desc');
  readonly currentSort = computed(() => this.selectedSort());

  private readonly authorId = signal<number | null>(this.readAuthorId());
  private readonly reloadCounter = signal(0);
  private readonly confirmingPostId = signal<number | string | null>(null);
  private readonly deletingPostId = signal<number | string | null>(null);
  readonly deleteError = signal<string | null>(null);

  private readonly query = computed(() => {
    const authorId = this.authorId();
    if (authorId === null) {
      return null;
    }

    this.reloadCounter();
    const option = SORT_OPTION_MAP[this.selectedSort()];
    return { authorId, query: option.query };
  });

  private readonly postsState = toSignal(
    toObservable(this.query).pipe(
      switchMap((params) => {
        if (!params) {
          return of<PostListState>({
            status: 'error',
            data: [],
            error: "Impossible de déterminer l'utilisateur connecté.",
          });
        }

        return this.postService
          .getPostsByAuthorId(params.authorId, params.query)
          .pipe(
            map(
              (posts) => ({ status: 'success', data: posts } as PostListState)
            ),
            catchError((error: unknown) =>
              of<PostListState>({
                status: 'error',
                data: [],
                error: this.resolveError(error),
              })
            ),
            startWith<PostListState>({ status: 'loading', data: [] })
          );
      })
    ),
    { initialValue: { status: 'idle', data: [] } as PostListState }
  );

  readonly posts = computed(() => this.postsState().data);
  readonly isLoading = computed(() => this.postsState().status === 'loading');
  readonly hasError = computed(() => this.postsState().status === 'error');
  readonly errorMessage = computed(() => this.postsState().error ?? null);
  readonly showEmptyState = computed(
    () => this.postsState().status === 'success' && this.posts().length === 0
  );
  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value;
    if (isSortValue(value)) {
      this.selectedSort.set(value);
    }
  }

  askDelete(postId: number | string): void {
    if (this.deletingPostId()) {
      return;
    }

    this.deleteError.set(null);
    this.confirmingPostId.set(postId);
  }

  cancelDelete(): void {
    if (this.deletingPostId()) {
      return;
    }

    this.confirmingPostId.set(null);
    this.deleteError.set(null);
  }

  confirmDelete(postId: number | string): void {
    if (this.deletingPostId()) {
      return;
    }

    this.deletingPostId.set(postId);
    this.deleteError.set(null);

    this.postService
      .deletePost(postId)
      .pipe(
        take(1),
        finalize(() => this.deletingPostId.set(null))
      )
      .subscribe({
        next: () => {
          this.confirmingPostId.set(null);
          this.reloadCounter.update((count) => count + 1);
        },
        error: (error) => {
          this.deleteError.set(this.resolveError(error));
        },
      });
  }

  isConfirming(postId: number | string): boolean {
    return this.confirmingPostId() === postId;
  }

  isDeleting(postId: number | string): boolean {
    return this.deletingPostId() === postId;
  }

  private readAuthorId(): number | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const userRaw = window.localStorage.getItem(AUTH_USER_KEY);
    if (!userRaw) {
      return null;
    }

    try {
      const parsed = JSON.parse(userRaw) as unknown;
      if (parsed && typeof parsed === 'object' && 'userId' in parsed) {
        const userIdValue = (parsed as { userId?: unknown }).userId;
        if (typeof userIdValue === 'number') {
          return userIdValue;
        }
        if (typeof userIdValue === 'string') {
          const numericId = Number.parseInt(userIdValue, 10);
          if (!Number.isNaN(numericId)) {
            return numericId;
          }
        }
      }
    } catch {
      return null;
    }

    return null;
  }

  private resolveError(error: unknown): string {
    if (
      error &&
      typeof error === 'object' &&
      'errors' in error &&
      Array.isArray((error as { errors?: unknown }).errors)
    ) {
      const [first] = (error as { errors?: string[] }).errors ?? [];
      if (typeof first === 'string' && first.trim().length > 0) {
        return first;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      return String((error as { message?: unknown }).message);
    }

    return 'Une erreur est survenue lors du chargement des articles.';
  }
}

function isSortValue(value: unknown): value is SortValue {
  return (
    value === 'date_desc' || value === 'date_asc' || value === 'title_desc'
  );
}
