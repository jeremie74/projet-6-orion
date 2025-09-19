import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import {
  LoginErrorResponse,
  LoginRequest,
  LoginSuccessResponse,
} from './interfaces/login.interface';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/auth/login`;

  login(payload: LoginRequest): Observable<LoginSuccessResponse> {
    return this.http.post<LoginSuccessResponse>(this.endpoint, payload).pipe(
      catchError((error: HttpErrorResponse) => {
        const apiError = error.error as LoginErrorResponse | undefined;
        return throwError(() => apiError ?? error);
      })
    );
  }
}
