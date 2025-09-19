import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../../core/auth/auth-storage.constants';

type SessionState = {
  isAuthenticated: boolean;
  username: string | null;
};

const readSession = (): SessionState => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { isAuthenticated: false, username: null };
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const userRaw = window.localStorage.getItem(AUTH_USER_KEY);

  if (!token || !userRaw) {
    return { isAuthenticated: false, username: null };
  }

  try {
    const user = JSON.parse(userRaw);
    if (
      typeof user === 'object' &&
      user !== null &&
      typeof user.username === 'string' &&
      user.username.trim().length > 0
    ) {
      return { isAuthenticated: true, username: user.username };
    }
  } catch {
    return { isAuthenticated: false, username: null };
  }

  return { isAuthenticated: false, username: null };
};

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  protected readonly session = signal<SessionState>(readSession());
  protected readonly isAuthenticated = computed(
    () => this.session().isAuthenticated
  );
  protected readonly username = computed(() => this.session().username);
  protected readonly avatarSrc =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">
        <circle cx="12" cy="7" r="5" fill="#cbd5f5" />
        <path d="M4 22c0-4.418 3.582-8 8-8s8 3.582 8 8" fill="#8da2fb" />
        <circle cx="12" cy="7" r="3" fill="#4b5563" />
        <path d="M6.343 20.485A7.963 7.963 0 0 1 12 18a7.963 7.963 0 0 1 5.657 2.485" fill="#4b5563" />
      </svg>
    `);

  private readonly handleStorageChange = () => {
    this.session.set(readSession());
  };

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageChange);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToArticles() {
    this.router.navigate(['/posts']);
  }

  logout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      window.localStorage.removeItem(AUTH_USER_KEY);
    }

    this.session.set(readSession());
    this.router.navigate(['/']);
  }
}
