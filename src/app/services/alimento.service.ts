import { Injectable } from "@angular/core"; 
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Alimento } from "../models/alimento";  
import { Observable } from "rxjs";
import { Global } from "./global";

@Injectable()
export class AlimentoService{
    public url: String;
    constructor(
        private _http:HttpClient
    ){
        this.url = Global.url;
    }

    getAlimentos():Observable<any>{
        let headers = new HttpHeaders().set('Content-Type','application/json');
        return this._http.get(this.url+'productos', {headers:headers});
    }

    guardarAlimento(alimento: Alimento):Observable<any>{
        let params = JSON.stringify(alimento);
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this._http.post(this.url+'guardar-productos', params, {headers:headers});
    }

    getAlimento(id:String):Observable<any>{
        let headers = new HttpHeaders().set('Content-Type','application/json');
        return this._http.get(this.url+'producto/'+ id , {headers:headers});
    }
    updateAlimento(alimento: Alimento): Observable<any>{
        let params = JSON.stringify(alimento);
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this._http.put(this.url+ 'producto/'+ alimento._id, params, {headers:headers});
    }

    deleteAlimento(id:String):Observable<any>{
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        return this._http.delete(this.url+'producto/'+ id, {headers:headers} );
    }
}

