import { Routes } from '@angular/router';

// Importa tus componentes reales aquí:

import { NosotrosComponent } from './components/pages/nosotros/nosotros.component';
import { ContactosComponent } from './components/pages/contactos/contactos.component';
import { LoginComponent } from './components/pages/login/login.component';
import { MetodosPagoComponent } from './components/pages/metodos-pago/metodos-pago.component';
import { HomeComponent } from './components/home/home.component';
import { AccesoriosComponent } from './components/pages/accesorios/accesorios.component';
import { AlimentoComponent } from './components/pages/alimento/alimento.component';
import { PopularComponent } from './components/pages/popular/popular.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: HomeComponent },

  {
    path: 'productos',
    children: [
      { path: 'accesorios', component: AccesoriosComponent },
      { path: 'alimento', component: AlimentoComponent },
      { path: 'popular', component: PopularComponent },
    ]
  },

  { path: 'components/pages/nosotros', component: NosotrosComponent },

  { path: 'contactos', component: ContactosComponent },
  { path: 'login', component: LoginComponent },
  { path: 'metodos-pago', component: MetodosPagoComponent },

  // Ruta por si se equivocan
  { path: '**', redirectTo: 'home' }
];
