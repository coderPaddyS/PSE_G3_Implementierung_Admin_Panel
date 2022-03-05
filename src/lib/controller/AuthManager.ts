import { Observable } from "$lib/model/Listener";
import type { Listener } from "$lib/model/Listener";
import type { User, UserManagerSettings, Profile } from "oidc-client";
import oidc from "oidc-client";

export type UserData = Profile;

export type LoginConfiguration = {
    settings: UserManagerSettings,
    loginRedirectURI: URL,
    logoutRedirectURI: URL
};

export default class AuthManager {
    private config: LoginConfiguration;
    private userData: UserData;
    private auth: oidc.UserManager;
    private static readonly configStoreKey: string = "authconfig";
    private isLoggedIn: Observable<boolean>;
    getAccessToken: () => string;

    private onError: (error: string | Error) => void;

    public constructor(onError: (error: string | Error) => void) {
        this.isLoggedIn = new Observable(false);
        this.onError = onError;
    }

    /**
     * The configuration used to configure the login process
     * @param config {@link LoginConfiguration}
     */
    private configureManager(config: LoginConfiguration) {
        this.config = config;
        window.sessionStorage.setItem(AuthManager.configStoreKey, JSON.stringify(config));
        this.auth = new oidc.UserManager(config.settings);
        this.auth.events.addUserLoaded((user) => this.onUserLoaded(user));
        this.auth.events.addUserUnloaded(() => this.onUserUnloaded());
        this.auth.events.addSilentRenewError((error: string | Error) => this.onSilentRenewError(error));
    }

    /**
     * Getter for the user data.
     * @returns The {@link UserData} containing the required information
     */
    public getUserData(): UserData {
        return this.userData;
    }

    /**
     * Login using the previously via {@link configureAuthentication} configured settings.
     */
    public async login() {
        await this.auth.signinRedirect().catch((error) => this.onError(error));
    }

    /**
     * Method to call after the user was redirected of the authorization provider after login.
     * Finishes the login procedure.
     */
    public redirectAfterLogin(redirect: (href: string) => void) {
        this.configureManager(JSON.parse(window.sessionStorage.getItem(AuthManager.configStoreKey)));
        this.auth.signinCallback()
            .then((_) => redirect(this.config.loginRedirectURI.toString()))
            .catch((error) => this.onError(error));
    }

    /**
     * Logout using the previously via {@link configureAuthentication} configured settings.
     */
    public async logout() {
        this.auth.signoutRedirect().catch((error) => this.onError(error));
    }

    /**
     * Method to call after the user was redirected of the authorization provider after logout.
     * Finishes the logout procedure.
     */
    public redirectAfterLogout(redirect: (href: string) => void) {
        this.configureManager(JSON.parse(window.sessionStorage.getItem(AuthManager.configStoreKey)));
        this.auth.signoutRedirectCallback()
            .then(() => 
                redirect(this.config.logoutRedirectURI.toString())
            )
            .catch((error) => this.onError(error));
    }

    /**
     * Getter for the authentication state of the user.
     * @returns true if the user is authenticated
     */
    public isAuthenticated(): boolean {
        return this.isLoggedIn.get();
    }

    /**
     * Configure the login process to use the provided settings.
     * @param config The {@link LoginConfiguration} with the required settings.
     */
    public configureAuthentication(config: LoginConfiguration) {
        this.configureManager(config);
    }

    /**
     * Get notified on updates of the authentication state.
     * @param onUpdate A boolean-Consumer as listener
     */
    public addAuthenticationListener(onUpdate: Listener<boolean>) {
        this.isLoggedIn.add(onUpdate);
    }

    private onUserLoaded(user: User) {
        this.getAccessToken = () => user.access_token;
        this.userData = user.profile;

        this.isLoggedIn.set(true);
    }

    private onUserUnloaded() {
        this.getAccessToken = undefined;
        this.userData = undefined;

        this.isLoggedIn.set(false);
    }

    private onSilentRenewError(error: string | Error) {
        this.onError(error);
        this.isLoggedIn.set(false);
    }
}