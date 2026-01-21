import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class PopularVideoService {
    private _api_url = 'http://localhost:8080/api';
    private _video_url = this._api_url + '/popular-videos';

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('jwt');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    getLatest(): Observable<any[]> {
        return this.http.get<any>(this._video_url + "/latest", { headers: this.getHeaders() });
    }
}