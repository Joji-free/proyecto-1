import { Routes } from '@angular/router';

// Importa tus componentes reales aquí:

import { NosotrosComponent } from './components/pages/nosotros/nosotros.component';
import { ContactosComponent } from './components/pages/contactos/contactos.component';
import { LoginComponent } from './components/pages/login/login.component';
import { MetodosPagoComponent } from './components/pages/metodos-pago/metodos-pago.component';
import { HomeComponent } from './components/home/home.component';
import { AccesoriosComponent } from './components/pages/accesorios/accesorios.component';
import { AlimentoComponent } from './components/pages/alimento/alimento.component';
import { CartComponent } from './components/pages/cart/cart.component';
import { RegisterComponent } from './components/pages/register/register.component';
import { AdminPanelComponent } from './components/pages/admin-panel/admin-panel.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'productos',
    canActivate: [authGuard], // Requiere estar logueado
    children: [
      { path: 'accesorios', component: AccesoriosComponent },
      { path: 'alimento', component: AlimentoComponent },
    ]
  },

  { path: 'nosotros', component: NosotrosComponent },
  { path: 'contactos', component: ContactosComponent },
  { path: 'metodos-pago', component: MetodosPagoComponent },
  { 
    path: 'cart', 
    component: CartComponent,
    canActivate: [authGuard] // Requiere estar logueado
  },
  { 
    path: 'admin', 
    component: AdminPanelComponent,
    canActivate: [adminGuard] // Solo admins
  },

  // Ruta por si se equivocan
  { path: '**', redirectTo: 'home' }
];