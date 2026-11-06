import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const LOCAL_API_BASE_URL = 'http://localhost:3000/api';
const DEPLOYED_API_BASE_URL = 'https://corte-studio-xua5.onrender.com/api';
const isLocalApp = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
export const API_BASE_URL = isLocalApp ? LOCAL_API_BASE_URL : DEPLOYED_API_BASE_URL;

export interface ApiMessage {
  mensaje: string;
  notificacionCalendar?: { enviada: boolean; mensaje: string };
}

export interface LoginResponse {
  token: string;
  usuario: { nombre: string; email: string; esAdministrador: boolean };
}

export interface AdminAppointment {
  _id: string;
  clienteNombre: string;
  barbero: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado?: 'reservada' | 'realizada';
}

@Injectable({ providedIn: 'root' })
export class BarberiaApi {
  private http = inject(HttpClient);

  getAdminAppointments(): Observable<AdminAppointment[]> {
    return this.http.get<AdminAppointment[]>(`${API_BASE_URL}/citas`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('barberia_token') ?? ''}` }
    });
  }

  updateAppointmentStatus(id: string, estado: 'reservada' | 'realizada'): Observable<AdminAppointment> {
    return this.http.patch<AdminAppointment>(`${API_BASE_URL}/citas/${encodeURIComponent(id)}/estado`, { estado }, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('barberia_token') ?? ''}` }
    });
  }

  getAvailability(date: string, barber: string): Observable<{ horariosOcupados: string[] }> {
    return this.http.get<{ horariosOcupados: string[] }>(`${API_BASE_URL}/citas/disponibilidad`, {
      params: { fecha: date, barbero: barber }
    });
  }

  bookAppointment(appointment: {
    clienteNombre: string;
    barbero: string;
    servicio: string;
    fecha: string;
    hora: string;
  }): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(`${API_BASE_URL}/citas/agendar`, appointment);
  }

  register(name: string, email: string, password: string): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(`${API_BASE_URL}/auth/register`, { nombre: name, email, password });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, { email, password });
  }
}
