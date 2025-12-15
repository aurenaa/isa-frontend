import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  currentUser: any;

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {}

  getMyInfo(): Observable<any> {
    return this.http.get(this.config.whoami_url, { 
      withCredentials: true 
    }).pipe(
      user => {
        this.currentUser = user;
        return user;
      }
    );
  }

  getAllUsers(): Observable<any> {
    return this.http.get('http://localhost:8080/api/users/all', { 
      withCredentials: true 
    });
  }
}