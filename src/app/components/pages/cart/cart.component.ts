import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FooterComponent } from '../../footer/footer.component';
import { CartService } from '../../../services/cart.service';
import { NotificationService } from '../../../services/notification.service';
import { Global } from '../../../services/global';
import { HttpClientModule } from '@angular/common/http';
import { PaypalService } from '../../../services/paypal.service';
import { PaypalLoaderService } from '../../../services/paypal-loader.service';
import { Subscription, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent, HttpClientModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
  public cart: any = { items: [] };
  public url: string = Global.url;
  public notification: { type: string; message: string } | null = null;
  public total = 0;

  public showPaymentModal: boolean = false;
  public selectedPaymentMethod: 'paypal' | 'card' | null = null;
  public cardForm = {
    nombre: '',
    numero: '',
    expiracion: '',
    cvv: ''
  };

  private paypalScriptLoading: boolean = false;
  private paypalSdkLoaded: boolean = false;
  private buttonsRendered: boolean = false;
  private cartSubscription: Subscription | null = null;

  constructor(
    private _cartService: CartService,
    private _notify: NotificationService,
    private _paypal: PaypalService,
    private paypalLoader: PaypalLoaderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPayPalSDK();
    this.loadCart();

    this._notify.getObservable().subscribe(n => {
      if (n && n.message) {
        this.notification = { type: n.type, message: n.message };
        setTimeout(() => { this.notification = null; }, 3000);
      }
    });

    this.cartSubscription = this._cartService.cart$.subscribe(c => {
      this.cart = c;
      this.computeTotal();
      this.cdr.detectChanges();

      if (
        this.showPaymentModal &&
        this.selectedPaymentMethod === 'paypal' &&
        this.cart?.items?.length > 0 &&
        this.paypalSdkLoaded
      ) {
        setTimeout(() => this.renderButtons(), 100);
      }
    });
  }

  private loadPayPalSDK() {
    if ((window as any).paypal) {
      this.paypalSdkLoaded = true;
      return;
    }

    if (this.paypalScriptLoading) return;

    this.paypalScriptLoading = true;
    this.paypalLoader.loadSdk()
      .then(() => {
        this.paypalSdkLoaded = true;
        this.paypalScriptLoading = false;

        if (
          this.showPaymentModal &&
          this.selectedPaymentMethod === 'paypal' &&
          this.cart?.items?.length > 0
        ) {
          setTimeout(() => this.renderButtons(), 100);
        }
      })
      .catch((err: any) => {
        console.error('Error loading PayPal SDK', err);
        this.paypalScriptLoading = false;
      });
  }

  loadCart() {
    this._cartService.getCart().subscribe(
      res => {
        if (res.cart) this.cart = res.cart;
      },
      (err: any) => console.error(err)
    );
    this.computeTotal();
  }

  updateQty(item: any, delta: number) {
    const newQty = (item.qty || 1) + delta;
    this._cartService.updateItem(item.itemId, item.kind, newQty).subscribe(
      _res => { this.loadCart(); },
      (err: any) => console.error(err)
    );
  }

  remove(item: any) {
    this._cartService.removeItem(item.itemId, item.kind).subscribe(
      _res => { this.loadCart(); },
      (err: any) => console.error(err)
    );
  }

  getTotal() {
    return this.cart.items.reduce((sum: number, it: any) => sum + (it.precio || 0) * (it.qty || 1), 0);
  }

  computeTotal() {
    try {
      this.total = this.getTotal();
    } catch (e) {
      this.total = 0;
    }
  }

  abrirPago(): void {
    if (!this.cart?.items?.length || this.total <= 0) {
      this._notify.notify('Tu carrito está vacío.', 'info');
      return;
    }

    this.showPaymentModal = true;
    this.selectedPaymentMethod = null;
  }

  cerrarPago(): void {
    this.showPaymentModal = false;
    this.selectedPaymentMethod = null;

    const container = document.getElementById('paypal-button-container-modal');
    if (container) {
      container.innerHTML = '';
    }
  }

  seleccionarMetodo(method: 'paypal' | 'card'): void {
    this.selectedPaymentMethod = method;

    if (method === 'paypal') {
      if ((window as any).paypal) {
        this.paypalSdkLoaded = true;
        setTimeout(() => this.renderButtons(), 100);
      } else {
        this.loadPayPalSDK();
      }
    }
  }

  volverMetodos(): void {
    this.selectedPaymentMethod = null;

    const container = document.getElementById('paypal-button-container-modal');
    if (container) {
      container.innerHTML = '';
    }
  }

  pagarConTarjeta(): void {
    if (!this.cardForm.nombre || !this.cardForm.numero || !this.cardForm.expiracion || !this.cardForm.cvv) {
      this._notify.notify('Completa todos los datos de la tarjeta.', 'error');
      return;
    }

    this._notify.notify('La opción con tarjeta está lista en diseño. Si quieres, te la conecto a una pasarela real.', 'info');
  }

  renderButtons() {
    if (!(window as any).paypal) {
      console.log('PayPal SDK not loaded yet');
      return;
    }

    const container = document.getElementById('paypal-button-container-modal');
    if (!container) {
      console.log('PayPal container not found');
      return;
    }

    container.innerHTML = '';
    this.buttonsRendered = false;

    if (!this.cart?.items?.length || this.total <= 0) {
      console.log('No items in cart or total is 0');
      return;
    }

    const self = this;
    try {
      (window as any).paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal'
        },
        createOrder: async function() {
          const items = (self.cart?.items || []).map((it: any) => ({
            name: it.nombre || it.name || 'Producto',
            unit_amount: Number(it.precio || it.price || 0).toFixed(2),
            quantity: Number(it.qty || it.quantity || 1),
            sku: it.itemId || it.sku || undefined,
            itemId: it.itemId || it.sku || undefined,
            kind: it.kind || 'producto'
          }));

          try {
            const obs = self._paypal.createOrder(items, self.total, 'USD');
            const res = await firstValueFrom(obs);
            return res.id;
          } catch (err: any) {
            console.error('createOrder failed', err);
            throw err;
          }
        },
        onApprove: async function(data: any) {
          try {
            const obs = self._paypal.captureOrder(data.orderID, self.cart?.items || []);
            const result = await firstValueFrom(obs);
            const captured = result?.summary?.amountCaptured;
            const capturedText = captured ? `${captured.value} ${captured.currency_code}` : '';
            const stockChanges = result?.summary?.stockChanges || [];
            const stockText = stockChanges.length
              ? ` El stock se actualizó en ${stockChanges.length} item(s).`
              : '';

            localStorage.removeItem('cart');
            self._cartService.cart$.next({ items: [] });
            self.cerrarPago();
            self._notify.notify(
              capturedText
                ? `¡Pago completado! Se cobraron ${capturedText} desde tu cuenta PayPal.${stockText}`
                : `¡Pago completado exitosamente! Gracias por tu compra.${stockText}`,
              'success'
            );
          } catch (err: any) {
            console.error('captureOrder failed', err);
            self._notify.notify('Error al procesar el pago. Por favor intenta de nuevo.', 'error');
          }
        },
        onError: function(err: any) {
          console.error('PayPal Buttons error', err);
          self._notify.notify('Ha ocurrido un error con PayPal. Por favor intenta de nuevo.', 'error');
        },
        onCancel: function() {
          self._notify.notify('Pago cancelado.', 'info');
        }
      }).render('#paypal-button-container-modal').then(() => {
        self.buttonsRendered = true;
      }).catch((err: any) => {
        console.error('Error rendering PayPal buttons:', err);
      });
    } catch (err: any) {
      console.error('Error initializing PayPal buttons:', err);
    }
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }

    const modalContainer = document.getElementById('paypal-button-container-modal');
    if (modalContainer) {
      modalContainer.innerHTML = '';
    }
  }
}
