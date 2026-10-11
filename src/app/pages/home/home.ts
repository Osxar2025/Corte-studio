import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEMO_BARBERS, DEMO_SERVICES, formatCOP } from '../../core/demo-data';
import { Icon } from '../../shared/icon';
import { Photo } from '../../shared/photo';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon, Photo],
  templateUrl: './home.html'
})
export class Home {
  services = DEMO_SERVICES;
  barbers = DEMO_BARBERS;
  fmt = formatCOP;
  active = signal(DEMO_SERVICES[0].id);
  steps = [
    { n: '1', t: 'Elige tu servicio', d: 'Corte, barba o ambos. Ves duración y precio antes de decidir.' },
    { n: '2', t: 'Encuentra tu barbero', d: 'Conoce su especialidad y reserva con quien mejor encaje con tu estilo.' },
    { n: '3', t: 'Selecciona el horario', d: 'Escoge día y hora entre los espacios libres de la semana.' },
    { n: '4', t: 'Confirma tu cita', d: 'Revisa el resumen, confirma y llega a tu hora. Sin llamadas.' }
  ];
}
