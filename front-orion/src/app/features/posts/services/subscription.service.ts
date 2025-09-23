import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/subscriptions`;

  getMySubscriptions(): Observable<UserSubscription[]> {
    return this.http
      .get<UserSubscription[]>(`${this.endpoint}/me`)
      .pipe(
        map((subs) => subs),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  subscribe(topicId: number | string): Observable<void> {
    return this.http
      .post<void>(this.endpoint, { topicId })
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  unsubscribe(subscriptionId: number | string): Observable<void> {
    return this.http
      .delete<void>(`${this.endpoint}/${subscriptionId}`)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error.error ?? error);
  }
}

export type UserSubscription = { id: number | string; topicId: number | string };
