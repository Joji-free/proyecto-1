import { Component , OnInit} from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FooterComponent } from '../../footer/footer.component';
import {CommonModule} from '@angular/common';
import { AlimentoService } from '../../../services/alimento.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { Global } from '../../../services/global';
import { Alimento } from '../../../models/alimento';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-alimento',
  imports: [NavbarComponent, FooterComponent, CommonModule, HttpClientModule, RouterModule],
  templateUrl: './alimento.component.html',
  styleUrl: './alimento.component.css',
  standalone:true,
  providers: [AlimentoService]
})
export class AlimentoComponent implements OnInit {

  public alimentos: any[];
  public url: string;
  public confirmingId: any;
  public cartCount: number = 0;

  constructor(
    private _alimentoService: AlimentoService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _cartService: CartService
  ){
    this.url = Global.url
    this.alimentos=[];
    this.confirmingId = null;
  }

  ngOnInit() {
    this.getAlimentos();
    this._cartService.cart$.subscribe((cart: any) => {
      this.cartCount = (cart && cart.items) ? cart.items.reduce((s: number, i: any) => s + (i.qty || 1), 0) : 0;
    });
  }

  tieneStock(alimento: any): boolean {
    return Number(alimento?.stock || 0) > 0;
  }

  getAlimentos(){
    this._alimentoService.getAlimentos().subscribe(
      response =>{
        if(response.producto){
          this.alimentos = response.producto;
        }
      },
      error =>{
        console.log(<any>error);
      }
    );
  }

  addToCart(alimento: any) {
    if (!this.tieneStock(alimento)) {
      alert('Este producto no tiene stock disponible.');
      return;
    }
    // show confirmation prompt
    this.confirmingId = alimento._id;
  }

  confirmAdd(alimento: any) {
    if (!this.tieneStock(alimento)) {
      alert('Este producto no tiene stock disponible.');
      this.confirmingId = null;
      return;
    }
    const id = alimento._id;
    this._cartService.addToCart(id, 'producto', 1).subscribe(
      res => {
        console.log('Añadido al carrito', res);
        this.confirmingId = null;
      },
      err => {
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

