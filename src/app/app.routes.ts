import { Routes } from '@angular/router';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  { path: '', title: 'CORTE STUDIO', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'reservar', title: 'Reservar cita · CORTE STUDIO', loadComponent: () => import('./pages/reservar/reservar').then(m => m.Reservar) },
  { path: 'ingresar', title: 'Ingresar · CORTE STUDIO', loadComponent: () => import('./pages/ingresar/ingresar').then(m => m.Ingresar) },
  { path: 'admin', title: 'Administración · CORTE STUDIO', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/admin').then(m => m.Admin) },
  { path: '**', redirectTo: '' }
];
