import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PaypalService } from '../../services/paypal.service';
import { PaypalLoaderService } from '../../services/paypal-loader.service';
import { CartService } from '../../services/cart.service';
import { RouterModule } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { Global } from '../../services/global';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements AfterViewInit, OnDestroy {
  cart: any = { items: [] };
  total = 0;
  scriptEl: HTMLScriptElement | null = null;
  private sub: Subscription | null = null;
  private paypalSdkLoaded = false;
  private paypalScriptLoading = false;
  private buttonsRendered = false;

  constructor(
    private paypal: PaypalService, 
    private cartSvc: CartService, 
    private paypalLoader: PaypalLoaderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    // Primero cargar el SDK de PayPal
    this.loadPayPalSDK();

    // Suscribirse a cambios del carrito
    this.sub = this.cartSvc.cart$.subscribe(c => {
      this.cart = c;
      this.computeTotal();
      this.cdr.detectChanges();
      
      // Si el carrito tiene items y el SDK está cargado, renderizar botones
      if (this.cart?.items?.length > 0 && this.paypalSdkLoaded) {
        // Pequeño delay para asegurar que el DOM está listo
        setTimeout(() => this.renderButtons(), 100);
      }
    });
  }

  private loadPayPalSDK() {
    if ((window as any).paypal) {
      this.paypalSdkLoaded = true;
      if (this.cart?.items?.length > 0) {
        setTimeout(() => this.renderButtons(), 100);
      }
      return;
    }

    if (this.paypalScriptLoading) return;
    
    this.paypalScriptLoading = true;
    this.paypalLoader.loadSdk()
      .then(() => {
        this.paypalSdkLoaded = true;
        this.paypalScriptLoading = false;
        if (this.cart?.items?.length > 0) {
          setTimeout(() => this.renderButtons(), 100);
        }
      })
      .catch((e: any) => {
        console.error('Error loading PayPal SDK', e);
        this.paypalScriptLoading = false;
      });
  }

  computeTotal() {
    const items = this.cart?.items || [];
    this.total = items.reduce((s: number, it: any) => s + ((it.precio || 0) * (it.qty || 1)), 0);
    // Ensure 2 decimals
    this.total = Math.round(this.total * 100) / 100;
  }

  renderButtons() {
    if (!(window as any).paypal) {
      console.log('PayPal SDK not loaded yet');
      return;
    }

    const container = document.getElementById('paypal-button-container');
    if (!container) {
      console.log('PayPal container not found');
      return;
    }

    // Si ya hay botones renderizados, limpiar completamente
    container.innerHTML = '';
    this.buttonsRendered = false;

    // Verificar que hay items en el carrito
    if (!this.cart?.items?.length || this.total <= 0) {
      console.log('No items in cart or total is 0');
      return;
    }

    console.log('Rendering PayPal buttons for total:', this.total);

    const self = this;
    try {
      (window as any).paypal.Buttons({
        style: {
          layout: 'vertical',  // Mostrar botones en vertical
          color: 'gold',       // Color dorado para el botón principal de PayPal
          shape: 'rect',
          label: 'paypal'      // Etiqueta de PayPal
        },
        createOrder: async function(data: any, actions: any) {
          const items = (self.cart?.items || []).map((it: any) => ({
            name: it.nombre || it.name || 'Producto',
            unit_amount: Number(it.precio || it.price || 0).toFixed(2),
            quantity: Number(it.qty || it.quantity || 1),
            sku: it.itemId || it.sku || undefined,
            itemId: it.itemId || it.sku || undefined,
            kind: it.kind || 'producto'
          }));
          
          try {
            const obs = self.paypal.createOrder(items, self.total, 'USD');
            const res: any = await firstValueFrom(obs);
            console.log('Order created:', res.id);
            return res.id;
          } catch (err: any) {
            console.error('createOrder failed', err);
            throw err;
          }
        },
        onApprove: async function(data: any, actions: any) {
          try {
            const obs = self.paypal.captureOrder(data.orderID, self.cart?.items || []);
            const result: any = await firstValueFrom(obs);
            console.log('Payment captured:', result);
            const captured = result?.summary?.amountCaptured;
            const capturedText = captured ? `${captured.value} ${captured.currency_code}` : '';
            const stockChanges = result?.summary?.stockChanges || [];
            const stockText = stockChanges.length
              ? ` El stock se actualizó en ${stockChanges.length} item(s).`
              : '';
            
            // Clear cart
            localStorage.removeItem('cart');
            self.cartSvc.cart$.next({ items: [] });
            alert(
              capturedText
                ? `¡Pago completado! Se cobraron ${capturedText} desde tu cuenta PayPal.${stockText}`
                : `¡Pago completado exitosamente! Gracias por tu compra.${stockText}`
            );
          } catch (err: any) {
            console.error('captureOrder failed', err);
            alert('Error al procesar el pago. Por favor intenta de nuevo.');
          }
        },
        onError: function(err: any) {
          console.error('PayPal Buttons error', err);
          alert('Ha ocurrido un error con PayPal. Por favor intenta de nuevo.');
        },
        onCancel: function(data: any) {
          console.log('Payment cancelled by user');
          alert('Pago cancelado.');
        }
      }).render('#paypal-button-container').then(() => {
        self.buttonsRendered = true;
        console.log('PayPal buttons rendered successfully');
      }).catch((err: any) => {
        console.error('Error rendering PayPal buttons:', err);
      });
    } catch (err: any) {
      console.error('Error initializing PayPal buttons:', err);
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = null;
    }
    
    // Limpiar el container de PayPal
    const container = document.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
    }
  }
}
