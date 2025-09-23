import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Header } from '../../../shared/header/header';
import {
  PostDetailState,
  PostPayload,
  SubmissionState,
} from '../interfaces/post.interface';
import { Topic, TopicListState } from '../interfaces/topic.interface';
import { PostService } from '../services/post.service';
import { TopicService } from '../services/topic.service';

type PostFormMode = 'create' | 'edit';

type SubmissionCommand =
  | {
      mode: 'create';
      payload: PostPayload;
    }
  | {
      mode: 'edit';
      postId: string;
      payload: PostPayload;
    };

const INITIAL_FORM_VALUE: PostPayload = {
  title: '',
  content: '',
  topicId: '',
};

@Component({
  selector: 'app-post-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Header],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.css',
})
export class PostFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly postService = inject(PostService);
  private readonly topicService = inject(TopicService);

  private readonly formInitialized = signal(false);
  private readonly submissionError = signal<string | null>(null);

  readonly postForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    content: ['', [Validators.required, Validators.minLength(10)]],
    topicId: ['', Validators.required],
  });

  readonly titleControl = this.postForm.controls.title;
  readonly contentControl = this.postForm.controls.content;
  readonly topicIdControl = this.postForm.controls.topicId;

  private readonly routePostId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null }
  );

  readonly postId = computed(() => this.routePostId());
  readonly mode = computed<PostFormMode>(() =>
    this.postId() ? 'edit' : 'create'
  );

  private readonly postState = toSignal(
    toObservable(this.postId).pipe(
      switchMap((id) => {
        if (!id) {
          return of<PostDetailState>({ status: 'idle', data: null });
        }

        return this.postService.getPostById(id).pipe(
          map((post) => ({ status: 'success', data: post } as PostDetailState)),
          catchError((error: unknown) =>
            of<PostDetailState>({
              status: 'error',
              data: null,
              error: this.resolveError(error),
            })
          ),
          startWith<PostDetailState>({ status: 'loading', data: null })
        );
      })
    ),
    { initialValue: { status: 'idle', data: null } as PostDetailState }
  );

  private readonly topicsState = toSignal(
    this.topicService.getTopics().pipe(
      map((topics) => ({ status: 'success', data: topics } as TopicListState)),
      catchError((error: unknown) =>
        of<TopicListState>({
          status: 'error',
          data: [],
          error: this.resolveError(error),
        })
      ),
      startWith<TopicListState>({ status: 'loading', data: [] })
    ),
    { initialValue: { status: 'idle', data: [] } as TopicListState }
  );

  readonly isEditMode = computed(() => this.mode() === 'edit');
  readonly isLoadingPost = computed(
    () => this.postState().status === 'loading'
  );
  readonly loadError = computed(() => this.postState().error ?? null);
  readonly topics = computed(() => this.topicsState().data);
  readonly isLoadingTopics = computed(
    () => this.topicsState().status === 'loading'
  );
  readonly topicsError = computed(() =>
    this.topicsState().status === 'error'
      ? this.topicsState().error ?? null
      : null
  );

  private readonly submissionTrigger = signal<SubmissionCommand | null>(null);

  private readonly submissionState = toSignal(
    toObservable(this.submissionTrigger).pipe(
      switchMap((command) => {
        if (!command) {
          return of<SubmissionState>({ status: 'idle', data: null });
        }

        if (command.mode === 'create') {
          return this.postService.createPost(command.payload).pipe(
            map(() => ({ status: 'success', data: null } as SubmissionState)),
            catchError((error: unknown) =>
              of<SubmissionState>({
                status: 'error',
                data: null,
                error: this.resolveError(error),
              })
            ),
            startWith<SubmissionState>({ status: 'loading', data: null })
          );
        }

        return this.postService
          .updatePost(command.postId, command.payload)
          .pipe(
            map(() => ({ status: 'success', data: null } as SubmissionState)),
            catchError((error: unknown) =>
              of<SubmissionState>({
                status: 'error',
                data: null,
                error: this.resolveError(error),
              })
            ),
            startWith<SubmissionState>({ status: 'loading', data: null })
          );
      })
    ),
    { initialValue: { status: 'idle', data: null } }
  );

  readonly isSubmitting = computed(
    () => this.submissionState().status === 'loading'
  );

  constructor() {
    effect(
      () => {
        const state = this.postState();
        const topicsState = this.topicsState();

        if (!this.isEditMode()) {
          return;
        }

        if (state.status === 'error') {
          this.formInitialized.set(true);
          return;
        }

        if (
          state.status === 'success' &&
          state.data &&
          topicsState.status === 'success' &&
          !this.formInitialized()
        ) {
          const topicIdFromPost = state.data.topicId;
          const targetTopicId =
            topicIdFromPost !== undefined && topicIdFromPost !== null
              ? String(topicIdFromPost)
              : String(
                  this.matchTopicByName(topicsState.data, state.data.topicName)
                    ?.id ?? ''
                );

          this.postForm.patchValue({
            title: state.data.title,
            content: state.data.content,
            topicId: targetTopicId,
          });
          this.formInitialized.set(true);
        }
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const submission = this.submissionState();

        if (submission.status === 'loading') {
          this.submissionError.set(null);
          return;
        }

        if (submission.status === 'error') {
          this.submissionError.set(
            submission.error ??
              "Une erreur est survenue lors de l'enregistrement."
          );
          return;
        }

        if (submission.status === 'success') {
          this.submissionError.set(null);
          this.router.navigate(['/posts/list']);
        }
      },
      { allowSignalWrites: true }
    );
  }

  get submissionErrorMessage(): string | null {
    return this.submissionError();
  }

  get disableForm(): boolean {
    const topicsSnapshot = this.topicsState();
    const topicsReady =
      topicsSnapshot.status === 'success' && topicsSnapshot.data.length > 0;
    const postReady =
      !this.isEditMode() || this.postState().status === 'success';
    return !topicsReady || !postReady;
  }

  submit(): void {
    if (this.disableForm) {
      return;
    }

    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    const { title, content, topicId } = this.postForm.getRawValue();
    const sanitizedPayload: PostPayload = {
      title: title.trim(),
      content: content.trim(),
      topicId: topicId.trim(),
    };

    if (!sanitizedPayload.topicId) {
      this.topicIdControl.setErrors({ required: true });
      return;
    }

    if (this.mode() === 'create') {
      this.submissionTrigger.set({
        mode: 'create',
        payload: sanitizedPayload,
      });
      return;
    }

    const postId = this.postId();
    if (!postId) {
      this.submissionError.set("Identifiant d'article manquant.");
      return;
    }

    this.submissionTrigger.set({
      mode: 'edit',
      postId,
      payload: sanitizedPayload,
    });
  }

  resetForm(): void {
    this.postForm.reset(INITIAL_FORM_VALUE);
  }

  cancel(): void {
    this.router.navigate(['/posts/list']);
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

    return "Une erreur inattendue s'est produite.";
  }

  private matchTopicByName(
    topics: Topic[],
    name: string | null
  ): Topic | null {
    if (!name) {
      return null;
    }

    const target = name.trim().toLowerCase();

    // Certains endpoints renvoient topicName correspondant au "description" (ex: "AI").
    // On tente d'abord sur name, puis sur description.
    return (
      topics.find((t) => t.name?.trim().toLowerCase() === target) ??
      topics.find((t) => t.description?.trim().toLowerCase() === target) ??
      null
    );
  }
}
