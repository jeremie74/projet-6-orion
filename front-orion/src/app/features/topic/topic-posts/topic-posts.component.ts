import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, forkJoin } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Header } from '../../../shared/header/header';
import { Post, PostListState } from '../../posts/interfaces/post.interface';
import { TopicService } from '../../posts/services/topic.service';
import { PostService } from '../../posts/services/post.service';

@Component({
  selector: 'app-topic-posts',
  standalone: true,
  imports: [CommonModule, RouterModule, Header],
  templateUrl: './topic-posts.component.html',
  styleUrl: './topic-posts.component.css',
})
export class TopicPostsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly postService = inject(PostService);
  private readonly topicService = inject(TopicService);

  private readonly routeTopicId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null }
  );

  readonly topicId = computed<number | string | null>(() => this.routeTopicId());

  private readonly state = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id')),
      map((id: string | null) => (id ? id : null)),
      switchMap((id) => {
        if (!id) {
          return of<PostListState>({ status: 'error', data: [], error: 'Identifiant de thème manquant.' });
        }

        const topicNameFromState: string | null = (typeof history !== 'undefined' && history.state && typeof history.state['topicName'] === 'string')
          ? (history.state['topicName'] as string)
          : null;

        const posts$ = this.postService.getPostsByTopicId(id);
        const name$ = topicNameFromState
          ? of(topicNameFromState)
          : this.topicService.getTopics().pipe(
              map((topics) => topics.find((t) => String(t.id) === String(id))?.name ?? null),
              catchError(() => of<string | null>(null))
            );

        return forkJoin({ posts: posts$, name: name$ }).pipe(
          map(({ posts, name }) => ({ status: 'success', data: posts, error: undefined, }) as PostListState & { topicName?: string | null }),
          startWith<PostListState>({ status: 'loading', data: [] }),
          catchError((err) => of<PostListState>({ status: 'error', data: [], error: this.resolveError(err) }))
        );
      })
    ),
    { initialValue: { status: 'idle', data: [] } as PostListState }
  );

  readonly posts = computed<Post[]>(() => (this.state() as PostListState).data);
  readonly isLoading = computed(() => (this.state() as PostListState).status === 'loading');
  readonly hasError = computed(() => (this.state() as PostListState).status === 'error');
  readonly errorMessage = computed(() => (this.state() as PostListState).error ?? null);

  // Optionnel: nom du thème si disponible
  readonly topicLabel = computed<string | null>(() => {
    const id = this.topicId();
    if (!id) return null;
    // Essayons d'abord l'état de navigation
    const fromState = (typeof history !== 'undefined' && history.state && typeof history.state['topicName'] === 'string')
      ? (history.state['topicName'] as string)
      : null;
    if (fromState) return fromState;
    // Sinon, essaye d'inférer depuis le premier post
    const first = this.posts()[0];
    return first?.topicName ?? null;
  });

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
