import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de Administrador
 * 
 * Protege las rutas del panel administrativo que solo pueden ser accedidas
 * por usuarios con rol 'admin'. Verifica primero la autenticación y luego el rol.
 * Si el usuario no es admin (o no está logueado), redirige al home.
 * 
 * Uso en routes:
 * { path: 'admin', component: AdminComponent, canActivate: [adminGuard] }
 * 
 * @param route - Ruta activada que contiene información de la ruta
 * @param state - Estado del router con la URL actual
 * @returns true si es admin, false si no (y redirige)
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Primero verificar autenticación
  if (!authService.isLoggedIn()) {
    // No está autenticado
    router.navigate(['/login']);
    return false;
  }

  // Verificar si el usuario tiene rol de administrador
  if (authService.isAdmin()) {
    // Es admin, puede acceder
    return true;
  }

  // No es admin, redirigir a home
  alert('No tienes permisos para acceder a esta página');
  router.navigate(['/home']);
  return false;
};
