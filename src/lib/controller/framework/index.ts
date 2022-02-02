import type { Blacklist, BlacklistListener } from "$lib/model/Blacklist";
import { Changes } from "$lib/model/Changes";
import type { ChangesListener } from "$lib/model/Changes";
import type { Table } from "$lib/model/table/TableComponents"
import { Backend } from "../backend";
import type { Action } from "$lib/model/Changes/Action";
import { ChangeAction } from "$lib/model/Changes/ChangeAction";


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

    /**
     * Construct the framework.
     * Private due to being a singleton.
     */
    private constructor() {
        this.backend = new Backend();
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
     * Retrieve the current blacklist
     * @returns Promise of {@link Table<string>}
     */
    public async getBlacklist(): Promise<Table<string>> {
        let table = this.backend.getBlacklist();
        return table;
    }

    /**
     * Remove the given entry from the blacklist.
     * @param entry {@link string}
     */
    public async removeFromBlacklist(entry: string) {
        this.backend.removeFromBlacklist(entry);
    }

    /**
     * Observe changes on the backend
     * @param update {@link BlacklistListener}
     */
    public onBlacklistUpdate(onUpdate: BlacklistListener) {
        this.backend.onBlacklistUpdate(onUpdate);
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
    public performChange(time: string, category: string, description: string, metadata: Object): boolean {
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
    public removeChange(time: string, category: string, description: string, metadata: Object): boolean {
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
}