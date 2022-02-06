
import { UserManager } from 'oidc-client';
import type { User } from 'oidc-client';
import { goto } from '$app/navigation';

export type AuthenticationListener = (isAuthenticated: boolean) => void;

/**
 * The AuthManagers handles the user authentication for the configured OIDC authorization provider.
 * It also sets authorization headers on successful authorization.
 * 
 * @author Patrick Schneider
 * @version 0.5
 */
export class AuthManager {

    // *********************************************************************
    // TODO: Refactor configuration in configuration classes/hardcoded configuration classes for providers
    private manager: UserManager;
    private authority: string = "https://oidc.scc.kit.edu/auth/realms/kit/";
    private clientId: string = "pse-itermori-de";
    private redirectUri: string = "http://localhost:3000/admin/login";
    private redirectUriAfterAuth: string = "http://localhost:3000/admin/panel";
    private redirectUriAfterLogout: string = "http://localhost:3000/admin";
    private response: string = "code";
    private scope: string = "openid profile email";
    private automaticRenew: boolean = true;
    // **********************************************************************

    private authenticated: boolean = false;

    private listener: Set<AuthenticationListener> = new Set();
    private onError: (error: string) => void;

    /**
     * Construct a new instance.
     * @param onError Listener to get informed on errors
     */
    public constructor(onError: (error: string) => void) {
        this.manager = new UserManager({
            authority: this.authority,
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: this.response,
            scope: this.scope,
            automaticSilentRenew: this.automaticRenew
        });
        this.onError = onError;

        this.manager.events.addUserLoaded((user: User) => {
            this.authenticated = true;
            this.notify();

            // TODO: Add management and setting of tokens
        });
        this.manager.events.addUserUnloaded(() => {
            this.authenticated = false;
            this.notify();

            // TODO: Remove management and setting of tokens
        })
        this.manager.events.addSilentRenewError((error: Error) => {
            this.notify();
            this.authenticated = false;
            this.onError(error.message);

            // TODO: Remove management and setting of tokens
        });
    }

    public configure() {
        // TODO: Implement configuration and refactor
    }

    /**
     * Getter for the authentication state.
     * @returns `true` if the user is successfully authenticated.
     */
    public isAuthenticated(): boolean {
        return this.authenticated;
    }

    /**
     * Register a listener to perform an action when the authentication state changes.
     * @param onUpdate AuthenticationListener
     */
    public onAuthenticationUpdate(onUpdate: AuthenticationListener) {
        this.listener.add(onUpdate);
    }

    /**
     * Notify the listeners on the change in the authentication state.
     */
    private notify() {
        this.listener.forEach(update => update(this.authenticated))
    }

    // TODO: Refactor the following methods into a strategy
    /**
     * Initialize the authentication login process as specified and configured.
     */
    public async login() {
        await this.manager.signinRedirect().catch((error) => this.onError(error));
    }

    /**
     * Initialize the authentication logout process as specified and configured..
     */
    public async logout() {
        await this.manager.signoutRedirect().catch((error) => this.onError(error));
    }

    /**
     * Method to call after the user was redirected of the authorization provider after login.
     * Finishes the login procedure.
     */
    public redirectAfterLogin() {
        this.manager.signinCallback()
            .then(value => goto(this.redirectUriAfterAuth, {replaceState: true}))
            .catch((error) => this.onError(error));
    }

    /**
     * Method to call after the user was redirected of the authorization provider after logout.
     * Finishes the logout procedure.
     */
    public redirectAfterLogout() {
        this.manager.signoutRedirectCallback()
            .then(() => goto(this.redirectUriAfterLogout, {replaceState: true}))
            .catch((error) => this.onError(error));
    }
}