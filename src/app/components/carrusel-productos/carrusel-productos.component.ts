import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AlimentoService } from '../../services/alimento.service';
import { Global } from '../../services/global';

@Component({
  selector: 'app-carrusel-productos',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './carrusel-productos.component.html',
  styleUrl: './carrusel-productos.component.css',
  providers: [AlimentoService]
})
export class CarruselProductosComponent implements OnInit, OnDestroy {
  public productos: any[] = [];
  public url: string;
  
  currentIndex = 0;
  prevIndex = -1;
  nextIndex = 1;
  intervalId: any;
  isPaused = false;

  constructor(private _alimentoService: AlimentoService) {
    this.url = Global.url;
  }

  ngOnInit() {
    this.getProductos();
  }

  getProductos() {
    this._alimentoService.getAlimentos().subscribe(
      response => {
        if (response.producto) {
          // Mostrar solo los primeros 8 productos
          this.productos = response.producto.slice(0, 8);
          this.calculateIndexes();
          this.autoplay();
        }
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  calculateIndexes() {
    const total = this.productos.length;
    this.prevIndex = (this.currentIndex - 1 + total) % total;
    this.nextIndex = (this.currentIndex + 1) % total;
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.productos.length;
    this.calculateIndexes();
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.productos.length) % this.productos.length;
    this.calculateIndexes();
  }

  togglePause() {
    this.isPaused = !this.isPaused;
  }

  autoplay() {
    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        this.next();
      }
    }, 3500);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
}

