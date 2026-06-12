import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService, User } from '../../services/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  standalone: true
})
export class NavbarComponent implements OnInit{
  public cartCount = 0;
  public currentUser: User | null = null;
  public isAdmin: boolean = false;

  constructor(
    private _cartService: CartService,
    private authService: AuthService
  ){}

  ngOnInit(): void {
    // subscribe to cart changes
    this._cartService.cart$.subscribe((cart: any) => {
      const count = (cart && cart.items) ? cart.items.reduce((s: number, i: any) => s + (i.qty || 1), 0) : 0;
      this.cartCount = count;
    });

    // subscribe to user changes
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  logout(): void {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

}
