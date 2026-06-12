import { Injectable } from "@angular/core"; 
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Alimento } from "../models/alimento";  
import { Observable } from "rxjs";
import { Global } from "./global";

/**
 * Servicio de Alimentos (Productos)
 * 
 * Gestiona las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para
 * productos de tipo alimento en la base de datos.
 * 
 * Endpoints del backend:
 * - GET /productos - Listar todos
 * - POST /guardar-productos - Crear nuevo
 * - GET /producto/:id - Obtener uno
 * - PUT /producto/:id - Actualizar
 * - DELETE /producto/:id - Eliminar
 * 
 * @Injectable - Servicio que debe ser provisto en el componente o módulo
 */
@Injectable()
export class AlimentoService{
    public url: String; // URL base del backend

    private getAuthHeaders(): HttpHeaders {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        const token = localStorage.getItem('token');
        if (token) {
            headers = headers
                .set('Authorization', `Bearer ${token}`)
                .set('x-access-token', token);
        }
        return headers;
    }

    /**
     * Constructor del servicio
     * @param _http - HttpClient para realizar peticiones HTTP
     */
    constructor(
        private _http:HttpClient
    ){
        this.url = Global.url; // Inicializar con URL global del backend
    }

    /**
     * Obtiene todos los productos de alimento de la base de datos
     * 
     * @returns Observable con array de alimentos
     */
    getAlimentos():Observable<any>{
        let headers = new HttpHeaders().set('Content-Type','application/json');
        return this._http.get(this.url+'productos', {headers:headers});
    }

    /**
     * Guarda un nuevo producto de alimento
     * 
     * @param alimento - Objeto con datos del alimento (nombre, precio, imagen, etc.)
     * @returns Observable con el alimento creado y su ID
     */
    guardarAlimento(alimento: any):Observable<any>{
        let params = JSON.stringify(alimento); // Convertir objeto a JSON
        let headers = this.getAuthHeaders();
        return this._http.post(this.url+'guardar-productos', params, {headers:headers});
    }

    /**
     * Obtiene un producto de alimento específico por su ID
     * 
     * @param id - ID del alimento en MongoDB
     * @returns Observable con los datos del alimento
     */
    getAlimento(id:String):Observable<any>{
        let headers = new HttpHeaders().set('Content-Type','application/json');
        return this._http.get(this.url+'producto/'+ id , {headers:headers});
    }

    /**
     * Actualiza los datos de un alimento existente
     * 
     * @param alimento - Objeto con datos actualizados (debe incluir _id)
     * @returns Observable con el alimento actualizado
     */
    updateAlimento(alimento: any): Observable<any>{
        let params = JSON.stringify(alimento);
        let headers = this.getAuthHeaders();
        return this._http.put(this.url+ 'producto/'+ alimento._id, params, {headers:headers});
    }

    /**
     * Elimina un producto de alimento por su ID
     * 
     * @param id - ID del alimento a eliminar
     * @returns Observable con confirmación de eliminación
     */
    deleteAlimento(id:String):Observable<any>{
        let headers = this.getAuthHeaders();
        return this._http.delete(this.url+'producto/'+ id, {headers:headers} );
    }
}

