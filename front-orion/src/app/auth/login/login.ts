import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Header } from './../../shared/header/header';
import {
  LoginErrorResponse,
  LoginRequest,
  LoginSuccessResponse,
} from './interfaces/login.interface';
import { LoginService } from './login.service';
import { LoginState } from './interfaces/login-state.type';
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
} from '../../core/auth/auth-storage.constants';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, Header],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

  readonly loginForm = this.formBuilder.nonNullable.group({
    identifier: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly identifierControl = this.loginForm.controls.identifier;
  readonly passwordControl = this.loginForm.controls.password;
  private readonly submissionTrigger = signal<LoginRequest | null>(null);
  readonly errorMessages = signal<string[] | null>(null);
  showPassword = false;

  private readonly loginStateSignal = toSignal(
    toObservable(this.submissionTrigger).pipe(
      switchMap((request) => {
        if (!request) {
          return of<LoginState>({ status: 'idle' });
        }

        return this.loginService.login(request).pipe(
          map(
            (response) =>
              ({
                status: 'success',
                data: response,
              } as LoginState)
          ),
          catchError((error: LoginErrorResponse | unknown) =>
            of<LoginState>({
              status: 'error',
              errors: this.extractErrors(error),
            })
          ),
          startWith<LoginState>({ status: 'loading' })
        );
      })
    ),
    { initialValue: { status: 'idle' } as LoginState }
  );

  readonly isSubmitting = computed(
    () => this.loginStateSignal().status === 'loading'
  );

  constructor() {
    effect(
      () => {
        const state = this.loginStateSignal();

        if (state.status === 'success') {
          this.persistSession(state.data);
          this.errorMessages.set(null);
          this.router.navigate(['/']);
        } else if (state.status === 'error') {
          this.errorMessages.set(state.errors);
          this.clearSession();
        } else if (state.status === 'loading') {
          this.errorMessages.set(null);
        }
      },
      { allowSignalWrites: true }
    );
  }

  get identifierInvalid(): boolean {
    return (
      this.identifierControl.invalid &&
      (this.identifierControl.dirty || this.identifierControl.touched)
    );
  }

  get passwordInvalid(): boolean {
    return (
      this.passwordControl.invalid &&
      (this.passwordControl.dirty || this.passwordControl.touched)
    );
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { identifier, password } = this.loginForm.getRawValue();

    this.submissionTrigger.set({ identifier, password });
  }

  private extractErrors(error: LoginErrorResponse | unknown): string[] {
    if (error && typeof error === 'object' && 'errors' in error) {
      const maybeErrors = (error as LoginErrorResponse).errors;
      if (Array.isArray(maybeErrors) && maybeErrors.length > 0) {
        return maybeErrors;
      }
    }

    if (error instanceof Error && error.message) {
      return [error.message];
    }

    return ['Identifiants incorrects.'];
  }

  private persistSession({ token, username }: LoginSuccessResponse): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ username }));
  }

  private clearSession(): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }
}
