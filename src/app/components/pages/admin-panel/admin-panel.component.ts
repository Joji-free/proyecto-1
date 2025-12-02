import { Component, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FooterComponent } from '../../footer/footer.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Global } from '../../../services/global';
import { AlimentoService } from '../../../services/alimento.service';
import { AccesoriosService } from '../../../services/accesorios.service';
import { CargarService } from '../../../services/cargar.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, CommonModule, HttpClientModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css',
  providers: [AlimentoService, AccesoriosService, CargarService]
})
export class AdminPanelComponent implements OnInit {
  // ========== PROPIEDADES GENERALES ==========
  public url: string;
  public status: string = '';
  public tipo: string = 'alimento'; // 'alimento' o 'accesorio'
  
  @ViewChild('archivoImagen') fileInput: any;

  // ========== ALIMENTOS ==========
  public alimentos: any[] = [];
  public alimentoForm: any = {
    nombre: '',
    animal: '',
    sabor: '',
    kg: '',
    precio: '',
    imagen: ''
  };
  public alimentoEditando: any = null;
  public archivosAlimento: Array<File> = [];

  // ========== ACCESORIOS ==========
  public accesorios: any[] = [];
  public accesorioForm: any = {
    nombre: '',
    categoria: '',
    tipo: '',
    precio: '',
    imagen: ''
  };
  public accesorioEditando: any = null;
  public archivosAccesorio: Array<File> = [];

  // ========== MODAL ==========
  public mostrarModal: boolean = false;
  public modalTitulo: string = '';

  constructor(
    private _alimentoService: AlimentoService,
    private _accesoriosService: AccesoriosService,
    private _cargarService: CargarService
  ) {
    this.url = Global.url;
  }

  ngOnInit(): void {
    this.cargarAlimentos();
    this.cargarAccesorios();
  }

  // ============================================
  // MÉTODOS PARA ALIMENTOS
  // ============================================

  cargarAlimentos() {
    this._alimentoService.getAlimentos().subscribe(
      response => {
        if (response.producto) {
          this.alimentos = response.producto;
        }
      },
      error => console.log(error)
    );
  }

  abrirModalAlimento(alimento?: any) {
    this.tipo = 'alimento';
    this.mostrarModal = true;
    
    if (alimento) {
      this.alimentoEditando = alimento;
      this.alimentoForm = { ...alimento };
      this.modalTitulo = 'Editar Alimento';
    } else {
      this.alimentoEditando = null;
      this.alimentoForm = {
        nombre: '',
        animal: '',
        sabor: '',
        kg: '',
        precio: '',
        imagen: ''
      };
      this.modalTitulo = 'Nuevo Alimento';
    }
    this.archivosAlimento = [];
  }

  guardarAlimento(form: NgForm) {
    if (!form.valid) {
      this.status = 'error_form';
      return;
    }

    if (this.alimentoEditando && this.alimentoEditando._id) {
      // ACTUALIZAR
      this.alimentoForm._id = this.alimentoEditando._id;
      this._alimentoService.updateAlimento(this.alimentoForm).subscribe(
        response => {
          if (this.archivosAlimento.length > 0) {
            this._cargarService.peticionRequest(
              this.url + 'subir-imagen/' + response.producto._id,
              [],
              this.archivosAlimento,
              'imagen'
            ).then(() => {
              this.status = 'success_update';
              this.cargarAlimentos();
              this.cerrarModal();
            }).catch(error => {
              this.status = 'error_imagen';
              console.log(error);
            });
          } else {
            this.status = 'success_update';
            this.cargarAlimentos();
            this.cerrarModal();
          }
        },
        error => {
          this.status = 'error';
          console.log(error);
        }
      );
    } else {
      // CREAR NUEVO
      this._alimentoService.guardarAlimento(this.alimentoForm).subscribe(
        response => {
          if (response.producto) {
            if (this.archivosAlimento.length > 0) {
              this._cargarService.peticionRequest(
                this.url + 'subir-imagen/' + response.producto._id,
                [],
                this.archivosAlimento,
                'imagen'
              ).then(() => {
                this.status = 'success_create';
                this.cargarAlimentos();
                form.reset();
                this.cerrarModal();
              }).catch(error => {
                this.status = 'error_imagen';
                console.log(error);
              });
            } else {
              this.status = 'success_create';
              this.cargarAlimentos();
              form.reset();
              this.cerrarModal();
            }
          }
        },
        error => {
          this.status = 'error';
          console.log(error);
        }
      );
    }
  }

