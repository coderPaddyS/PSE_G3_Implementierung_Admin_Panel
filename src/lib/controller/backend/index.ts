/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Table } from "$lib/model/recursive_table/TableComponents";
import { Blacklist, BlacklistEntry } from "$lib/model/tables/blacklist/Blacklist";
import { Alias, OfficialAliases } from "$lib/model/tables/official/OfficialAliases";
import { AliasSuggestions } from "$lib/model/tables/suggestions/AliasSuggestions";
import type { ActionComponentFactory } from "$lib/model/tables/manager/TableManager";
import { Tables } from "$lib/model/tables/Tables";
import type { TableDisplayInformation } from "$lib/model/tables/manager/TableDisplayInformation";
import type { Listener } from "$lib/model/Listener";
import type { DataObject, Predicate } from "$lib/model/recursive_table/Types";
import AuthManager from "$lib/controller/AuthManager";
import type { LoginConfiguration, UserData } from "$lib/controller/AuthManager";
import type { ChangeAction } from "$lib/model/tables/changes/ChangeAction";

/**
 * This class manages the communication with the remote backend on the server.
 * For security reasons, it also handles the management of the authentication process to prevent XSS-attacks.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class Backend {

    private static readonly backendURL: string = "https://pse.itermori.de/graphql";

    private blacklist: Blacklist;
    private official: OfficialAliases;
    private suggestions: AliasSuggestions;
    private displayInformation: Map<Tables, TableDisplayInformation<string, Table<string>>> = new Map();

    private onError: Set<(error: string | Error) => void>;

    #auth: AuthManager;

    /**
     * Construct a new instance of the Backend
     * @param onError A Consumer which accepts an error in form of `string | Error`
     */
    public constructor(
        onError: (error: string | Error) => void,
        showEntry: Predicate<DataObject<string>>,
        addChange: (action: ChangeAction) => void) {
        this.onError = new Set();
        this.onError.add(onError);

        this.blacklist = new Blacklist(
            (body: string) => this.fetchBackend(body),
            showEntry,
            addChange
        );
        this.official = new OfficialAliases(
            (body: string) => this.fetchBackend(body),
            async (entry: string) => this.addToBlacklist(new BlacklistEntry(entry)),
            showEntry,
            addChange
        );
        this.suggestions = new AliasSuggestions(
            (body: string) => this.fetchBackend(body),
            (entry: string) => this.addToBlacklist(new BlacklistEntry(entry)),
            (entry: Alias) => this.addToOfficial(entry),
            showEntry, addChange
        );
        this.displayInformation.set(Tables.BLACKLIST, this.blacklist.getTableDisplayInformation());
        this.displayInformation.set(Tables.ALIAS, this.official.getTableDisplayInformation());
        this.displayInformation.set(Tables.ALIAS_SUGGESTIONS, this.suggestions.getTableDisplayInformation());

        this.#auth = new AuthManager((error: string | Error) => this.notifyError(error));
    }

    /**
     * Adds a given entry to the remote blacklist. 
     * @param entry The {@link BlacklistEntry} to be added.
     * @returns true if the element wasn't on the blacklist
     */
    public async addToBlacklist(entry: BlacklistEntry): Promise<boolean> {
        let added = await this.fetchBackend<{data: {blacklistAlias: boolean}}>(JSON.stringify({
            query: `
                mutation addToBlacklist($toBlacklist: String!) {
                    blacklistAlias(toBlacklist: $toBlacklist)
                }
            `,
            variables: {
                toBlacklist: entry.toDisplayData()[0]
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
                mutation addToOfficial($aliasSuggestion: String!, $mapID: Int!) {
                    approveAliasSuggestion(aliasSuggestion: $aliasSuggestion, mapID: $mapID)
                }
            `,
            variables: {
                aliasSuggestion: alias.getName(),
                mapID: alias.getId()
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
        this.#auth.addAuthenticationListener(onUpdate);
    }

    /**
     * Getter for the user data.
     * @returns The {@link UserData} containing the required information
     */
    public getUserData(): UserData {
        return this.#auth.getUserData();
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
        this.#auth.configureAuthentication(config);
    }

    /**
     * Login using the previously via {@link configureAuthentication} configured settings.
     */
    public async login() {
        this.#auth.login();
    }

    /**
     * Method to call after the user was redirected of the authorization provider after login.
     * Finishes the login procedure.
     */
    public redirectAfterLogin(redirect: (href: string) => void) {
        this.#auth.redirectAfterLogin(redirect);
    }

    /**
     * Logout using the previously via {@link configureAuthentication} configured settings.
     */
    public async logout() {
        this.#auth.logout();
    }

    /**
     * Method to call after the user was redirected of the authorization provider after logout.
     * Finishes the logout procedure.
     */
    public redirectAfterLogout(redirect: (href: string) => void) {
        this.#auth.redirectAfterLogout(redirect);
    }

    /**
     * Getter for the authentication state of the user.
     * @returns true if the user is authenticated
     */
    public isAuthenticated(): boolean {
        return this.#auth.isAuthenticated();
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
            if (response.data) {
                admin = response.data.isAdmin
            }
        }).catch(error => this.notifyError(error));
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
    private async fetchBackend<T extends {data?: Object, error?: {}}>(body: string): Promise<T> {
        try {
            return fetch(Backend.backendURL, {
                headers: {
                    'Authorization': `Bearer ${this.#auth.getAccessToken()}`,
                    'content-type': "application/json"
                },
                method: "POST",
                body
            }).then((response: Response) => response.json() as Promise<T>)
            .then(response => {
                if (!response.data) {
                    throw new Error(JSON.stringify(response))
                } else {
                    return response
                }
            })
            .catch(error => {throw new Error(error)});
        } catch (error){
            this.notifyError(error);
            console.log(error);
        }
    }
}