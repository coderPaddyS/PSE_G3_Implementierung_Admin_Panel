import { jest } from "@jest/globals";

export default class AuthManager {
    private onError: (error: string | Error) => void;

    public constructor(onError: (error: string | Error) => void) {
        this.onError = onError;
    }
    public getUserData = jest.fn()
    public login = jest.fn()
    public redirectAfterLogin = jest.fn();
    public logout = jest.fn()
    public redirectAfterLogout = jest.fn()
    public isAuthenticated = jest.fn()
    public configureAuthentication = jest.fn()
    public addAuthenticationListener = jest.fn()
}