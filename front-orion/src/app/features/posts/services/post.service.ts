import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { Post, PostQueryOptions } from '../interfaces/post.interface';

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/posts`;

  getPostsByAuthorId(
    authorId: number | string,
    options?: PostQueryOptions
  ): Observable<Post[]> {
    const params = this.buildQueryParams(options);

    return this.http
      .get<Post[]>(`${this.endpoint}/user/${authorId}`, { params })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError(() => error.error ?? error)
        )
      );
  }

  // TODO: implement once create flow is ready.
  createPost(post: unknown): Observable<Post> {
    throw new Error('createPost not implemented yet.');
  }

  // TODO: implement once update flow is ready.
  updatePost(post: unknown): Observable<Post> {
    throw new Error('updatePost not implemented yet.');
  }

  private buildQueryParams(options: PostQueryOptions = {}): HttpParams {
    let params = new HttpParams();

    if (options.sort) {
      params = params.set('sort', options.sort);
    }

    if (options.order) {
      params = params.set('order', options.order);
    }

    return params;
  }
}
