import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class VideoService {
    private _api_url = 'http://localhost:8080/api';
    private _video_url = this._api_url + '/videos';

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('jwt');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    uploadVideo(videoData: any, videoFile: File, thumbnailFile: File): Observable<any> {
        const formData = new FormData();

        formData.append('data', new Blob([JSON.stringify(videoData)], {
            type: 'application/json'
        }));

        formData.append('video', videoFile);
        formData.append('thumbnail', thumbnailFile);

        const token = localStorage.getItem('jwt');

        return this.http.post(`${this._video_url}/upload`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            reportProgress: true,
            observe: 'events'
        });
    }

    getAllVideos(): Observable<any[]> {
        return this.http.get<any[]>(this._video_url, { headers: this.getHeaders() });
    }

    getVideoById(id: number): Observable<any> {
        const token = localStorage.getItem('jwt');
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http.get(`${this._video_url}/${id}`, { headers });
    }

    incrementView(id: number): Observable<any> {
        const token = localStorage.getItem('jwt');
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http.post(`${this._video_url}/${id}/view`, {}, { headers });
    }

    getVideoDetails(id: number): Observable<any> {
        const token = localStorage.getItem('jwt');
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http.get(`${this._video_url}/${id}/details`, { headers });
    }

    toggleLike(id: number): Observable<any> {
        const token = localStorage.getItem('jwt');
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http.post(`${this._video_url}/${id}/like`, {}, { headers });
    }

    toggleDislike(id: number): Observable<any> {
        const token = localStorage.getItem('jwt');
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http.post(`${this._video_url}/${id}/dislike`, {}, { headers });
    }

    resolveUserLocation(lat?: number, lon?: number): Observable<any[]> {
        let url = `${this._video_url}/trending/local`;
        if (lat != null && lon != null) {
            url += `?lat=${lat}&lon=${lon}`;
        }
        return this.http.get<any[]>(url, { headers: this.getHeaders() });
    getTrendingNearby(lat: number, lon: number, radius: number = 50): Observable<any[]> {
        return this.http.get<any[]>(`${this._video_url}/trending-nearby?lat=${lat}&lon=${lon}&radius=${radius}`, { headers: this.getHeaders() });
    }
}