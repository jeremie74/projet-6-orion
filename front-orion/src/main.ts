import {
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AUTH_TOKEN_KEY } from './app/core/auth/auth-storage.constants';
import { App } from './app/app';

const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  if (typeof window === 'undefined') {
    return next(req);
  }

  const token = localStorage.getItem(AUTH_TOKEN_KEY);

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

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(withInterceptors([authTokenInterceptor])),
  ],
}).catch((err) => console.error(err));
