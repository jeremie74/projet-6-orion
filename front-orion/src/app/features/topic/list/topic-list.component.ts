import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { Header } from '../../../shared/header/header';
import { Topic, TopicListState } from '../../posts/interfaces/topic.interface';
import { TopicService } from '../../posts/services/topic.service';
import {
  SubscriptionService,
  type UserSubscription,
} from '../../posts/services/subscription.service';

@Component({
  selector: 'app-topic-list',
  imports: [CommonModule, Header, RouterModule],
  templateUrl: './topic-list.component.html',
  styleUrl: './topic-list.component.css',
})
export class TopicListComponent {
  private readonly topicService = inject(TopicService);
  private readonly subscriptionService = inject(SubscriptionService);

  private readonly subscriptionsMap = signal(
    new Map<number | string, number | string>()
  );

  private readonly topicsState = toSignal(
    forkJoin({
      topics: this.topicService.getTopics(),
      subs: this.subscriptionService
        .getMySubscriptions()
        .pipe(catchError(() => of<UserSubscription[]>([]))),
    }).pipe(
      map(({ topics, subs }) => {
        this.setSubscriptionsMap(subs);
        return { status: 'success', data: topics } as TopicListState;
      }),
      catchError((err) =>
        of<TopicListState>({
          status: 'error',
          data: [],
          error: this.resolveError(err),
        })
      ),
      startWith<TopicListState>({ status: 'loading', data: [] })
    ),
    { initialValue: { status: 'idle', data: [] } as TopicListState }
  );

  readonly topics = computed<Topic[]>(() => this.topicsState().data);
  readonly isLoading = computed(() => this.topicsState().status === 'loading');
  readonly hasError = computed(() => this.topicsState().status === 'error');
  readonly errorMessage = computed(() => this.topicsState().error ?? null);

  // Local UI state for subscriptions
  private readonly subscribed = signal(new Set<number | string>());
  private readonly processing = signal(new Set<number | string>());
  readonly actionError = signal<string | null>(null);

  isSubscribed(topicId: number | string): boolean {
    return this.subscriptionsMap().has(topicId);
  }

  isProcessing(topicId: number | string): boolean {
    return this.processing().has(topicId);
  }

  toggleSubscription(topicId: number | string): void {
    this.actionError.set(null);
    if (this.isSubscribed(topicId)) {
      this.unsubscribe(topicId);
    } else {
      this.subscribe(topicId);
    }
  }

  private subscribe(topicId: number | string): void {
    this.updateProcessing(topicId, true);
    this.subscriptionService.subscribe(topicId).subscribe({
      next: () => {
        // Bascule immédiate côté UI
        const tmp = new Map(this.subscriptionsMap());
        // On met un placeholder pour l'ID, puis on rafraîchit après
        tmp.set(topicId, '__pending__');
        this.subscriptionsMap.set(tmp);

        // Rafraîchit la map pour obtenir l'ID réel
        this.refreshSubscriptionsMap();
      },
      error: (err) => this.actionError.set(this.resolveError(err)),
      complete: () => this.updateProcessing(topicId, false),
    });
  }

  private unsubscribe(topicId: number | string): void {
    this.updateProcessing(topicId, true);
    const subId = this.subscriptionsMap().get(topicId);
    if (!subId || subId === '__pending__') {
      // Essaye de rafraîchir la map puis réessaye
      this.subscriptionService
        .getMySubscriptions()
        .subscribe({
          next: (subs) => {
            this.setSubscriptionsMap(subs);
            const id = this.subscriptionsMap().get(topicId);
            if (!id || id === '__pending__') {
              this.actionError.set('Abonnement introuvable');
              this.updateProcessing(topicId, false);
              return;
            }
            this.finishUnsubscribe(topicId, id);
          },
          error: (err) => {
            this.actionError.set(this.resolveError(err));
            this.updateProcessing(topicId, false);
          },
        });
      return;
    }

    this.finishUnsubscribe(topicId, subId);
  }

  private finishUnsubscribe(
    topicId: number | string,
    subscriptionId: number | string
  ): void {
    this.subscriptionService.unsubscribe(subscriptionId).subscribe({
      next: () => {
        const next = new Map(this.subscriptionsMap());
        next.delete(topicId);
        this.subscriptionsMap.set(next);
      },
      error: (err) => this.actionError.set(this.resolveError(err)),
      complete: () => this.updateProcessing(topicId, false),
    });
  }

  private refreshSubscriptionsMap(): void {
    this.subscriptionService.getMySubscriptions().subscribe({
      next: (subs) => this.setSubscriptionsMap(subs),
      error: () => {},
    });
  }

  private setSubscriptionsMap(subs: UserSubscription[]): void {
    const map = new Map<number | string, number | string>();
    for (const s of subs) {
      map.set(s.topicId, s.id);
    }
    this.subscriptionsMap.set(map);
  }

  private updateProcessing(topicId: number | string, add: boolean): void {
    const next = new Set(this.processing());
    if (add) {
      next.add(topicId);
    } else {
      next.delete(topicId);
    }
    this.processing.set(next);
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

    return 'Une erreur est survenue lors du chargement des thèmes.';
  }
}
