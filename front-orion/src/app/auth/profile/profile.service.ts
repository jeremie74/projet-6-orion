import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

export interface MeResponse {
  id: number | string;
  username: string;
  email: string;
}

export interface UpdateProfileRequest {
  password: string;
  username?: string;
  email?: string;
  newPassword?: string;
}

export interface UpdateProfileResponse {
  user: { id: number | string; username: string; email: string };
  accessToken: string | null;
  refreshToken: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/auth/me`;

  getMe(): Observable<MeResponse> {
    return this.http
      .get<MeResponse>(this.endpoint)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  updateProfile(payload: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    return this.http
      .patch<UpdateProfileResponse>(this.endpoint, payload)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error.error ?? error);
  }
}

