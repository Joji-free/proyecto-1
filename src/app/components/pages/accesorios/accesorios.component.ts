import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FooterComponent } from '../../footer/footer.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Global } from '../../../services/global';
import { AccesoriosService } from '../../../services/accesorios.service';

@Component({
  selector: 'app-accesorios',
  imports: [NavbarComponent, FooterComponent, CommonModule, HttpClientModule],
  templateUrl: './accesorios.component.html',
  styleUrl: './accesorios.component.css',
  standalone: true,
  providers: [AccesoriosService]
})
export class AccesoriosComponent implements OnInit {
  public accesorios: any[] = [];
  public url: string;
  public confirmingId: any;

  constructor(private _accesoriosService: AccesoriosService) {
    this.url = Global.url;
    this.confirmingId = null;
  }

  ngOnInit() {
    this.getAccesorios();
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

  setConfirm(id: any) {
    this.confirmingId = id;
  }

  borrarAccesorio(id: String) {
    this._accesoriosService.deleteAccesorio(id).subscribe(
      response => {
        if (response.accesorio) {
          this.getAccesorios();
        }
      },
      error => {
        console.log(<any>error);
      }
    );
  }
}
