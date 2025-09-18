import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import {
  RegisterErrorResponse,
  RegisterRequest,
} from './interfaces/register.interface';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  environmentApiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly endpointURL = `${this.environmentApiUrl}/auth/register`;

  register(payload: RegisterRequest): Observable<unknown> {
    return this.http.post<unknown>(this.endpointURL, payload).pipe(
      catchError((error: HttpErrorResponse) => {
        const apiError = error.error as RegisterErrorResponse | undefined;
        return throwError(() => apiError ?? error);
      })
    );
  }
}
