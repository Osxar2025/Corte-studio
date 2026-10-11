import { Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DEMO_BARBERS, DEMO_SERVICES, DEMO_TIMES, formatCOP } from '../../core/demo-data';
import { Icon } from '../../shared/icon';

/** Flujo visual de reserva con datos de demostración. No envía nada a ningún backend. */
@Component({
  selector: 'app-reservar',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './reservar.html'
})
export class Reservar {
  servicio = input<string>();   // ?servicio=id
  barbero = input<string>();    // ?barbero=id

  private fb = inject(FormBuilder);
  services = DEMO_SERVICES;
  barbers = DEMO_BARBERS;
  times = DEMO_TIMES;
  fmt = formatCOP;
  labels = ['Servicio', 'Barbero', 'Horario', 'Confirmar'];

  step = signal(0);
  confirmed = signal(false);
  serviceId = signal<string | null>(null);
  barberId = signal<string | null>(null);
  dayIndex = signal<number | null>(null);
  time = signal<string | null>(null);

  service = computed(() => this.services.find(s => s.id === (this.serviceId() ?? this.servicio())));
  barber = computed(() => this.barbers.find(b => b.id === (this.barberId() ?? this.barbero())));

  days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return {
      short: new Intl.DateTimeFormat('es-CO', { weekday: 'short' }).format(d).replace('.', ''),
      num: d.getDate(),
      long: new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(d)
    };
  });

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    phone: ['', [Validators.required, Validators.minLength(7)]]
  });

  canNext = computed(() => [!!this.service(), !!this.barber(), this.dayIndex() !== null && !!this.time(), true][this.step()]);

  next() { if (this.canNext() && this.step() < 3) this.step.update(s => s + 1); }
  back() { if (this.step() > 0) this.step.update(s => s - 1); }
  confirm() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.confirmed.set(true);
  }
}
