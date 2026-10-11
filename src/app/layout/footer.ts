import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BRAND } from '../core/brand';
import { Logo } from '../shared/logo';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Logo],
  template: `
    <footer class="footer">
      <app-logo />
      <nav aria-label="Pie de página">
        <a routerLink="/" fragment="servicios">Servicios</a>
        <a routerLink="/" fragment="barberos">Barberos</a>
        <a routerLink="/reservar">Reservar cita</a>
        <a routerLink="/ingresar">Ingresar</a>
      </nav>
      <p>© {{ b.year }} {{ b.name }}. {{ b.city }}. Contenido de demostración.</p>
    </footer>`
})
export class Footer { b = BRAND; }
