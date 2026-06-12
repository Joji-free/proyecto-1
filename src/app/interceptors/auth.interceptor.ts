import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor de Autenticación HTTP
 * 
 * Intercepta todas las peticiones HTTP salientes y automáticamente agrega
 * el token JWT en el header 'Authorization' si existe en localStorage.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtener el token JWT de localStorage
  const token = localStorage.getItem('token');

  // Log inicial
  const isProtectedRoute = req.url.includes('guardar-productos') || 
                          req.url.includes('/producto/') || 
                          req.url.includes('guardar-accesorios') || 
                          req.url.includes('/accesorio/') ||
                          req.url.includes('subir-imagen');

  if (!token && isProtectedRoute) {
    console.error(`[AUTH INTERCEPTOR] ❌ CRÍTICO: No hay token para ruta protegida`);
    console.error(`[AUTH INTERCEPTOR] URL: ${req.method} ${req.url}`);
    console.error(`[AUTH INTERCEPTOR] localStorage.token = ${localStorage.getItem('token')}`);
  }

  if (token) {
    console.log(`[AUTH INTERCEPTOR] ✅ Token encontrado`);
    console.log(`[AUTH INTERCEPTOR] Añadiendo a: ${req.method} ${req.url}`);
    console.log(`[AUTH INTERCEPTOR] Token (50 chars): ${token.substring(0, 50)}...`);
    
    // Clonar la petición y agregar el header de autorización
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log(`[AUTH INTERCEPTOR] ✅ Header Authorization: Bearer ${token.substring(0, 50)}...`);
    
    return next(authReq);
  }

  if (isProtectedRoute) {
    console.warn(`[AUTH INTERCEPTOR] ⚠️ Sin token para ${req.method} ${req.url}`);
  }

  return next(req);
};
