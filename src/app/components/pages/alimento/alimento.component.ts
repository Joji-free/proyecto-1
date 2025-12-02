import { Component , OnInit} from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FooterComponent } from '../../footer/footer.component';
import {CommonModule} from '@angular/common';
import { AlimentoService } from '../../../services/alimento.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Global } from '../../../services/global';
import { Alimento } from '../../../models/alimento';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-alimento',
  imports: [NavbarComponent, FooterComponent, CommonModule, HttpClientModule],
  templateUrl: './alimento.component.html',
  styleUrl: './alimento.component.css',
  standalone:true,
  providers: [AlimentoService]
})
export class AlimentoComponent implements OnInit {

  public alimentos: Alimento[];
  public url: string;
  public confirmingId: any;

  constructor(
    private _alimentoService: AlimentoService,
    private _router: Router,
    private _route: ActivatedRoute
  ){
    this.url = Global.url
    this.alimentos=[];
    this.confirmingId = null;
  }

  ngOnInit() {
    this.getAlimentos();
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

  setConfirm(id: any){
    this.confirmingId = id;
  }

  borrarAlimento(id: String){
    this._alimentoService.deleteAlimento(id).subscribe(
      response=> {
          if (response.producto){
            this._router.navigate(['alimentos']);
            this.getAlimentos();
      }
    },
    error => {
      console.log(<any>error);
    }
    )
  }
}

