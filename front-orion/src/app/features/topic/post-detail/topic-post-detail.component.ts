import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, of } from 'rxjs';
import { catchError, map, startWith, switchMap, take, finalize } from 'rxjs/operators';
import { Header } from '../../../shared/header/header';
import { Post, PostDetailState } from '../../posts/interfaces/post.interface';
import { PostService } from '../../posts/services/post.service';
import { CommentService } from '../../posts/services/comment.service';

@Component({
  selector: 'app-topic-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, Header],
  templateUrl: './topic-post-detail.component.html',
  styleUrl: './topic-post-detail.component.css',
})
export class TopicPostDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly postService = inject(PostService);
  private readonly commentService = inject(CommentService);

  private readonly reloadCounter = signal(0);

  private readonly routeParams = toSignal(
    this.route.paramMap.pipe(
      map((params) => ({
        topicId: params.get('topicId'),
        postId: params.get('postId'),
      }))
    ),
    { initialValue: { topicId: null, postId: null } }
  );

  readonly topicId = computed(() => this.routeParams().topicId);
  readonly postId = computed(() => this.routeParams().postId);

  private readonly stateSignal = toSignal(
    combineLatest([this.route.paramMap, toObservable(this.reloadCounter)]).pipe(
      map(([params]) => params.get('postId')),
      switchMap((postId) => {
        if (!postId) {
          return of<PostDetailState>({
            status: 'error',
            data: null,
            error: "Identifiant d'article manquant.",
          });
        }

        return this.postService.getPostById(postId).pipe(
          map((post) => ({ status: 'success', data: post } as PostDetailState)),
          catchError((err) =>
            of<PostDetailState>({
              status: 'error',
              data: null,
              error: this.resolveError(err),
            })
          ),
          startWith<PostDetailState>({ status: 'loading', data: null })
        );
      })
    ),
    { initialValue: { status: 'idle', data: null } as PostDetailState }
  );

  readonly post = computed<Post | null>(() => this.stateSignal().data);
  readonly isLoading = computed(() => this.stateSignal().status === 'loading');
  readonly hasError = computed(() => this.stateSignal().status === 'error');
  readonly errorMessage = computed(() => this.stateSignal().error ?? null);

  readonly commentForm = this.formBuilder.nonNullable.group({
    content: ['', [Validators.required, Validators.minLength(1)]],
  });
  readonly contentControl = this.commentForm.controls.content;
  readonly actionError = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  submitComment(): void {
    const postId = this.postId();
    if (!postId || this.isSubmitting() || this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const content = this.contentControl.value.trim();
    if (!content) {
      this.contentControl.setErrors({ required: true });
      return;
    }

    this.isSubmitting.set(true);
    this.actionError.set(null);
    this.commentService
      .createComment({ postId, content })
      .pipe(
        take(1),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: () => {
          this.commentForm.reset({ content: '' });
          this.reloadCounter.update((c) => c + 1);
        },
        error: (err) => {
          this.actionError.set(this.resolveError(err));
        },
      });
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

    return "Une erreur est survenue lors de l'envoi du commentaire.";
  }
}

