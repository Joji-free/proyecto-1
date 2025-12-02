import { Routes } from '@angular/router';

// Importa tus componentes reales aquí:

import { NosotrosComponent } from './components/pages/nosotros/nosotros.component';
import { ContactosComponent } from './components/pages/contactos/contactos.component';
import { LoginComponent } from './components/pages/login/login.component';
import { MetodosPagoComponent } from './components/pages/metodos-pago/metodos-pago.component';
import { HomeComponent } from './components/home/home.component';
import { AccesoriosComponent } from './components/pages/accesorios/accesorios.component';
import { AlimentoComponent } from './components/pages/alimento/alimento.component';
import { RegisterComponent } from './components/pages/register/register.component';
import { AdminPanelComponent } from './components/pages/admin-panel/admin-panel.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: HomeComponent },

  {
    path: 'productos',
    children: [
      { path: 'accesorios', component: AccesoriosComponent },
      { path: 'alimento', component: AlimentoComponent },
    ]
  },

  { path: 'nosotros', component: NosotrosComponent },
  {path:'register', component:RegisterComponent},
  { path: 'contactos', component: ContactosComponent },
  { path: 'login', component: LoginComponent },
  { path: 'metodos-pago', component: MetodosPagoComponent },
  { path: 'admin', component: AdminPanelComponent },

  // Ruta por si se equivocan
  { path: '**', redirectTo: 'home' }
];