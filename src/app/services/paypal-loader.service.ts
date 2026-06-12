import { Injectable } from '@angular/core';
import { Global } from './global';

/**
 * Servicio de Carga del SDK de PayPal
 * 
 * Gestiona la carga dinámica del SDK JavaScript de PayPal en el navegador.
 * Esto permite cargar PayPal solo cuando se necesita (lazy loading).
 * 
 * Características:
 * - Carga el SDK una sola vez (singleton)
 * - Configuración desde backend (client-id)
 * - Fallback a sandbox si falla la configuración
 * - Deshabilita pagos con tarjeta (solo cuenta PayPal)
 * - Sistema de promesas para evitar cargas múltiples
 * 
 * Configuración del SDK:
 * - disable-funding=card,credit - Solo permite login con cuenta PayPal
 * - intent=capture - Captura inmediata del pago
 * - components=buttons - Solo cargar el componente de botones
 * 
 * @Injectable - Servicio singleton provisto en root
 */
@Injectable({ providedIn: 'root' })
export class PaypalLoaderService {
  private sdkLoaded = false; // Flag para saber si ya se cargó
  private loadingPromise: Promise<void> | null = null; // Promesa compartida

  /**
   * Carga el SDK de PayPal de forma asíncrona
   * 
   * 1. Verifica si ya está cargado
   * 2. Obtiene client-id del backend
   * 3. Crea script tag con configuración
   * 4. Inyecta el script en el DOM
   * 5. Espera a que cargue completamente
   * 
   * Si falla, usa credenciales sandbox como fallback.
   * 
   * @returns Promise que resuelve cuando el SDK está listo
   */
  async loadSdk(): Promise<void> {
    // Si ya está cargado, retornar inmediatamente
    if (this.sdkLoaded) return;
    
    // Si ya está cargando, retornar la promesa existente (evita cargas duplicadas)
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = new Promise<void>(async (resolve, reject) => {
      try {
        // Obtener configuración del backend (client-id)
        const resp = await fetch(Global.url + 'api/paypal/config');
        const contentType = resp.headers.get('content-type') || '';
        
        // Validar respuesta del backend
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error('PayPal config request failed: ' + resp.status + ' ' + txt);
        }
        if (!contentType.includes('application/json')) {
          const txt = await resp.text();
          throw new Error('PayPal config returned non-JSON: ' + txt);
        }
        
        // Parsear configuración
        const cfg = await resp.json();
        const clientId = cfg?.clientId || 'sb'; // Usar 'sb' si no hay clientId
        const currency = 'USD';
        
        // Verificar si PayPal ya existe en el objeto window
        if ((window as any).paypal) {
          this.sdkLoaded = true;
          resolve();
          return;
        }
        
        // Crear script tag para cargar SDK
        const script = document.createElement('script');
        
        // URL del SDK con parámetros:
        // - client-id: Identificador de la aplicación PayPal
        // - currency: Moneda (USD)
        // - intent: capture (captura inmediata)
        // - disable-funding: Deshabilitar tarjetas, solo cuenta PayPal
        // - components: Solo cargar botones (más rápido)
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture&disable-funding=card,credit&components=buttons`;
        script.async = true;
        
        // Handlers de carga
        script.onload = () => { 
          this.sdkLoaded = true; 
          resolve(); 
        };
        script.onerror = (e) => { 
          reject(new Error('Failed to load PayPal SDK')); 
        };
        
        // Inyectar script en el DOM
        document.body.appendChild(script);
        
      } catch (err) {
        // Fallback: si falla la configuración, usar credenciales sandbox
        try {
          const script = document.createElement('script');
          script.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=USD&intent=capture&disable-funding=card,credit&components=buttons';
          script.async = true;
          script.onload = () => { 
            this.sdkLoaded = true; 
            resolve(); 
          };
          script.onerror = (e) => { 
            reject(new Error('Failed to load PayPal SDK fallback')); 
          };
          document.body.appendChild(script);
        } catch (e) {
          reject(err); // Si incluso el fallback falla, rechazar
        }
      }
    });

    return this.loadingPromise;
  }
}
