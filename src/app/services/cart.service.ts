import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Global } from './global';
import { NotificationService } from './notification.service';

/**
 * Servicio de Carrito de Compras
 * 
 * Gestiona el carrito de compras del usuario usando localStorage para persistencia
 * local y sincronización con el backend para validación de productos.
 * 
 * Características:
 * - Almacenamiento local en localStorage (persiste entre sesiones)
 * - Sincronización con backend para validar productos
 * - BehaviorSubject para actualizaciones reactivas en UI
 * - Maneja productos (alimentos) y accesorios
 * - Notificaciones al usuario cuando se agregan items
 * 
 * @Injectable - Servicio singleton provisto en root
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  public url: string; // URL base del backend
  private storageKey = 'cart'; // Clave para localStorage
  public cart$ = new BehaviorSubject<any>({ items: [] }); // Observable del carrito

  /**
   * Constructor del servicio
   * @param _http - HttpClient para peticiones al backend
   * @param _notify - Servicio de notificaciones
   */
  constructor(private _http: HttpClient, private _notify: NotificationService) {
    this.url = Global.url;
    // Inicializar BehaviorSubject con datos de localStorage
    try { this.cart$.next(this.getLocal()); } catch (e) { /* ignorar error */ }
  }

  /**
   * Obtiene el carrito almacenado en localStorage
   * @private
   * @returns Objeto del carrito con array de items
   */
  private getLocal(): any {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : { items: [] };
    } catch (e) {
      return { items: [] }; // Si hay error, retornar carrito vacío
    }
  }

  /**
   * Guarda el carrito en localStorage y actualiza el BehaviorSubject
   * @private
   * @param cart - Objeto del carrito a guardar
   */
  private saveLocal(cart: any) {
    try { 
      localStorage.setItem(this.storageKey, JSON.stringify(cart)); 
      this.cart$.next(cart); // Notificar a suscriptores del cambio
    } catch (e) { /* ignorar error */ }
  }

  /**
   * Añade un producto o accesorio al carrito
   * 
   * 1. Envía petición al backend para validar el producto
   * 2. Si es válido, agrega o incrementa cantidad en localStorage
   * 3. Notifica al usuario mediante NotificationService
   * 
   * @param itemId - ID del producto/accesorio en MongoDB
   * @param kind - Tipo: 'producto' (alimento) o 'accesorio'
   * @param qty - Cantidad a agregar (default: 1)
   * @returns Observable con la respuesta del backend
   */
  addToCart(itemId: string, kind: 'producto' | 'accesorio', qty: number = 1): Observable<any> {
    const body = { itemId, kind, qty };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this._http.post(this.url + 'cart/add', JSON.stringify(body), { headers }).pipe(
      tap((res: any) => {
        // Backend devuelve la info del item validado en res.item
        if (res && res.item) {
          const cart = this.getLocal();
          // Buscar si ya existe en el carrito
          const existing = cart.items.find((i: any) => i.itemId === res.item.itemId && i.kind === res.item.kind);
          if (existing) {
            // Si existe, incrementar cantidad
            existing.qty = (existing.qty || 0) + (res.item.qty || 1);
          } else {
            // Si no existe, agregarlo
            cart.items.push(res.item);
          }
          this.saveLocal(cart); // Guardar cambios
          
          // Notificar al usuario
          try { 
            this._notify.notify('Añadido al carrito: ' + (res.item.nombre || ''), 'success', res.item); 
          } catch (e) { /* ignorar error */ }
        }
      })
    );
  }

  /**
   * Obtiene el carrito actual desde localStorage
   * 
   * Nota: El backend NO persiste el carrito, solo se usa localStorage
   * 
   * @returns Observable con el carrito
   */
  getCart(): Observable<any> {
    const cart = this.getLocal();
    return of({ cart }); // Retornar como Observable
  }

  /**
   * Actualiza la cantidad de un item en el carrito
   * 
   * Si la cantidad es 0 o menor, elimina el item.
   * Sincroniza con el backend pero la verdad persiste en localStorage.
   * 
   * @param itemId - ID del item
   * @param kind - Tipo: 'producto' o 'accesorio'
   * @param qty - Nueva cantidad
   * @returns Observable con respuesta del backend
   */
  updateItem(itemId: string, kind: string, qty: number): Observable<any> {
    const cart = this.getLocal();
    const existing = cart.items.find((i: any) => i.itemId === itemId && i.kind === kind);
    
    if (existing) {
      if (qty <= 0) {
        // Si qty es 0 o negativo, eliminar el item
        cart.items = cart.items.filter((i: any) => !(i.itemId === itemId && i.kind === kind));
      } else {
        // Actualizar cantidad
        existing.qty = qty;
      }
      this.saveLocal(cart);
    }

    // Sincronizar con backend
    const body = { itemId, kind, qty };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.put(this.url + 'cart/update', JSON.stringify(body), { headers });
  }

  /**
   * Elimina un item del carrito
   * 
   * Remueve de localStorage y sincroniza con backend.
   * 
   * @param itemId - ID del item a eliminar
   * @param kind - Tipo: 'producto' o 'accesorio'
   * @returns Observable con respuesta del backend
   */
  removeItem(itemId: string, kind: string): Observable<any> {
    const cart = this.getLocal();
    // Filtrar para remover el item
    cart.items = cart.items.filter((i: any) => !(i.itemId === itemId && i.kind === kind));
    this.saveLocal(cart);

    // Sincronizar con backend
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.delete(this.url + `cart/remove/${itemId}/${kind}`, { headers });
  }
}
