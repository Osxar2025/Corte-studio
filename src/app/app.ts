import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './layout/navbar';
import { Footer } from './layout/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  template: `
    <a class="skip" href="#contenido">Saltar al contenido</a>
    <app-navbar />
    <main id="contenido"><router-outlet /></main>
    <app-footer />
  `
})
export class App {}
