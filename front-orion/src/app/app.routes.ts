import { Routes } from '@angular/router';
import { Home } from './auth/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register').then((m) => m.Register),
  },
];
