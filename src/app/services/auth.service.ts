import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Global } from './global';
import { Router } from '@angular/router';

/**
 * Interface que define la estructura de un usuario en el sistema
 */
export interface User {
  id: string;           // ID único del usuario en MongoDB
  nombre: string;       // Nombre completo del usuario
  email: string;        // Email único del usuario
  rol: 'user' | 'admin'; // Rol del usuario (cliente o admin)
}

/**
 * Servicio de Autenticación
 * 
 * Gestiona toda la autenticación y autorización de usuarios en la aplicación.
 * Maneja login, registro, logout y verificación de roles.
 * 
 * @Injectable - Servicio singleton proporcionado en root
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url: string; // URL base del backend
  private currentUserSubject: BehaviorSubject<User | null>; // Subject reactivo del usuario actual
  public currentUser: Observable<User | null>; // Observable público del usuario actual

  /**
   * Constructor del servicio
   * @param http - HttpClient para peticiones HTTP
   * @param router - Router para navegación
   */
  constructor(private http: HttpClient, private router: Router) {
    this.url = Global.url;
    const storedUser = this.getUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  /**
   * Obtiene el valor actual del usuario (sin suscribirse)
   * @returns Usuario actual o null si no está autenticado
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Recupera el usuario almacenado en localStorage
   * @returns Usuario guardado o null si no existe
   * @private
   */
  private getUserFromStorage(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Inicia sesión de un usuario
   * 
   * Envía credenciales al backend y guarda el token JWT y datos del usuario
   * en localStorage. Actualiza el BehaviorSubject para notificar a los suscriptores.
   * 
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Observable con la respuesta del backend (user + token)
   */
  login(email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.url + 'auth/login', { email, password }, { headers })
      .pipe(
        tap(response => {
          console.log('[AUTH SERVICE] Response recibida del backend:', response);
          
          if (response && response.user && response.token) {
            // Guardar usuario en localStorage
            try {
              const userJson = JSON.stringify(response.user);
              localStorage.setItem('user', userJson);
              console.log('[AUTH SERVICE] ✅ Usuario guardado en localStorage');
            } catch (e) {
              console.error('[AUTH SERVICE] ❌ Error guardando usuario:', e);
            }
            
            // Guardar token JWT - ESTO ES CRÍTICO
            try {
              localStorage.setItem('token', response.token);
              
              // Verificar que se guardó
              const tokenGuardado = localStorage.getItem('token');
              if (tokenGuardado === response.token) {
                console.log('[AUTH SERVICE] ✅ Token guardado correctamente en localStorage');
                console.log('[AUTH SERVICE] Token (primeros 50 chars):', response.token.substring(0, 50) + '...');
              } else {
                console.error('[AUTH SERVICE] ❌ Token NO se guardó correctamente');
                console.error('[AUTH SERVICE] Esperado:', response.token.substring(0, 50));
                console.error('[AUTH SERVICE] Guardado:', tokenGuardado?.substring(0, 50));
              }
            } catch (e) {
              console.error('[AUTH SERVICE] ❌ Error guardando token:', e);
            }
            
            console.log('[AUTH SERVICE] Usuario:', response.user.email, 'Rol:', response.user.rol);
            
            // Actualizar el BehaviorSubject para notificar cambios
            this.currentUserSubject.next(response.user);
          } else {
            console.error('[AUTH SERVICE] ❌ Respuesta inválida:', response);
          }
        })
      );
  }

  /**
   * Registra un nuevo usuario en el sistema
   * 
   * Crea un usuario con rol 'user' por defecto.
   * No inicia sesión automáticamente.
   * 
   * @param nombre - Nombre completo del usuario
   * @param email - Email único del usuario
   * @param password - Contraseña (será encriptada en el backend)
   * @returns Observable con la respuesta del backend
   */
  register(nombre: string, email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.url + 'auth/register', { nombre, email, password }, { headers });
  }

  /**
   * Cierra la sesión del usuario actual
   * 
   * Elimina token y usuario de localStorage, actualiza el BehaviorSubject
   * y redirige al login.
   */
  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Verifica si hay un usuario autenticado
   * @returns true si hay usuario logueado, false si no
   */
  isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }

  /**
   * Verifica si el usuario actual es administrador
   * @returns true si es admin, false si no
   */
  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user !== null && user.rol === 'admin';
  }

  /**
   * Verifica si el usuario actual es cliente
   * @returns true si es user (cliente), false si no
   */
  isUser(): boolean {
    const user = this.currentUserValue;
    return user !== null && user.rol === 'user';
  }

  /**
   * Obtiene el token JWT almacenado
   * @returns Token JWT o null si no existe
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
