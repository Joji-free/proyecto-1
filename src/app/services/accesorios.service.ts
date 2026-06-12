import { Injectable } from "@angular/core"; 
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Global } from "./global";

/**
 * Servicio de Accesorios
 * 
 * Gestiona las operaciones CRUD para productos de tipo accesorio.
 * Maneja collares, correas, juguetes y otros accesorios para mascotas.
 * 
 * Endpoints del backend:
 * - GET /accesorios - Listar todos
 * - POST /guardar-accesorios - Crear nuevo
 * - GET /accesorio/:id - Obtener uno
 * - PUT /accesorio/:id - Actualizar
 * - DELETE /accesorio/:id - Eliminar
 * 
 * @Injectable - Servicio que debe ser provisto en el componente o módulo
 */
@Injectable()
export class AccesoriosService{
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
        this.url = Global.url; // Inicializar con URL global
    }

    /**
     * Obtiene todos los accesorios de la base de datos
     * 
     * @returns Observable con array de accesorios
     */
    getAccesorios():Observable<any>{
        let headers = new HttpHeaders().set('Content-Type','application/json');
        return this._http.get(this.url+'accesorios', {headers:headers});
    }

    /**
     * Guarda un nuevo accesorio en la base de datos
     * 
     * @param accesorio - Objeto con datos del accesorio (nombre, precio, imagen, etc.)
     * @returns Observable con el accesorio creado
     */
    guardarAccesorio(accesorio: any):Observable<any>{
        let params = JSON.stringify(accesorio); // Convertir a JSON
        let headers = this.getAuthHeaders();
        return this._http.post(this.url+'guardar-accesorios', params, {headers:headers});
    }

    /**
     * Obtiene un accesorio específico por su ID
     * 
     * @param id - ID del accesorio en MongoDB
     * @returns Observable con los datos del accesorio
     */
    getAccesorio(id:String):Observable<any>{
        let headers = new HttpHeaders().set('Content-Type','application/json');
        return this._http.get(this.url+'accesorio/'+ id , {headers:headers});
    }
    
    /**
     * Actualiza los datos de un accesorio existente
     * 
     * @param accesorio - Objeto con datos actualizados (debe incluir _id)
     * @returns Observable con el accesorio actualizado
     */
    updateAccesorio(accesorio: any): Observable<any>{
        let params = JSON.stringify(accesorio);
        let headers = this.getAuthHeaders();
        return this._http.put(this.url+ 'accesorio/'+ accesorio._id, params, {headers:headers});
    }

    /**
     * Elimina un accesorio por su ID
     * 
     * @param id - ID del accesorio a eliminar
     * @returns Observable con confirmación de eliminación
     */
    deleteAccesorio(id:String):Observable<any>{
        let headers = this.getAuthHeaders();
        return this._http.delete(this.url+'accesorio/'+ id, {headers:headers} );
    }
}
