import { Changes } from "$lib/model/Changes";
import type { ChangesListener } from "$lib/model/Changes";
import type { Table } from "$lib/model/table/TableComponents"
import { Backend } from "../backend";
import type { AuthenticationListener } from "../backend";
import type { Action } from "$lib/model/Changes/Action";
import { ChangeAction } from "$lib/model/Changes/ChangeAction";
import type { TableDisplayInformation } from "$lib/model/TableManager/TableDisplayInformation";
import { Tables } from "$lib/model/tables";
import type { DataObject } from "$lib/model/table/DataObject";
import { ErrorQueue } from "$lib/model/error/ErrorQueue";


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
    private errors: ErrorQueue;

    private errorListener: Set<(error: string | Error) => void>;

    /**
     * Construct the framework.
     * Private due to being a singleton.
     */
    private constructor() {
        this.errors = new ErrorQueue();
        this.backend = new Backend({
                loginRedirectURI: new URL(`${window.location.origin}/admin`),
                logoutRedirectURI: new URL(`${window.location.origin}/admin`),
                settings: {
                    authority: "https://oidc.scc.kit.edu/auth/realms/kit/",
                    client_id: "pse-itermori-de",
                    redirect_uri: `${window.location.origin}/admin/login`,
                    response_type: "code",
                    scope: "openid profile email",
                    automaticSilentRenew: true
                }
            },
            (error) => this.errors.addError(error));
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

    public getTableDisplayInformation(table: Tables): TableDisplayInformation<string, Table<string>> {
        if (table === Tables.CHANGES) {
            return {
                supplier: () => this.changes.getTable(),
                updater: (listener) => this.changes.addListener(listener),
                filterableData: () => this.changes.filterableData()
            }
        }
        return this.backend.getTableDisplayInformation(table);
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
    public addChange(action: Action, onRemove: Action, category: string, description: string, metadata: DataObject<string>) {
        this.changes.add(new ChangeAction(action, onRemove, metadata, category, description));
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

    public onError(onError: (error: Array<Error | string>) => void) {
        this.errors.addListener(onError);
    }

    public removeError(error: Error | string) {
        this.errors.removeError(error);
    }
}