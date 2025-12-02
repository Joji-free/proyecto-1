import { Injectable } from "@angular/core"; 
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Global } from "./global";

@Injectable()
export class AccesoriosService{
    public url: String;
    constructor(
        private _http:HttpClient
    ){
        this.url = Global.url;
    }

    getAccesorios():Observable<any>{
        let headers = new HttpHeaders().set('Content-Type','application/json');
        return this._http.get(this.url+'accesorios', {headers:headers});
    }

    guardarAccesorio(accesorio: any):Observable<any>{
        let params = JSON.stringify(accesorio);
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this._http.post(this.url+'guardar-accesorios', params, {headers:headers});
    }

    getAccesorio(id:String):Observable<any>{
        let headers = new HttpHeaders().set('Content-Type','application/json');
        return this._http.get(this.url+'accesorio/'+ id , {headers:headers});
    }
    
    updateAccesorio(accesorio: any): Observable<any>{
        let params = JSON.stringify(accesorio);
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this._http.put(this.url+ 'accesorio/'+ accesorio._id, params, {headers:headers});
    }

    deleteAccesorio(id:String):Observable<any>{
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this._http.delete(this.url+'accesorio/'+ id, {headers:headers} );
    }
}
