import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { readSession, SessionState } from '../../core/auth/session-state';
import { clearSession } from '../../core/auth/token-storage';

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
  protected readonly menuOpen = signal(false);

  private readonly handleStorageChange = () => {
    this.session.set(readSession());
    this.menuOpen.set(false);
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
    this.closeMenu();
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.closeMenu();
    this.router.navigate(['/register']);
  }

  goToArticles() {
    this.closeMenu();
    this.router.navigate(['/posts']);
  }

  logout() {
    clearSession();
    this.session.set(readSession());
    this.closeMenu();
    this.router.navigate(['/']);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  private closeMenu(): void {
    this.menuOpen.set(false);
  }
}
