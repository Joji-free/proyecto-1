import { Injectable } from '@angular/core';
import { Global } from './global';

/**
 * Servicio de Carga de Archivos
 * 
 * Gestiona la subida de archivos (principalmente imágenes) al servidor
 * usando XMLHttpRequest (AJAX) y FormData.
 * 
 * Este servicio permite subir múltiples archivos en una sola petición
 * y retorna una promesa que resuelve cuando la subida es exitosa.
 * 
 * Uso típico:
 * this.cargarService.peticionRequest(
 *   'http://localhost:3600/subir-imagen',
 *   [],
 *   [archivoFile],
 *   'image'
 * ).then(response => {
 *   console.log('Imagen subida:', response);
 * });
 * 
 * @Injectable - Servicio que debe ser provisto en componente o módulo
 */
@Injectable()
export class CargarService {
  public url: string; // URL base del backend

  /**
   * Constructor del servicio
   */
  constructor() {
    this.url = Global.url; // Inicializar URL base
  }

  /**
   * Realiza una petición POST para subir archivos al servidor
   * 
   * Usa XMLHttpRequest en lugar de HttpClient para mejor control
   * del progreso de subida y manejo de FormData.
   * 
   * @param url - URL completa del endpoint de subida
   * @param params - Array de parámetros adicionales (actualmente no usado)
   * @param files - Array de archivos File a subir
   * @param name - Nombre del campo en el FormData (e.g., 'image', 'file')
   * @returns Promise que resuelve con la respuesta JSON del servidor
   * 
   * @example
   * peticionRequest(
   *   'http://localhost:3600/subir-imagen',
   *   [],
   *   [fileInput.files[0]],
   *   'image'
   * ).then(res => console.log(res.image))
   *  .catch(err => console.error(err));
   */
  peticionRequest(url: string, params: Array<string>, files: Array<File>, name: string) {
    // Retorna una promesa que tiene resolve (éxito) y reject (error)
    return new Promise(function(resolve, reject) {
      // FormData simula un formulario HTML para enviar archivos
      var formData: any = new FormData();
      
      // XMLHttpRequest es el objeto de petición asíncrona (AJAX) nativo de JS
      var xhr = new XMLHttpRequest();
      
      // Recorrer los archivos que lleguen y adjuntarlos al FormData
      // Cada archivo se añade con el nombre especificado y su nombre original
      for (var i = 0; i < files.length; i++) {
        formData.append(name, files[i], files[i].name);
      }
      
      // Handler que se ejecuta cuando hay cambios en el estado de la petición
      xhr.onreadystatechange = function() {
        // readyState == 4 significa que la petición ha completado
        if (xhr.readyState == 4) {
          // status == 200 significa respuesta exitosa (HTTP OK)
          if (xhr.status == 200) {
            // Parsear la respuesta JSON y resolver la promesa
            resolve(JSON.parse(xhr.response));
          } else {
            // Si el status no es 200, rechazar la promesa con el error
            reject(xhr.response);
          }
        }
      }
      
      // Configurar la petición: método POST, URL y async=true
      xhr.open('POST', url, true);

      // Adjuntar JWT para rutas protegidas (subir-imagen requiere auth)
      const token = localStorage.getItem('token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('x-access-token', token);
      }
      
      // Enviar el FormData con los archivos
      xhr.send(formData);
    });
  }
}
