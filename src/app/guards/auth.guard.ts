import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de Autenticación
 * 
 * Protege las rutas que requieren que el usuario esté autenticado.
 * Si el usuario no está logueado, redirige al login guardando la URL destino
 * en queryParams para redirigir después del login exitoso.
 * 
 * Uso en routes:
 * { path: 'productos', component: ProductosComponent, canActivate: [authGuard] }
 * 
 * @param route - Ruta activada que contiene información de la ruta
 * @param state - Estado del router con la URL actual
 * @returns true si está autenticado, false si no (y redirige)
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (authService.isLoggedIn()) {
    return true; // Permitir acceso
  }

  // No está autenticado, redirigir al login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false; // Bloquear acceso
};
