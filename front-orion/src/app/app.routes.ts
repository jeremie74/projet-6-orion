import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'posts',
    loadChildren: () =>
      import('./features/posts/posts.routes').then((m) => m.postsRoutes),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
