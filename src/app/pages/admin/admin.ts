import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AdminAppointment, BarberiaApi } from '../../core/barberia-api';
import { DEMO_BARBERS } from '../../core/demo-data';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html'
})
export class Admin implements OnInit {
  private api = inject(BarberiaApi);
  private router = inject(Router);

  appointments = signal<AdminAppointment[]>([]);
  loading = signal(false);
  error = signal('');
  updatingId = signal<string | null>(null);
  completedCount = computed(() => this.appointments().filter(cita => cita.estado === 'realizada').length);
  barberCounts = computed(() => DEMO_BARBERS.map(barber => ({
    name: barber.name,
    count: this.appointments().filter(cita => cita.barbero === barber.name && cita.estado === 'realizada').length
  })));

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading.set(true);
    this.error.set('');
    this.api.getAdminAppointments().subscribe({
      next: appointments => {
        this.appointments.set(appointments);
        this.loading.set(false);
      },
      error: error => this.handleError(error)
    });
  }

  setAppointmentStatus(appointment: AdminAppointment) {
    const estado = appointment.estado === 'realizada' ? 'reservada' : 'realizada';
    this.updatingId.set(appointment._id);
    this.error.set('');
    this.api.updateAppointmentStatus(appointment._id, estado).subscribe({
      next: updated => {
        this.appointments.update(appointments =>
          appointments.map(item => item._id === updated._id ? updated : item)
        );
        this.updatingId.set(null);
      },
      error: error => {
        this.handleError(error);
        this.updatingId.set(null);
      }
    });
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(`${date}T00:00:00`));
  }

  logout() {
    sessionStorage.removeItem('barberia_token');
    this.router.navigateByUrl('/ingresar');
  }

  private handleError(error: HttpErrorResponse) {
    this.error.set(error.error?.error ?? 'No se pudieron cargar o actualizar las citas. Inténtalo de nuevo.');
    this.loading.set(false);
  }
}
