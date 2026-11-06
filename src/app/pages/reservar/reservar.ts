import { Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DEMO_BARBERS, DEMO_SERVICES, DEMO_TIMES, formatCOP } from '../../core/demo-data';
import { BarberiaApi } from '../../core/barberia-api';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-reservar',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './reservar.html'
})
export class Reservar {
  servicio = input<string>();   // ?servicio=id
  barbero = input<string>();    // ?barbero=id

  private fb = inject(FormBuilder);
  private api = inject(BarberiaApi);
  services = DEMO_SERVICES;
  barbers = DEMO_BARBERS;
  times = DEMO_TIMES;
  fmt = formatCOP;
  labels = ['Servicio', 'Barbero', 'Horario', 'Confirmar'];

  step = signal(0);
  confirmed = signal(false);
  submitting = signal(false);
  loadingAppointments = signal(false);
  appointmentsError = signal('');
  bookingError = signal('');
  calendarWarning = signal('');
  occupiedTimes = signal<string[]>([]);
  serviceId = signal<string | null>(null);
  barberId = signal<string | null>(null);
  dayIndex = signal<number | null>(null);
  time = signal<string | null>(null);

  service = computed(() => this.services.find(s => s.id === (this.serviceId() ?? this.servicio())));
  barber = computed(() => this.barbers.find(b => b.id === (this.barberId() ?? this.barbero())));

  days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return {
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      short: new Intl.DateTimeFormat('es-CO', { weekday: 'short' }).format(d).replace('.', ''),
      num: d.getDate(),
      long: new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(d)
    };
  });

  form = this.fb.nonNullable.group({
    name: ['', Validators.required]
  });

  canNext = computed(() => [
    !!this.service(),
    !!this.barber(),
    this.dayIndex() !== null && !!this.time() && !this.loadingAppointments() &&
      !this.appointmentsError() && this.isTimeAvailable(this.time()!),
    true
  ][this.step()]);

  loadAvailability() {
    const day = this.dayIndex() === null ? null : this.days[this.dayIndex()!];
    const barber = this.barber();
    if (!day || !barber) return;
    this.loadingAppointments.set(true);
    this.appointmentsError.set('');
    this.api.getAvailability(day.date, barber.name).subscribe({
      next: availability => {
        if (this.dayIndex() !== null && this.days[this.dayIndex()!].date === day.date && this.barber()?.name === barber.name) {
          this.occupiedTimes.set(availability.horariosOcupados);
          this.loadingAppointments.set(false);
        }
      },
      error: (error: HttpErrorResponse) => {
        if (this.dayIndex() !== null && this.days[this.dayIndex()!].date === day.date && this.barber()?.name === barber.name) {
          this.appointmentsError.set(error.status === 0
            ? 'No se pudo conectar con la API. Comprueba que esté disponible e inténtalo de nuevo.'
            : error.status >= 500
              ? 'La API está activa, pero no pudo consultar los horarios. Revisa el estado de la base de datos del servidor.'
              : 'No se pudieron cargar los horarios. Inténtalo de nuevo.');
          this.loadingAppointments.set(false);
        }
      }
    });
  }

  selectBarber(id: string) {
    this.barberId.set(id);
    this.time.set(null);
    this.occupiedTimes.set([]);
    this.loadAvailability();
  }

  selectDay(index: number) {
    this.dayIndex.set(index);
    this.time.set(null);
    this.occupiedTimes.set([]);
    this.loadAvailability();
  }

  isTimeAvailable(time: string): boolean {
    const day = this.dayIndex() === null ? null : this.days[this.dayIndex()!];
    const barber = this.barber();
    return !!day && !!barber && !this.isTimeOccupied(time);
  }

  isTimeOccupied(time: string): boolean {
    const day = this.dayIndex() === null ? null : this.days[this.dayIndex()!];
    const barber = this.barber();
    if (!day || !barber) return false;
    return this.occupiedTimes().includes(time);
  }

  next() { if (this.canNext() && this.step() < 3) this.step.update(s => s + 1); }
  back() { if (this.step() > 0) this.step.update(s => s - 1); }
  confirm() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const day = this.dayIndex() === null ? null : this.days[this.dayIndex()!];
    const service = this.service();
    const barber = this.barber();
    const time = this.time();
    if (!day || !service || !barber || !time) return;

    this.bookingError.set('');
    this.submitting.set(true);
    this.api.bookAppointment({
      clienteNombre: this.form.controls.name.value.trim(),
      barbero: barber.name,
      servicio: service.name,
      fecha: day.date,
      hora: time
    }).subscribe({
      next: response => {
        this.confirmed.set(true);
        if (!response.notificacionCalendar?.enviada) {
          this.calendarWarning.set(response.notificacionCalendar?.mensaje
            ?? 'El servidor no confirmó el envío de la invitación de Google Calendar.');
        }
        this.submitting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.bookingError.set(error.error?.error ?? 'No se pudo agendar la cita. Inténtalo de nuevo.');
        this.submitting.set(false);
        this.loadAvailability();
      }
    });
  }
}
