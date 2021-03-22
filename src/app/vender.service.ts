import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_UPLOAD_URL = 'http://localhost:8080/api';
@Injectable({
  providedIn: 'root'
})

export class VenderService {

  constructor(private http: HttpClient) { }

  getListFiles():Observable<any>{
    const req = new HttpRequest("GET", `${API_UPLOAD_URL}/files`, {
      reportProgress: true,
      responseType : 'json'
    });
    return this.http.request(req);
  }

  upload(file: any, id: any): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('id', id );
    const req = new HttpRequest('POST', `${API_UPLOAD_URL}/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

}
