import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';

export const authRoutes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register').then((m) => m.RegisterComponent),
  },
];
