import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

/** Solo interfaz: aún no se conecta con ningún mecanismo de autenticación. */
@Component({
  selector: 'app-ingresar',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="book login">
      <h1>Ingresar</h1>
      <form [formGroup]="form" (ngSubmit)="submit()" class="form" novalidate>
        <label>Correo
          <input type="email" formControlName="email" autocomplete="email">
          @if (form.controls.email.touched && form.controls.email.invalid) { <small class="err">Escribe un correo válido.</small> }
        </label>
        <label>Contraseña
          <input type="password" formControlName="password" autocomplete="current-password">
          @if (form.controls.password.touched && form.controls.password.invalid) { <small class="err">Escribe tu contraseña.</small> }
        </label>
        <button type="submit" class="btn btn--ink">Ingresar</button>
        @if (sent()) { <p class="muted" role="status">Demostración visual: el acceso aún no está conectado.</p> }
        <p class="muted">¿Solo quieres una cita? <a routerLink="/reservar" class="link">Reservar sin cuenta</a></p>
      </form>
    </section>`
})
export class Ingresar {
  private fb = inject(FormBuilder);
  sent = signal(false);
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  submit() { this.form.markAllAsTouched(); if (this.form.valid) this.sent.set(true); }
}
