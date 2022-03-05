/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { Changes } from "$lib/model/tables/changes/Changes";
import type { Table } from "$lib/model/recursive_table/TableComponents"
import { Backend } from "$lib/controller/backend";
import { ChangeAction } from "$lib/model/tables/changes/ChangeAction";
import type { TableDisplayInformation } from "$lib/model/tables/manager/TableDisplayInformation";
import { Tables } from "$lib/model/tables/Tables";
import type { DataObject } from "$lib/model/recursive_table/Types";
import { ErrorQueue } from "$lib/model/error/ErrorQueue";
import type { ActionComponentFactory } from "$lib/model/tables/manager/TableManager";
import { BlacklistEntry } from "$lib/model/tables/blacklist/Blacklist";
import type { Listener } from "$lib/model/Listener";
import type { LoginConfiguration, UserData } from "../AuthManager";

/**
 * The Framework represents the backend of this SPA.
 * It provides common methods to interact with the separate classes to ease the interface up.
 * It manages the special changes table.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class Framework {

    private static instance: Framework = undefined;
    private backend: Backend;
    private changes: Changes;
    private errors: ErrorQueue;

    /**
     * Construct the framework.
     * Private due to being a singleton.
     */
    protected constructor() {
        this.errors = new ErrorQueue();
        this.backend = new Backend(
            (error) => this.errors.addError(error),
            (data) => !this.containsChangeByMetadata(data),
            (change) => this.addChange(change)
        );
        this.changes = new Changes();
    }

    /**
     * Retrieve the current instance.
     * @returns Framework
     */
    public static getInstance(): Framework {
        if (Framework.instance === undefined) {
            Framework.instance = new Framework();
        }
        return Framework.instance;
    }

    /**
     * Getter for the display information of the specified table.
     * @param table {@link Tables}
     * @returns {@link TableDisplayInformation} of the selected Table
     */
    public getTableDisplayInformation(table: Tables): TableDisplayInformation<string, Table<string>> {
        if (table === Tables.CHANGES) {
            return this.changes.getTableDisplayInformation();
        }
        return this.backend.getTableDisplayInformation(table);
    }

    /**
     * Setter for the display style of the actions of the specified table.
     * Must be called before displaying the table.
     * 
     * @param table {@link Tables}
     * @param factory An {@link ActionComponentFactory} which produces a factory to render the component.
     * @returns {@link TableDisplayInformation} of the selected Table
     */
    public setActionComponentFactory(table: Tables, factory: ActionComponentFactory) {
        if (table === Tables.CHANGES) {
            return this.changes.setActionComponentFactory(factory);
        }
        return this.backend.setActionComponentFactory(table, factory);
    }

    /**
     * Get all implemented tables.
     * @returns All {@link Tables}
     */
    public getTables(): Tables[] {
        return Object.keys(Tables)
            .filter(item => Number.isNaN(Number(item)))
            .map(key => Tables[key]);
    }

    /**
     * Add an Action the user made to the action table.
     * This does not execute the action, the user may delete the action.
     * If the user deletes the action, then {@link onRemove} is called.
     * 
     * @param action The {@link ChangeAction} to be added.
     */
    public addChange(action: ChangeAction) {
        this.changes.add(action);
    }

    /**
     * Observe changes on the changes
     * @param update {@link Listener Listener<Table<string>>}
     */
    public onChangesUpdate(onUpdate: Listener<Table<string>>) {
        this.changes.addListener(onUpdate);
    }

    /**
     * Checks if the given metadata is contained as a change
     * @param change the metadata as a DataObject<string>
     * @returns true iff contained
     */
    public containsChangeByMetadata(change: DataObject<string>): boolean {
        return this.changes.containsMetadata(change)
    }

    /**
     * Login the user.
     * {@link configureAuthentication} must be called first once to configure the login process.
     */
    public async login() {
        await this.backend.login();
    }

    /**
     * Logout the user.
     * {@link configureAuthentication} must be called first once.
     */
    public async logout() {
        await this.backend.logout();
    }

    /**
     * Register an {@link Listener Listener<boolean>} to be called on update of the authentication state.
     * @param onUpdate {@link Listener Listener<boolean>}
     */
    public onAuthenticationUpdate(onUpdate: Listener<boolean>) {
        this.backend.addAuthenticationListener(onUpdate);
    }

    /**
     * Getter fot the authentication state
     * @returns true if the user is authenticated
     */
    public isAuthenticated(): boolean {
        return this.backend.isAuthenticated();
    }

    /**
     * Finish the login authentication process after the authentication provider redirected.
     */
    public redirectAfterLogin(redirect: (href: string) => void) {
        this.backend.redirectAfterLogin(redirect);
    }

    /**
     * Finish the logout authentication process after the authentication provider redirected.
     */
    public redirectAfterLogout(redirect: (href: string) => void) {
        this.backend.redirectAfterLogout(redirect);
    }

    /**
     * Broadcast an error and add it to the current error list.
     * @param error {@code Error | string}
     */
    public addError(error: Error | string) {
        this.errors.addError(error);
    }

    /**
     * Register an error listener
     * @param onError {@link Listener Listener<(Error | string)[]>}
     */
    public onError(onError: Listener<(Error | string)[]>) {
        this.errors.addListener(onError);
    }

    /**
     * Remove an error of the error list
     * @param error {@code Error | string}
     */
    public removeError(error: Error | string) {
        this.errors.removeError(error);
    }

    /**
     * Getter wether the current user is an admin or not
     * @returns true if the user is an admin
     */
    public async isAdmin(): Promise<boolean> {
        return this.backend.isAdmin();
    }

    /**
     * Getter for the user data.
     * @returns The {@link UserData} containing the required information
     */
    public getUserData(): UserData {
        return this.backend.getUserData();
    }

    /**
     * Configure the login process to use the provided settings.
     * @param config The {@link LoginConfiguration} with the required settings.
     */
    public configureAuthentication(config: LoginConfiguration) {
        this.backend.configureAuthentication(config);
    }

    /**
     * Adds an element to the blacklist.
     * @param entry to add to the blacklist
     */
    public addToBlacklist(entry: string) {
        this.addChange(new ChangeAction(
            () => this.backend.addToBlacklist(new BlacklistEntry(entry)),
            () => Promise.resolve(true),
            {"0": ["Begriff", [entry]]},
            "Blacklist",
            "Hinzufügen"
        ))
    }
}