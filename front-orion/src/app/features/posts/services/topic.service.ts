import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { Topic } from '../interfaces/topic.interface';

@Injectable({ providedIn: 'root' })
export class TopicService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/topics`;

  getTopics(): Observable<Topic[]> {
    return this.http
      .get<Topic[]>(this.endpoint)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error.error ?? error);
  }
}
