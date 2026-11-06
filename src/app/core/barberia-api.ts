import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export const API_BASE_URL = 'https://corte-studio-xua5.onrender.com/api';

export interface ApiMessage {
  mensaje: string;
}

export interface LoginResponse {
  token: string;
  usuario: { nombre: string; email: string };
}

@Injectable({ providedIn: 'root' })
export class BarberiaApi {
  private http = inject(HttpClient);

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
