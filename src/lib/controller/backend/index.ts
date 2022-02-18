/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Table } from "$lib/model/recursive_table/TableComponents";
import { Blacklist, BlacklistEntry } from "$lib/model/tables/blacklist/Blacklist";
import { Alias, OfficialAliases } from "$lib/model/tables/official/OfficialAliases";
import { AliasSuggestions } from "$lib/model/tables/suggestions/AliasSuggestions";
import type { ActionComponentFactory } from "$lib/model/tables/manager/TableManager";
import type { User, UserManagerSettings, Profile } from "oidc-client";
import { UserManager } from "oidc-client";
import { goto } from "$app/navigation";
import { Tables } from "$lib/model/tables/Tables";
import type { TableDisplayInformation } from "$lib/model/tables/manager/TableDisplayInformation";
import { Observable } from "$lib/model/Listener";
import type { Listener } from "$lib/model/Listener";
import type { DataObject, Predicate } from "$lib/model/recursive_table/Types";

export type UserData = Profile;

export type LoginConfiguration = {
    settings: UserManagerSettings,
    loginRedirectURI: URL,
    logoutRedirectURI: URL
};

/**
 * This class manages the communication with the remote backend on the server.
 * For security reasons, it also handles the management of the authentication process to prevent XSS-attacks.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class Backend {

    private static readonly backendURL: string = "https://pse.itermori.de/graphql";

    private auth: UserManager;
    private config: LoginConfiguration;
    private static readonly configStoreKey: string = "authconfig";
    private userData: UserData;
    private isLoggedIn: Observable<boolean>;

    private blacklist: Blacklist;
    private official: OfficialAliases;
    private suggestions: AliasSuggestions;
    private displayInformation: Map<Tables, TableDisplayInformation<string, Table<string>>> = new Map();

    // A true private variable in javascript is prepended with #
    #getAccessToken: () => string;

    private onError: Set<(error: string | Error) => void>;

    /**
     * Construct a new instance of the Backend
     * @param onError A Consumer which accepts an error in form of `string | Error`
     */
    public constructor(
        onError: (error: string | Error) => void,
        showEntry: Predicate<DataObject<string>>) {
        this.#getAccessToken = undefined;
        this.onError = new Set();
        this.onError.add(onError);
        this.isLoggedIn = new Observable(false);

        this.blacklist = new Blacklist(
            (body: string) => this.fetchBackend(body),
            showEntry
        );
        this.official = new OfficialAliases(
            (body: string) => this.fetchBackend(body),
            (entry: string) => {this.blacklist.addEntry(new BlacklistEntry(entry)); return true;},
            showEntry
        );
        this.suggestions = new AliasSuggestions(
            (body: string) => this.fetchBackend(body),
            (entry: string) => this.addToBlacklist(new BlacklistEntry(entry)),
            (entry: Alias) => this.addToOfficial(entry),
            showEntry
        );
        this.displayInformation.set(Tables.BLACKLIST, this.blacklist.getTableDisplayInformation());
        this.displayInformation.set(Tables.ALIAS, this.official.getTableDisplayInformation());
        this.displayInformation.set(Tables.ALIAS_SUGGESTIONS, this.suggestions.getTableDisplayInformation());
    }

    /**
     * Adds a given entry to the remote blacklist. 
     * @param entry The {@link BlacklistEntry} to be added.
     * @returns true if the element wasn't on the blacklist
     */
    public async addToBlacklist(entry: BlacklistEntry): Promise<boolean> {
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

    /**
     * Adds a given alias to the remote official aliases list. 
     * @param alias The {@link Alias} to be added.
     * @returns true if the element wasn't already an official alias.
     */
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

    /**
     * Getter for the display information of the specified table.
     * @param table {@link Tables.BLACKLIST}, {@link Tables.ALIAS}, {@link Tables.ALIAS_SUGGESTIONS}
     * @returns {@link TableDisplayInformation} of the selected Table
     */
    public getTableDisplayInformation(table: Tables): TableDisplayInformation<string, Table<string>> {
        return this.displayInformation.get(table);
    }

    /**
     * Setter for the display style of the actions of the specified table.
     * Must be called before displaying the table.
     * 
     * @param table {@link Tables.BLACKLIST}, {@link Tables.ALIAS}, {@link Tables.ALIAS_SUGGESTIONS}
     * @param factory An {@link ActionComponentFactory} which produces a factory to render the component.
     * @returns {@link TableDisplayInformation} of the selected Table
     */
    public setActionComponentFactory(table: Tables, factory: ActionComponentFactory) {
        switch(table) {
            case Tables.ALIAS: this.official.setActionComponentFactory(factory); break;
            case Tables.ALIAS_SUGGESTIONS: this.suggestions.setActionComponentFactory(factory); break;
            case Tables.BLACKLIST: this.blacklist.setActionComponentFactory(factory); break;
            default:
                throw Error(`No matching table was provided. Provided: ${table}`)
        }
    }

    /**
     * Get notified on updates of the authentication state.
     * @param onUpdate A boolean-Consumer as listener
     */
    public addAuthenticationListener(onUpdate: Listener<boolean>) {
        this.isLoggedIn.add(onUpdate);
    }

    /**
     * The configuration used to configure the login process
     * @param config {@link LoginConfiguration}
     */
    private configureManager(config: LoginConfiguration) {
        this.config = config;
        window.sessionStorage.setItem(Backend.configStoreKey, JSON.stringify(config));
        this.auth = new UserManager(config.settings);
        this.auth.events.addUserLoaded((user: User) => {
            this.#getAccessToken = () => user.access_token;
            this.userData = user.profile;

            this.isLoggedIn.set(true);
        });
        this.auth.events.addUserUnloaded(() => {
            this.#getAccessToken = undefined;
            this.userData = undefined;

            this.isLoggedIn.set(false);
        });
        this.auth.events.addSilentRenewError((error: string | Error) => {
            this.notifyError(error);
            this.isLoggedIn.set(false);
        });
    }

    /**
     * Getter for the user data.
     * @returns The {@link UserData} containing the required information
     */
    public getUserData(): UserData {
        return this.userData;
    }

    /**
     * Broadcast the provided error to the listeners
     * @param error {@code string | Error}
     */
    private notifyError(error: string | Error) {
        this.onError.forEach(listener => listener(error));
    }

    /**
     * Configure the login process to use the provided settings.
     * @param config The {@link LoginConfiguration} with the required settings.
     */
    public configureAuthentication(config: LoginConfiguration) {
        this.configureManager(config);
    }

    /**
     * Login using the previously via {@link configureAuthentication} configured settings.
     */
    public async login() {
        await this.auth.signinRedirect().catch((error) => this.notifyError(error));
    }

    /**
     * Method to call after the user was redirected of the authorization provider after login.
     * Finishes the login procedure.
     */
    public redirectAfterLogin() {
        this.configureManager(JSON.parse(window.sessionStorage.getItem(Backend.configStoreKey)));
        this.auth.signinCallback()
            .then(() => {
                let redirect = window.location.href.match("itermori.de/admin/panel")? window.location.href : this.config.loginRedirectURI.toString();
                goto(redirect, {replaceState: true});
            })
            .catch((error) => this.notifyError(error));
    }

    /**
     * Logout using the previously via {@link configureAuthentication} configured settings.
     */
    public async logout() {
        this.configureManager(JSON.parse(window.sessionStorage.getItem(Backend.configStoreKey)));
        this.auth.signoutRedirect().catch((error) => this.notifyError(error));
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

    /**
     * Getter for the authentication state of the user.
     * @returns true if the user is authenticated
     */
    public isAuthenticated(): boolean {
        return this.isLoggedIn.get();
    }

    /**
     * Getter wether the current user is an admin or not
     * @returns true if the user is an admin
     */
    public async isAdmin(): Promise<boolean> {
        let admin: boolean = false;
        await this.fetchBackend<{data: {isAdmin: boolean}}>(JSON.stringify({
            query:`
                query isAdmin {
                    isAdmin
                }
            `
        })).then(response => {
            console.log(response);
            if (response.data) {
                admin = response.data.isAdmin
            }
        });
        return admin;
    }

    /**
     * Fetch the backend via a POST method.
     * Attaches the authorization credentials to the provided body.
     * 
     * @type T - The expected type of the server response
     * 
     * @param body The fetch body 
     * @returns The specified type
     */
    private async fetchBackend<T>(body: string): Promise<T> {
        try {
            return fetch(Backend.backendURL, {
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
            console.log(error);
        }
    }
}