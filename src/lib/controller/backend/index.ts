import type { Table } from "$lib/model/recursive_table/TableComponents";
import { Blacklist, BlacklistEntry } from "$lib/model/tables/blacklist/Blacklist";
import { OfficialAliases } from "$lib/model/tables/official/OfficialAliases";
import type { Alias } from "$lib/model/Alias";
import { AliasSuggestions } from "$lib/model/tables/suggestions/AliasSuggestions";
import type { TableListener } from "$lib/model/tables/manager/TableManager";
import type { User, UserManagerSettings, Profile } from "oidc-client";
import { UserManager } from "oidc-client";
import { goto } from "$app/navigation";
import { Tables } from "$lib/model/tables/Tables";
import type { TableDisplayInformation } from "$lib/model/tables/manager/TableDisplayInformation";

export type UserData = Profile;

export type LoginConfiguration = {
    settings: UserManagerSettings,
    loginRedirectURI: URL,
    logoutRedirectURI: URL
};

export type AuthenticationListener = (isAuthenticated: boolean) => void;

/**
 * This class manages the communication with the remote backend on the server.
 * 
 * @author Patrick Schneider
 * @version 0.1
 */
export class Backend {

    private auth: UserManager;
    private config: LoginConfiguration;
    private blacklist: Blacklist;
    private official: OfficialAliases;
    private suggestions: AliasSuggestions;

    private displayInformation: Map<Tables, TableDisplayInformation<string, Table<string>>> = new Map();

    // A true private variable in javascript is prepended with #
    #getAccessToken: () => string;
    private userData: UserData;

    private onError: Set<(error: string | Error) => void>;

    private onAuthenticationChange: Set<(auth: boolean) => void>;

    /**
     * Construct a new instance of the Backend
     */
    public constructor(config: LoginConfiguration, onError: (error: string | Error) => void) {
        this.configureManager(config);
        this.#getAccessToken = undefined;
        this.onError = new Set();
        this.onError.add(onError);
        this.onAuthenticationChange = new Set();

        this.blacklist = new Blacklist((body: string) => this.fetchBackend(body));
        this.official = new OfficialAliases(
            (body: string) => this.fetchBackend(body),
            (entry: string) => this.blacklist.addEntry(new BlacklistEntry(entry))
        );
        this.suggestions = new AliasSuggestions(
            (body: string) => this.fetchBackend(body),
            (entry: string) => this.addToBlacklist(new BlacklistEntry(entry)),
            (entry: Alias) => this.addToOfficial(entry)            
        );
        this.displayInformation.set(Tables.BLACKLIST, this.blacklist.getTableDisplayInformation());
        this.displayInformation.set(Tables.ALIAS, this.official.getTableDisplayInformation());
        this.displayInformation.set(Tables.ALIAS_SUGGESTIONS, this.suggestions.getTableDisplayInformation());
    }

    private async addToBlacklist(entry: BlacklistEntry): Promise<boolean> {
        let added = await this.fetchBackend<{data: {blacklistAlias: boolean}}>(JSON.stringify({
            query: `
                mutation addToBlacklist($entry: String!) {
                    blacklistAlias(toBlacklist: $entry)
                }
            `,
            variables: {
                entry: entry.toDisplayData()[0]
            }
        })).then(response => response.data.blacklistAlias).catch(error => {
            this.notifyError(error);
            return false;
        });
        if (added) {
            this.blacklist.addEntry(entry);
        }
        return added;
    }

    private async addToOfficial(alias: Alias): Promise<boolean> {
        let added = await this.fetchBackend<{data: {approveAliasSuggestion: boolean}}>(JSON.stringify({
            query: `
                mutation addToOfficial($alias: String!, $id: Int!) {
                    approveAliasSuggestion(aliasSuggestion: $alias, mapID: $id)
                }
            `,
            variables: {
                alias: alias.getName(),
                id: alias.getId()
            }
        })).then(response => response.data.approveAliasSuggestion).catch(error => {
            this.notifyError(error);
            return false;
        });

        if (added) {
            this.official.addEntry(alias);
        }
        return added;
    }

    public getTableDisplayInformation(table: Tables): TableDisplayInformation<string, Table<string>> {
        return this.displayInformation.get(table);
    }

    public addAuthenticationListener(onUpdate: (authenticated: boolean) => void) {
        this.onAuthenticationChange.add(onUpdate);
    }

    private configureManager(config: LoginConfiguration) {
        this.config = config;
        this.auth = new UserManager(config.settings);
        this.auth.events.addUserLoaded((user: User) => {
            this.#getAccessToken = () => user.access_token;
            this.userData = user.profile;

            this.notifyAuthenticationChange();
        });
        this.auth.events.addUserUnloaded(() => {
            this.#getAccessToken = undefined;
            this.userData = undefined;

            this.notifyAuthenticationChange();
        });
        this.auth.events.addSilentRenewError((error: string | Error) => {
            this.notifyError(error);
        });
    }

    public getUserData(): Profile {
        return this.userData;
    }

    private notifyError(error: string | Error) {
        this.onError.forEach(listener => listener(error));
    }

    private notifyAuthenticationChange() {
        this.onAuthenticationChange.forEach(listener => listener(this.isAuthenticated()));
    }

    public configureLogin(config: LoginConfiguration) {
        this.configureManager(config);
    }

    public async login() {
        await this.auth.signinRedirect().catch((error) => this.notifyError(error));
    }

    /**
     * Method to call after the user was redirected of the authorization provider after login.
     * Finishes the login procedure.
     */
    public redirectAfterLogin() {
        this.auth.signinCallback()
            .then(value => 
                goto(this.config.loginRedirectURI.toString(), {replaceState: true})
            )
            .catch((error) => this.notifyError(error));
    }

    public async logout() {
        await this.auth.signoutRedirect().catch((error) => this.notifyError(error));
    }

    /**
     * Method to call after the user was redirected of the authorization provider after logout.
     * Finishes the logout procedure.
     */
    public redirectAfterLogout() {
        this.auth.signoutRedirectCallback()
            .then(() => 
                goto(this.config.logoutRedirectURI.toString(), {replaceState: true})
            )
            .catch((error) => this.notifyError(error));
    }

    public isAuthenticated(): boolean {
        return this.#getAccessToken !== undefined;
    }

    public async isAdmin(): Promise<boolean> {
        let admin: boolean = false;
        await this.fetchBackend<{data: {isAdmin: boolean}}>(JSON.stringify({
            query:`
                query isAdmin {
                    isAdmin
                }
            `
        })).then(response => {
            if (response.data) {
                admin = response.data.isAdmin
            }
        });
        return admin;
    }

    private async fetchBackend<T>(body: string, onRejection?: () => void): Promise<T> {
        try {
            return fetch('https://pse.itermori.de/graphql', {
                headers: {
                    'Authorization': `Bearer ${this.#getAccessToken()}`,
                    'content-type': "application/json"
                },
                method: "POST",
                body
            }).then((response: Response) => response.json() as Promise<T>)
            .catch(error => {throw new Error(error)});
        } catch (error){
            this.notifyError(error);
        }
    }
}