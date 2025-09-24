import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Header } from '../../shared/header/header';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { ProfileService, MeResponse, UpdateProfileRequest, UpdateProfileResponse } from './profile.service';
import { getAccessToken, getStoredUser, persistSession } from '../../core/auth/token-storage';
import { AUTH_USER_KEY } from '../../core/auth/auth-storage.constants';

type AsyncState<T> = { status: 'idle' | 'loading' | 'success' | 'error'; data: T; error?: string };

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, Header],
  templateUrl: './profile.html',
})
export class ProfileComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);

  private initial: MeResponse | null = null;

  readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    newPassword: [''],
  });

  readonly showNewPassword = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly isSubmitting = signal(false);
  readonly successMessage = signal<string | null>(null);

  private readonly meState = toSignal(
    this.profileService.getMe().pipe(
      map((me) => ({ status: 'success', data: me } as AsyncState<MeResponse>)),
      catchError((err) => of({ status: 'error', data: null, error: this.resolveError(err) } as AsyncState<any>)),
      startWith({ status: 'loading', data: null } as AsyncState<any>)
    ),
    { initialValue: { status: 'idle', data: null } as AsyncState<any> }
  );

  readonly isLoading = computed(() => this.meState().status === 'loading');
  readonly hasError = computed(() => this.meState().status === 'error');
  readonly errorMessage = computed(() => this.meState().error ?? null);

  constructor() {
    effect(
      () => {
        const state = this.meState();
        if (state.status === 'success' && state.data) {
          this.initial = state.data;
          this.form.patchValue({
            username: state.data.username,
            email: state.data.email,
            password: '',
            newPassword: '',
          });
        }
      },
      { allowSignalWrites: true }
    );
  }

  toggleChangePassword(): void {
    this.showNewPassword.update((v) => !v);
    const ctrl = this.form.controls.newPassword;
    if (this.showNewPassword()) {
      ctrl.addValidators([Validators.minLength(6)]);
    } else {
      ctrl.clearValidators();
      ctrl.setValue('');
    }
    ctrl.updateValueAndValidity();
  }

  canSubmit(): boolean {
    if (!this.initial) return false;
    const v = this.form.getRawValue();
    const somethingChanged =
      v.username.trim() !== this.initial.username ||
      v.email.trim() !== this.initial.email ||
      (this.showNewPassword() && v.newPassword.trim().length >= 6);

    return (
      somethingChanged &&
      v.password.trim().length > 0 &&
      this.form.valid &&
      !this.isSubmitting()
    );
  }

  submit(): void {
    if (!this.initial || !this.canSubmit()) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, email, password, newPassword } = this.form.getRawValue();
    const payload: UpdateProfileRequest = { password: password.trim() };

    if (username.trim() !== this.initial.username) {
      payload.username = username.trim();
    }

    if (email.trim() !== this.initial.email) {
      payload.email = email.trim();
    }

    if (this.showNewPassword() && newPassword.trim().length >= 6) {
      payload.newPassword = newPassword.trim();
    }

    this.actionError.set(null);
    this.isSubmitting.set(true);
    this.profileService.updateProfile(payload).subscribe({
      next: (res) => this.handleSuccess(res),
      error: (err) => {
        this.actionError.set(this.resolveError(err));
        this.isSubmitting.set(false);
      },
    });
  }

  private handleSuccess(res: UpdateProfileResponse): void {
    // Mettre à jour le storage selon la rotation des tokens
    const userId = this.initial?.id ?? res.user.id;
    const username = res.user.username;

    if (res.accessToken && res.refreshToken) {
      // met à jour tokens + user
      persistSession({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        userId: typeof userId === 'number' ? userId : Number(userId),
        username,
      });
    } else {
      // pas de rotation: on met à jour le user stocké
      try {
        const stored = getStoredUser();
        if (stored) {
          const next = { ...stored, username };
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(next));
          // notify header
          window.dispatchEvent(new Event('storage'));
        }
      } catch {}
    }

    // Re-synchronise l'état courant
    this.isSubmitting.set(false);
    this.form.controls.password.setValue('');
    // Met à jour la baseline initiale avec les nouvelles valeurs
    this.initial = {
      id: userId,
      username: res.user.username,
      email: res.user.email,
    } as MeResponse;

    // Si le champ nouveau mot de passe était affiché, on le referme et on le nettoie
    if (this.showNewPassword()) {
      this.showNewPassword.set(false);
      const ctrl = this.form.controls.newPassword;
      ctrl.clearValidators();
      ctrl.setValue('');
      ctrl.updateValueAndValidity({ emitEvent: false });
    }

    this.successMessage.set('Vos informations ont bien été mises à jour.');
  }

  dismissSuccess(): void {
    this.successMessage.set(null);
  }

  private resolveError(error: unknown): string {
    if (
      error &&
      typeof error === 'object' &&
      'errors' in error &&
      Array.isArray((error as { errors?: unknown }).errors)
    ) {
      const [first] = (error as { errors?: string[] }).errors ?? [];
      if (typeof first === 'string' && first.trim().length > 0) {
        return first;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      return String((error as { message?: unknown }).message);
    }

    return "Une erreur est survenue lors de la mise à jour du profil.";
  }
}
