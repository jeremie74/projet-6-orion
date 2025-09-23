import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

export interface CreateCommentPayload {
  postId: number | string;
  content: string;
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/comments`;

  createComment(payload: CreateCommentPayload): Observable<void> {
    return this.http
      .post<void>(this.endpoint, payload)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error.error ?? error);
  }
}

