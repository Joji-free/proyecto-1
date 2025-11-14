import { Component } from '@angular/core';
import { CarruselComponent } from '../carrusel/carrusel.component';
import { InformacionComponent } from '../informacion/informacion.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ CarruselComponent, InformacionComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
    
}