import { Component, OnInit } from '@angular/core';
import { CarruselProductosComponent } from '../carrusel-productos/carrusel-productos.component';
import { InformacionComponent } from '../informacion/informacion.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { CartService } from '../../services/cart.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ CarruselProductosComponent, InformacionComponent, NavbarComponent, FooterComponent, RouterModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  public cartCount = 0;

  constructor(private _cartService: CartService) {}

  ngOnInit(): void {
    this._cartService.cart$.subscribe((cart: any) => {
      const count = (cart && cart.items) ? cart.items.reduce((s: number, i: any) => s + (i.qty || 1), 0) : 0;
      this.cartCount = count;
    });
  }
}