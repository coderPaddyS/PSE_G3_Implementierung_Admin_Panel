import { Changes } from "$lib/model/Changes";
import type { ChangesListener } from "$lib/model/Changes";
import type { Table } from "$lib/model/table/TableComponents"
import { Backend } from "../backend";
import type { AuthenticationListener } from "../backend";
import type { Action } from "$lib/model/Changes/Action";
import { ChangeAction } from "$lib/model/Changes/ChangeAction";
import type { Alias } from "$lib/model/Alias";
import type { TableListener } from "$lib/model/TableManager";


/**
 * The Framework represents the backend of this SPA.
 * It provides common methods to interact with the separate classes to ease the interface up.
 * 
 * @author Patrick Schneider
 * @version 0.2
 */
export class Framework {

    private static instance: Framework = undefined;
    private backend: Backend;
    private changes: Changes;

    private errorListener: Set<(error: string) => void>;

    /**
     * Construct the framework.
     * Private due to being a singleton.
     */
    private constructor() {
        this.backend = new Backend({
                loginRedirectURI: new URL("http://localhost:3000/admin"),
                logoutRedirectURI: new URL("http://localhost:3000/admin"),
                settings: {
                    authority: "https://oidc.scc.kit.edu/auth/realms/kit/",
                    client_id: "pse-itermori-de",
                    redirect_uri: "http://localhost:3000/admin/login",
                    response_type: "code",
                    scope: "openid profile email",
                    automaticSilentRenew: true
                }
            },
            () => "");
        this.changes = new Changes();
        this.errorListener = new Set();
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
     * Retrieve the current blacklist
     * @returns Promise of {@link Table<string>}
     */
    public async getBlacklist(): Promise<Table<string>> {
        let table = this.backend.getBlacklist();
        return table;
    }

    /**
     * Observe changes on the backend
     * @param update {@link BlacklistListener}
     */
    public onBlacklistUpdate(onUpdate: TableListener) {
        this.backend.onBlacklistUpdate(onUpdate);
    }

    /**
     * Retrieve the current blacklist
     * @returns Promise of {@link Table<string>}
     */
    public async getOfficialAliases(): Promise<Table<string>> {
        let table = this.backend.getOfficialAliases();
        return table;
    }


    /**
     * Observe changes on the official aliases
     * @param update {@link OfficialAliassesListener}
     */
    public onOfficialAliasesUpdate(onUpdate: TableListener) {
        this.backend.onOfficialAliasesUpdate(onUpdate);
    }

    /**
     * Retrieve the current blacklist
     * @returns Promise of {@link Table<string>}
     */
    public async getAliasSuggestions(): Promise<Table<string>> {
        let table = this.backend.getAliasSuggestions();
        return table;
    }


    /**
     * Observe changes on the official aliases
     * @param update {@link OfficialAliassesListener}
     */
    public onAliasSuggestionsUpdate(onUpdate: TableListener) {
        this.backend.onAliasSuggestionsUpdate(onUpdate);
    }

    /**
     * Add an Action the user made to the action table.
     * This does not execute the action, the user may delete the action.
     * If the user deletes the action, then {@link onRemove} is called.
     * 
     * @param action The {@link Action} to be executed.
     * @param onRemove An {@link Action} to be executed if the change is aborted.
     * @param category The category as {@link string} where the action was created.
     * @param description The resulting effect of the action as {@link string} to inform the user
     * @param metadata The by the action affected data as Key-Value-Object to inform the user.
     */
    public addChange(action: Action, onRemove: Action, category: string, description: string, metadata: Object) {
        this.changes.add(new ChangeAction(action, onRemove, metadata, category, description));
    }

    /**
     * Perform the previously by {@link addChange} added Action.
     * Removes the action from the table.
     * 
     * @param time The time the change was made as {@link string}
     * @param category The category of the action as {@link string}
     * @param description The description of the action as {@link string}
     * @param metadata The metadata as Key-Value-Object of this action
     * @returns {@code true} if the change could be performed.
     */
    public async performChange(time: string, category: string, description: string, metadata: Object): Promise<boolean> {
        return this.changes.perform(new Date(time), category, description, metadata);
    }

    /**
     * Remove the previously by {@link addChange} added Action.
     * Does not execute the action, but executes the onRemove action added by {@link addChange}.
     * 
     * @param time The time the change was made as {@link string}
     * @param category The category of the action as {@link string}
     * @param description The description of the action as {@link string}
     * @param metadata The metadata as Key-Value-Object of this action
     * @returns {@code true} if the change could be removed.
     */
    public async removeChange(time: string, category: string, description: string, metadata: Object): Promise<boolean> {
        return this.changes.removeByData(new Date(time), category, description, metadata);
    }

    /**
     * Retrieve the current changes
     * @returns Promise of {@link Table<string>}
     */
    public getChanges(): Table<string> {
        return this.changes.getChangesTable();
    }

    /**
     * Observe changes on the changes
     * @param update {@link BlacklistListener}
     */
    public onChangesUpdate(onUpdate: ChangesListener) {
        this.changes.addListener(onUpdate);
    }

    public async login() {
        await this.backend.login();
    }

    public async logout() {
        await this.backend.logout();
    }

    public onAuthenticationUpdate(onUpdate: AuthenticationListener) {
        this.backend.addAuthenticationListener(onUpdate);
    }

    public isAuthenticated(): boolean {
        return this.backend.isAuthenticated();
    }

    public redirectAfterLogin() {
        this.backend.redirectAfterLogin();
    }

    public redirectAfterLogout() {
        this.backend.redirectAfterLogout();
    }

    private notifyError(error: string) {
        this.errorListener.forEach(listener => listener(error));
    }

    public onError(onError: (error: string) => void) {
        this.errorListener.add(onError);
    }
}