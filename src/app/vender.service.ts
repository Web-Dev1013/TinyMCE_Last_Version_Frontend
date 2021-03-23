import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_UPLOAD_URL = 'http://localhost:8080/api';
@Injectable({
  providedIn: 'root'
})

export class VenderService {

  constructor(private http: HttpClient) { }

  getListFiles(): Observable<any> {
    const req = new HttpRequest("GET", `${API_UPLOAD_URL}/files`, {
      reportProgress: true,
      responseType: 'json'
    });
    return this.http.request(req);
  }

  upload(file: any, id: any): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('id', id);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);
    const req = new HttpRequest('POST', `${API_UPLOAD_URL}/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  saveImageInfo(id: any, fileName: any, altData: any, caption: any, stateFlag: any): Observable<HttpEvent<any>> {
    const imageInfo = { id, fileName, altData, caption, stateFlag }
    console.log("imageInfo", imageInfo);
    const req = new HttpRequest("POST", `${API_UPLOAD_URL}/saveImageInfo`, imageInfo, {
      reportProgress: true,
      responseType: 'json'
    });
    return this.http.request(req);
  }

  removeImage(removeImageId: any): Observable<HttpEvent<any>> {
    const id = {removeImageId};
    const req = new HttpRequest("POST", `${API_UPLOAD_URL}/removeImage`, id, {
      reportProgress: true,
      responseType: 'json'
    });
    return this.http.request(req);
  }
}
