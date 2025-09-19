import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Header } from './../../shared/header/header';
import {
  RegisterErrorResponse,
  RegisterRequest,
} from './interfaces/register.interface';
import { RegisterService } from './register.service';
import { RegistrationState } from './interfaces/register-state.type';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, Header],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly registerService = inject(RegisterService);
  private readonly router = inject(Router);

  readonly registerForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly emailControl = this.registerForm.controls.email;
  readonly passwordControl = this.registerForm.controls.password;
  private readonly submissionTrigger = signal<RegisterRequest | null>(null);
  readonly errorMessages = signal<string[] | null>(null);
  showPassword = false;

  private readonly registrationStateSignal = toSignal(
    toObservable(this.submissionTrigger).pipe(
      switchMap((request) => {
        if (!request) {
          return of<RegistrationState>({ status: 'idle' });
        }

        return this.registerService.register(request).pipe(
          map(() => ({ status: 'success' } as RegistrationState)),
          catchError((error: RegisterErrorResponse | unknown) =>
            of<RegistrationState>({
              status: 'error',
              errors: this.extractErrors(error),
            })
          ),
          startWith<RegistrationState>({ status: 'loading' })
        );
      })
    ),
    { initialValue: { status: 'idle' } as RegistrationState }
  );

  readonly isSubmitting = computed(
    () => this.registrationStateSignal().status === 'loading'
  );

  constructor() {
    effect(
      () => {
        const state = this.registrationStateSignal();

        if (state.status === 'success') {
          this.errorMessages.set(null);
          this.router.navigate(['/login']);
        } else if (state.status === 'error') {
          this.errorMessages.set(state.errors);
        } else if (state.status === 'loading') {
          this.errorMessages.set(null);
        }
      },
      { allowSignalWrites: true }
    );
  }

  get nameInvalid(): boolean {
    const nameControl = this.registerForm.controls.name;
    return nameControl.invalid && (nameControl.dirty || nameControl.touched);
  }

  get passwordInvalid(): boolean {
    return (
      this.passwordControl.invalid &&
      (this.passwordControl.dirty || this.passwordControl.touched)
    );
  }

  get emailInvalid(): boolean {
    return (
      this.emailControl.invalid &&
      (this.emailControl.dirty || this.emailControl.touched)
    );
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.registerForm.getRawValue();

    this.submissionTrigger.set({
      username: name,
      email,
      password,
    });
  }

  private extractErrors(error: RegisterErrorResponse | unknown): string[] {
    if (error && typeof error === 'object' && 'errors' in error) {
      const maybeErrors = (error as RegisterErrorResponse).errors;
      if (Array.isArray(maybeErrors) && maybeErrors.length > 0) {
        return maybeErrors;
      }
    }

    return ['Vos données sont invalides. Veuillez vérifier et réessayer.'];
  }
}
