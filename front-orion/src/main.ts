import {
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { from, throwError, firstValueFrom } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { App } from './app/app';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment.development';
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  updateStoredTokens,
} from './app/core/auth/token-storage';
import { LoginSuccessResponse } from './app/auth/login/interfaces/login.interface';

const isBrowser = () => typeof window !== 'undefined';

const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isBrowser() || req.url.includes('/auth/')) {
    return next(req);
  }

  const token = getAccessToken();

  if (!token) {
    return next(req);
  }

  const authorizedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authorizedRequest);
};

let refreshPromise: Promise<LoginSuccessResponse | null> | null = null;

const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status !== 401 ||
        !isBrowser() ||
        req.headers.has('X-Retry') ||
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/register') ||
        req.url.includes('/auth/refresh')
      ) {
        return throwError(() => error);
      }

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearSession();
        if (router.url !== '/login') {
          void router.navigate(['/login']);
        }
        return throwError(() => error);
      }

      if (!refreshPromise) {
        refreshPromise = firstValueFrom(
          http.post<LoginSuccessResponse>(
            `${environment.apiUrl}/auth/refresh`,
            {
              refreshToken,
            }
          )
        )
          .then((response) => {
            updateStoredTokens({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            });

            return response;
          })
          .catch((refreshError: HttpErrorResponse) => {
            clearSession();
            if (router.url !== '/login') {
              void router.navigate(['/login']);
            }

            console.error('Refresh token request failed', refreshError);
            return null;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      return from(refreshPromise).pipe(
        switchMap((response) => {
          if (!response) {
            return throwError(() => error);
          }

          const retriedRequest = req.clone({
            setHeaders: {
              Authorization: `Bearer ${response.accessToken}`,
              'X-Retry': 'true',
            },
          });

          return next(retriedRequest);
        }),
        catchError(() => {
          clearSession();
          if (router.url !== '/login') {
            void router.navigate(['/login']);
          }
          return throwError(() => error);
        })
      );
    })
  );
};

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(
      withInterceptors([authTokenInterceptor, refreshTokenInterceptor])
    ),
  ],
}).catch((err) => console.error(err));
