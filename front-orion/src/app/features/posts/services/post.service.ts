import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { Post, PostPayload } from '../interfaces/post.interface';
import { PostQueryOptions } from '../interfaces/post-sort.constants';

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

  getPostById(postId: number | string): Observable<Post> {
    return this.http
      .get<Post>(`${this.endpoint}/${postId}`)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  createPost(payload: PostPayload): Observable<Post> {
    return this.http
      .post<Post>(this.endpoint, payload)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  updatePost(postId: number | string, payload: PostPayload): Observable<Post> {
    return this.http
      .put<Post>(`${this.endpoint}/${postId}`, payload)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  deletePost(postId: number | string): Observable<void> {
    return this.http
      .delete<void>(`${this.endpoint}/${postId}`)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
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

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error.error ?? error);
  }
}
