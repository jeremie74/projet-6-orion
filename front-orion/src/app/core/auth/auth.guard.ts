import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from './auth-storage.constants';

const hasValidSession = (): boolean => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const userRaw = window.localStorage.getItem(AUTH_USER_KEY);

  if (!token || !userRaw) {
    return false;
  }

  try {
    const parsedUser = JSON.parse(userRaw);
    return (
      typeof parsedUser === 'object' &&
      parsedUser !== null &&
      typeof parsedUser.username === 'string' &&
      parsedUser.username.trim().length > 0
    );
  } catch {
    return false;
  }
};

export const authGuard: CanActivateFn = () => {
  if (hasValidSession()) {
    return true;
  }

  const router = inject(Router);
  return router.createUrlTree(['/']);
};
