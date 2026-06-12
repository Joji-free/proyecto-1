import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Global } from './global';

/**
 * Servicio de PayPal
 * 
 * Gestiona la integración con PayPal para procesar pagos.
 * Se comunica con el backend que actúa como intermediario con la API de PayPal.
 * 
 * Flujo de pago:
 * 1. createOrder() - Crea una orden en PayPal
 * 2. Usuario aprueba el pago en la ventana de PayPal
 * 3. captureOrder() - Captura (finaliza) el pago
 * 
 * Endpoints backend:
 * - POST /api/paypal/create-order - Crear orden
 * - POST /api/paypal/capture-order - Capturar pago
 * 
 * @Injectable - Servicio singleton provisto en root
 */
@Injectable({ providedIn: 'root' })
export class PaypalService {
  private url: string; // URL base del backend

  /**
   * Constructor del servicio
   * @param http - HttpClient para peticiones HTTP
   */
  constructor(private http: HttpClient) {
    this.url = Global.url; // e.g. http://localhost:3600/
  }

  /**
   * Crea una orden de pago en PayPal
   * 
   * Envía los items del carrito al backend, que calcula el total
   * y crea la orden en PayPal usando las credenciales del servidor.
   * 
   * @param items - Array de items del carrito con precio y cantidad
   * @param total - Total de la compra (se calcula también en backend)
   * @param currency - Moneda del pago (default: 'USD')
   * @returns Observable con orderID de PayPal para aprobar el pago
   */
  createOrder(items: any[], total: number, currency: string = 'USD'): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { items, currency };
    // El backend calculará el total por seguridad; enviamos items para composición
    return this.http.post<any>(this.url + 'api/paypal/create-order', body, { headers });
  }

  /**
   * Captura (finaliza) una orden de PayPal aprobada
   * 
   * Después que el usuario aprueba el pago en PayPal, se debe capturar
   * la orden para completar la transacción.
   * 
   * @param orderID - ID de la orden aprobada por el usuario en PayPal
   * @returns Observable con detalles de la captura (status, transaction ID, etc.)
   */
  captureOrder(orderID: string, items: any[] = []): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.url + 'api/paypal/capture-order', { orderID, items }, { headers });
  }
}
