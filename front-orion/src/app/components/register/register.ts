import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Header } from '../header/header';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, Header],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  readonly registerForm;
  showPassword = false;

  constructor(private readonly formBuilder: FormBuilder) {
    this.registerForm = this.formBuilder.nonNullable.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get emailInvalid(): boolean {
    return (
      this.registerForm.controls.email.invalid &&
      (this.registerForm.controls.email.dirty ||
        this.registerForm.controls.email.touched)
    );
  }

  get passwordInvalid(): boolean {
    return (
      this.registerForm.controls.password.invalid &&
      (this.registerForm.controls.password.dirty ||
        this.registerForm.controls.password.touched)
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

    console.log('Register form submitted', this.registerForm.getRawValue());
  }
}
