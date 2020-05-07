import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';

import { environment as env } from '../../environments/environment';
import { User } from './user.model';

export interface AuthResponseData {
    jwt: string;
    user: {
        id: number,
        username: string,
        email: string,
        fullName: string,
        userType: string,
        profilePicture: {
            formats: {
                thumbnail: {
                    url: string
                }
            }
        }
    }
}

export interface AuthRegisterData {
    username: string;
    email: string;
    password: string;
    userType: string;
    fullName: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService implements OnDestroy {
    private _user = new BehaviorSubject<User>(null);

    constructor(private http: HttpClient) { }

    private setUserData(userData: AuthResponseData) {
        const user = new User(
            userData.user.id,
            userData.user.username,
            userData.user.email,
            userData.user.fullName,
            userData.user.userType,
            userData.user.profilePicture ? userData.user.profilePicture.formats.thumbnail.url : '/assets/avatar.svg',
            userData.user.profilePicture ? `${env.endPointAPIURL}${userData.user.profilePicture.formats.thumbnail.url}` : './assets/avatar.svg',
            userData.jwt
        );
        this._user.next(user);
        this.storeAuthData(
            user.id,
            user.token,
            user.email
        );
    }

    private storeAuthData(
        userId: number,
        token: string,
        email: string
    ) {
        const data = JSON.stringify({
            userId: userId,
            token: token,
            email: email
        });
        Plugins.Storage.set({ key: 'authData', value: data });
    }

    get userIsAuthenticated() {
        return this._user.asObservable().pipe(
            map(user => {
                if (user) {
                    return !!user.token;
                } else {
                    return false;
                }
            })
        );
    }

    get userId() {
        return this._user.asObservable().pipe(
            map(user => {
                if (user) {
                    return user.id;
                } else {
                    return null;
                }
            })
        );
    }

    get userData() {
        return this._user.asObservable().pipe(
            map(user => {
                if (user) {
                    return user;
                } else {
                    return null;
                }
            })
        );
    }

    get token() {
        return this._user.asObservable().pipe(
            map(user => {
                if (user) {
                    return user.token;
                } else {
                    return null;
                }
            })
        );
    }

    login(identifier: string, password: string) {
        const url = `${env.endPointAPIURL}/auth/local`
        return this.http
            .post<AuthResponseData>(url, { identifier: identifier, password: password })
            .pipe(tap(this.setUserData.bind(this)));
    }

    register(data: AuthRegisterData) {
        const url = `${env.endPointAPIURL}/auth/local/register`
        return this.http
            .post<AuthResponseData>(url, data)
            .pipe(map(res => res));
    }

    logout() {
        this._user.next(null);
        Plugins.Storage.remove({ key: 'authData' });
    }


    ngOnDestroy() {
    }
}