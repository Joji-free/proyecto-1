import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FooterComponent } from '../../footer/footer.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Global } from '../../../services/global';
import { RouterModule } from '@angular/router';
import { AccesoriosService } from '../../../services/accesorios.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-accesorios',
  imports: [NavbarComponent, FooterComponent, CommonModule, HttpClientModule, RouterModule],
  templateUrl: './accesorios.component.html',
  styleUrl: './accesorios.component.css',
  standalone: true,
  providers: [AccesoriosService]
})
export class AccesoriosComponent implements OnInit {
  public accesorios: any[] = [];
  public url: string;
  public confirmingId: any;
  public cartCount: number = 0;

  constructor(
    private _accesoriosService: AccesoriosService,
    private _cartService: CartService
  ) {
    this.url = Global.url;
    this.confirmingId = null;
  }

  ngOnInit() {
    this.getAccesorios();
    this._cartService.cart$.subscribe((cart: any) => {
      this.cartCount = (cart && cart.items) ? cart.items.reduce((s: number, i: any) => s + (i.qty || 1), 0) : 0;
    });
  }

  tieneStock(accesorio: any): boolean {
    return Number(accesorio?.stock || 0) > 0;
  }

  getAccesorios() {
    this._accesoriosService.getAccesorios().subscribe(
      response => {
        if (response.accesorio) {
          this.accesorios = response.accesorio;
        }
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  addToCart(accesorio: any) {
    if (!this.tieneStock(accesorio)) {
      alert('Este accesorio no tiene stock disponible.');
      return;
    }
    // show confirmation
    this.confirmingId = accesorio._id;
  }

  confirmAdd(accesorio: any) {
    if (!this.tieneStock(accesorio)) {
      alert('Este accesorio no tiene stock disponible.');
      this.confirmingId = null;
      return;
    }
    const id = accesorio._id;
    this._cartService.addToCart(id, 'accesorio', 1).subscribe(
      (res) => {
        console.log('Añadido al carrito', res);
        this.confirmingId = null;
      },
      (err) => {
        console.error(err);
        alert('Error al añadir al carrito');
        this.confirmingId = null;
      }
    );
  }

  cancelConfirm() {
    this.confirmingId = null;
  }
}
