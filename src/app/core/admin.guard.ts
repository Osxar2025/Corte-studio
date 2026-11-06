import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = () => {
  if (sessionStorage.getItem('barberia_token')) return true;
  return inject(Router).parseUrl('/ingresar');
};
