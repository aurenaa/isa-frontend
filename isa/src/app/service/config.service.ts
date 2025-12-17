import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private _api_url = 'http://localhost:8080/api';
  private _auth_url = 'http://localhost:8080/auth';
  private _user_url = this._api_url + '/users';
  private _login_url = this._auth_url + '/signin';
  
  get login_url(): string {
    return this._login_url;
  }

  private _whoami_url = this._user_url + '/me';

  get whoami_url(): string {
    return this._whoami_url;
  }

  private _register_url = this._auth_url + '/register';

  get register_url(): string {
    return this._register_url;
  }

  private _logout_url = this._auth_url + '/logout';

  get logout_url(): string {
    return this._logout_url;
  }
}