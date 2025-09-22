import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { hasActiveSession } from './token-storage';

export const authGuard: CanActivateFn = () => {
  if (hasActiveSession()) {
    return true;
  }

  const router = inject(Router);
  return router.createUrlTree(['/']);
};
