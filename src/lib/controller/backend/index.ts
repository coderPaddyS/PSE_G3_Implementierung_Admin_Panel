import type { Table } from "$lib/model/table/TableComponents";
import { Blacklist, BlacklistEntry } from "$lib/model/Blacklist";
import { OfficialAliases } from "$lib/model/OfficialAliases";
import type { Alias } from "$lib/model/Alias";
import { AliasSuggestions } from "$lib/model/AliasSuggestions";
import type { TableListener } from "$lib/model/TableManager";
import type { User, UserManagerSettings } from "oidc-client";
import { UserManager } from "oidc-client";
import { goto } from "$app/navigation";


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

    private getAccessToken: () => string;
    private onError: Set<(error: string | Error) => void>;

    private onAuthenticationChange: Set<(auth: boolean) => void>;

    /**
     * Construct a new instance of the Backend
     */
    public constructor(config: LoginConfiguration, onError: (error: string | Error) => void) {
        this.configureManager(config);
        this.getAccessToken = undefined;
        this.onError = new Set();
        this.onError.add(onError);
        this.onAuthenticationChange = new Set();

        this.blacklist = new Blacklist((body: string) => this.fetchBackend(body));
        // this.blacklist.setData(["Eintrag 1", "Eintrag 42", "Eintrag 3"].map(entry => new BlacklistEntry(entry)));
        this.official = new OfficialAliases(
            (body: string) => this.fetchBackend(body),
            (entry: string) => this.blacklist.addEntry(new BlacklistEntry(entry))
        );
        this.suggestions = new AliasSuggestions(
            (body: string) => this.fetchBackend(body),
            (entry: string) => this.addToBlacklist(new BlacklistEntry(entry)),
            (entry: Alias) => this.addToOfficial(entry)            
        );
    }

    /**
     * Fetches the blacklist data and returns a parsed table.
     * @returns Promise of {@link Table<string>}
     */
    public async getBlacklist(): Promise<Table<string>> {
        return this.blacklist.getTable();
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
            console.log(error);
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
            console.log(error);
            return false;
        });

        if (added) {
            this.official.addEntry(alias);
        }
        return added;
    }

    /**
     * Observe changes on the backend
     * @param update {@link BlacklistListener}
     */
    public onBlacklistUpdate(update: TableListener) {
        this.blacklist.addListener(update);
    }

    public async getOfficialAliases(): Promise<Table<string>> {
        return this.official.getTable();
    }

    public onOfficialAliasesUpdate(update: TableListener) {
        this.official.addListener(update);
    }

    public async getAliasSuggestions(): Promise<Table<string>> {
        return this.suggestions.getTable();
    }

    public onAliasSuggestionsUpdate(update: TableListener) {
        this.suggestions.addListener(update);
    }

    public addAuthenticationListener(onUpdate: (authenticated: boolean) => void) {
        this.onAuthenticationChange.add(onUpdate);
    }

    private configureManager(config: LoginConfiguration) {
        this.config = config;
        this.auth = new UserManager(config.settings);
        this.auth.events.addUserLoaded((user: User) => {
            this.getAccessToken = () => user.access_token;

            this.notifyAuthenticationChange();
        });
        this.auth.events.addUserUnloaded(() => {
            this.getAccessToken = undefined;

            this.notifyAuthenticationChange();
        });
        this.auth.events.addSilentRenewError((error: string | Error) => {
            this.notifyError(error);
        });
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
        return this.getAccessToken !== undefined;
    }

    private async fetchBackend<T>(body: string): Promise<T> {
        return fetch('https://pse.itermori.de/graphql', {
                headers: {
                    'Authorization': `Bearer ${this.getAccessToken()}`,
                    'content-type': "application/json"
                },
                method: "POST",
                body
        }).then((response: Response) => response.json() as Promise<T>);
    }
}