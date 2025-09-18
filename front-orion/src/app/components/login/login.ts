import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Header } from '../header/header';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, Header],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly loginForm;
  readonly passwordControl;
  showPassword = false;

  constructor(private readonly formBuilder: FormBuilder) {
    this.loginForm = this.formBuilder.nonNullable.group({
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.passwordControl = this.loginForm.controls.password;
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

    console.log('Login form submitted', this.loginForm.getRawValue());
  }
}