  eliminarAlimento(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este alimento?')) {
      this._alimentoService.deleteAlimento(id).subscribe(
        response => {
          this.status = 'success_delete';
          this.cargarAlimentos();
        },
        error => {
          this.status = 'error';
          console.log(error);
        }
      );
    }
  }

  // ============================================
  // MÉTODOS PARA ACCESORIOS
  // ============================================

  cargarAccesorios() {
    this._accesoriosService.getAccesorios().subscribe(
      response => {
        if (response.accesorio) {
          this.accesorios = response.accesorio;
        }
      },
      error => console.log(error)
    );
  }

  abrirModalAccesorio(accesorio?: any) {
    this.tipo = 'accesorio';
    this.mostrarModal = true;

    if (accesorio) {
      this.accesorioEditando = accesorio;
      this.accesorioForm = { ...accesorio };
      this.modalTitulo = 'Editar Accesorio';
    } else {
      this.accesorioEditando = null;
      this.accesorioForm = {
        nombre: '',
        categoria: '',
        tipo: '',
        precio: '',
        imagen: ''
      };
      this.modalTitulo = 'Nuevo Accesorio';
    }
    this.archivosAccesorio = [];
  }

  guardarAccesorio(form: NgForm) {
    if (!form.valid) {
      this.status = 'error_form';
      return;
    }

    if (this.accesorioEditando && this.accesorioEditando._id) {
      // ACTUALIZAR
      this.accesorioForm._id = this.accesorioEditando._id;
      this._accesoriosService.updateAccesorio(this.accesorioForm).subscribe(
        response => {
          if (this.archivosAccesorio.length > 0) {
            this._cargarService.peticionRequest(
              this.url + 'subir-imagen/' + response.accesorio._id,
              [],
              this.archivosAccesorio,
              'imagen'
            ).then(() => {
              this.status = 'success_update';
              this.cargarAccesorios();
              this.cerrarModal();
            }).catch(error => {
              this.status = 'error_imagen';
              console.log(error);
            });
          } else {
            this.status = 'success_update';
            this.cargarAccesorios();
            this.cerrarModal();
          }
        },
        error => {
          this.status = 'error';
          console.log(error);
        }
      );
    } else {
      // CREAR NUEVO
      this._accesoriosService.guardarAccesorio(this.accesorioForm).subscribe(
        response => {
          if (response.accesorio) {
            if (this.archivosAccesorio.length > 0) {
              this._cargarService.peticionRequest(
                this.url + 'subir-imagen/' + response.accesorio._id,
                [],
                this.archivosAccesorio,
                'imagen'
              ).then(() => {
                this.status = 'success_create';
                this.cargarAccesorios();
                form.reset();
                this.cerrarModal();
              }).catch(error => {
                this.status = 'error_imagen';
                console.log(error);
              });
            } else {
              this.status = 'success_create';
              this.cargarAccesorios();
              form.reset();
              this.cerrarModal();
            }
          }
        },
        error => {
          this.status = 'error';
          console.log(error);
        }
      );
    }
  }

  eliminarAccesorio(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este accesorio?')) {
      this._accesoriosService.deleteAccesorio(id).subscribe(
        response => {
          this.status = 'success_delete';
          this.cargarAccesorios();
        },
        error => {
          this.status = 'error';
          console.log(error);
        }
      );
    }
  }

  // ============================================
  // MÉTODOS GENERALES
  // ============================================

  cerrarModal() {
    this.mostrarModal = false;
    this.alimentoEditando = null;
    this.accesorioEditando = null;
  }

  manejarImagenAlimento(event: any) {
    this.archivosAlimento = event.target.files;
  }

  manejarImagenAccesorio(event: any) {
    this.archivosAccesorio = event.target.files;
  }
}
