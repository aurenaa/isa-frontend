import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs"

@Injectable({
    providedIn: 'root'
})
export class CommentService {
    private _url = 'http://localhost:8080/api/comments';

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('jwt');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    getVideoComments(videoId: number, page: number, size: number): Observable<any> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get(`${this._url}/video/${videoId}`, { params });
    }

    addComment(videoId: number, text: string): Observable<any> {
        return this.http.post(`${this._url}/video/${videoId}`, { text }, { headers: this.getHeaders() });
    }

}