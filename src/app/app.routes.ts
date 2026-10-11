import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'CORTE STUDIO', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'reservar', title: 'Reservar cita · CORTE STUDIO', loadComponent: () => import('./pages/reservar/reservar').then(m => m.Reservar) },
  { path: 'ingresar', title: 'Ingresar · CORTE STUDIO', loadComponent: () => import('./pages/ingresar/ingresar').then(m => m.Ingresar) },
  { path: '**', redirectTo: '' }
];
