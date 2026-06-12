import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/**
 * Tipo de notificación
 * - success: Operación exitosa (verde)
 * - error: Error u operación fallida (rojo)
 * - info: Información general (azul)
 */
export type NotifyType = 'success' | 'error' | 'info';

/**
 * Servicio de Notificaciones
 * 
 * Sistema de notificaciones basado en patrón Observable para mostrar
 * mensajes al usuario de forma no-invasiva (toasts, snackbars, etc.).
 * 
 * Los componentes pueden suscribirse al observable para mostrar
 * notificaciones en la UI.
 * 
 * Uso:
 * // En componente que muestra notificaciones (e.g. AppComponent):
 * this.notificationService.getObservable().subscribe(notif => {
 *   // Mostrar toast/snackbar con notif.message y notif.type
 * });
 * 
 * // En cualquier servicio/componente:
 * this.notificationService.notify('Producto guardado', 'success');
 * 
 * @Injectable - Servicio singleton provisto en root
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  /** Subject privado para emitir notificaciones */
  private subject = new Subject<{ type: NotifyType; message: string; data?: any }>();

  /**
   * Obtiene el Observable para suscribirse a notificaciones
   * 
   * Los componentes UI deben suscribirse a este observable
   * para recibir y mostrar las notificaciones.
   * 
   * @returns Observable que emite objetos de notificación
   */
  getObservable(): Observable<{ type: NotifyType; message: string; data?: any }> {
    return this.subject.asObservable();
  }

  /**
   * Emite una nueva notificación
   * 
   * Todos los suscriptores recibirán esta notificación y podrán
   * mostrarla en la UI según su tipo.
   * 
   * @param message - Mensaje a mostrar al usuario
   * @param type - Tipo de notificación (success, error, info)
   * @param data - Datos adicionales opcionales relacionados con la notificación
   * 
   * @example
   * notify('Producto agregado al carrito', 'success', producto);
   * notify('Error al guardar', 'error');
   * notify('Cargando datos...', 'info');
   */
  notify(message: string, type: NotifyType = 'success', data?: any) {
    this.subject.next({ type, message, data });
  }
}
