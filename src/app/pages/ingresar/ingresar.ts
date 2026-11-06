import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BarberiaApi } from '../../core/barberia-api';

@Component({
  selector: 'app-ingresar',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="book login">
      <h1>{{ registering() ? 'Crear cuenta' : 'Ingresar' }}</h1>
      <form [formGroup]="form" (ngSubmit)="submit()" class="form" novalidate>
        @if (registering()) {
          <label>Nombre
            <input type="text" formControlName="name" autocomplete="name">
            @if (form.controls.name.touched && form.controls.name.invalid) { <small class="err">Escribe tu nombre.</small> }
          </label>
        }
        <label>Correo
          <input type="email" formControlName="email" autocomplete="email">
          @if (form.controls.email.touched && form.controls.email.invalid) { <small class="err">Escribe un correo válido.</small> }
        </label>
        <label>Contraseña
          <input type="password" formControlName="password" [attr.autocomplete]="registering() ? 'new-password' : 'current-password'">
          @if (form.controls.password.touched && form.controls.password.invalid) { <small class="err">Escribe tu contraseña.</small> }
        </label>
        @if (error()) { <p class="err" role="alert">{{ error() }}</p> }
        @if (message()) { <p class="muted" role="status">{{ message() }}</p> }
        <button type="submit" class="btn btn--ink" [disabled]="loading()">
          {{ loading() ? 'Procesando…' : registering() ? 'Crear cuenta' : 'Ingresar' }}
        </button>
        <button type="button" class="link auth-switch" [disabled]="loading()" (click)="toggleMode()">
          {{ registering() ? 'Ya tengo una cuenta' : 'Crear una cuenta' }}
        </button>
        <p class="muted">¿Solo quieres una cita? <a routerLink="/reservar" class="link">Reservar sin cuenta</a></p>
      </form>
    </section>`
})
export class Ingresar {
  private fb = inject(FormBuilder);
  private api = inject(BarberiaApi);
  registering = signal(false);
  loading = signal(false);
  error = signal('');
  message = signal('');
  form = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  toggleMode() {
    this.registering.update(value => !value);
    this.error.set('');
    this.message.set('');
    const name = this.form.controls.name;
    name.setValidators(this.registering() ? Validators.required : null);
    name.updateValueAndValidity();
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    this.error.set('');
    this.message.set('');
    this.loading.set(true);
    const email = this.form.controls.email.value.trim().toLowerCase();
    const password = this.form.controls.password.value;
    if (this.registering()) {
      this.api.register(this.form.controls.name.value.trim(), email, password).subscribe({
        next: response => {
          this.message.set(response.mensaje);
          this.registering.set(false);
          this.form.controls.name.clearValidators();
          this.form.controls.name.updateValueAndValidity();
          this.loading.set(false);
        },
        error: error => this.handleError(error)
      });
      return;
    }

    this.api.login(email, password).subscribe({
      next: response => {
        sessionStorage.setItem('barberia_token', response.token);
        this.message.set(`Bienvenido, ${response.usuario.nombre}. Sesión iniciada.`);
        this.loading.set(false);
      },
      error: error => this.handleError(error)
    });
  }

  private handleError(error: HttpErrorResponse) {
    this.error.set(error.error?.error ?? 'No se pudo conectar con la API. Comprueba que esté encendida e inténtalo de nuevo.');
    this.loading.set(false);
  }
}
