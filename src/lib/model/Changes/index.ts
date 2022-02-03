/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { Table, TableCell, TableData, TableDataComponent, TableDataTable, TableRow, TitleCell, TitleRow } from "../table/TableComponents";
import type { ChangeAction } from "./ChangeAction";
import ActionPerformChange from "$lib/components/table_actions/ActionPerformChange.svelte";
import ActionRemoveAction from "$lib/components/table_actions/ActionRemoveAction.svelte";
import lodash from "lodash";

export type ChangesListener = (table: Table<string>) => void;

/**
 * This class represents the changes made by the current user.
 * Rather than immediately performing changes, changes are saved and performed later.
 * 
 * @author Patrick Schneider
 * @version 0.5
 */
export class Changes {
    private changes: Array<ChangeAction>;
    private table: Table<string>;
    private listeners: Set<ChangesListener>;

    /**
     * Create the changes.
     * Creates an empty table with title.
     */
    public constructor() {
        this.changes = new Array();
        this.listeners = new Set();
        this.table = new Table<string>().setTitle(
            new TitleRow<string>().add(
                new TitleCell<string>().set(new TableData<string>("Zeit")),
                new TitleCell<string>().set(new TableData<string>("Kategorie")),
                new TitleCell<string>().set(new TableData<string>("Aktion")),
                new TitleCell<string>().set(new TableData<string>("Änderung")),
                new TitleCell<string>().set(new TableData<string>("Aktionen"))
            )
        )
    }

    /**
     * Add a change action to be displayed
     * @param action {@link ChangeAction}
     */
    public add(action: ChangeAction);

    /**
     * Add change actions to be displayed.
     * @param actions {@link ChangeAction}
     */
    public add(...actions: ChangeAction[]) {
        this.changes.push(...actions);
        actions.forEach(action => {

            // Display the metadata of the action as table without title.
            // The key is displayed in the first column, the value in the second.
            let metadata: Table<string> = new Table<string>();
            Object.entries(action.getMetadata()).forEach(entry => {
                metadata.add(
                    new TableRow<string>().add(
                        new TableCell<string>().add(new TableData<string>(entry[0])),
                        new TableCell<string>().add(new TableData<string>(entry[1])),
                    )
                )
            })

            // Add the relevant data in cells into a row and add this row to the table
            this.table.add(
                new TableRow<string>().add(
                    new TableCell<string>().add(new TableData<string>(action.getCreationTime().toISOString())),
                    new TableCell<string>().add(new TableData<string>(action.getCategory())),
                    new TableCell<string>().add(new TableData<string>(action.getDescription())),
                    new TableCell<string>().add(new TableDataTable<string>(metadata)),

                    // Add the actions to interact with this change action into the last column
                    new TableCell<string>().add(
                        new TableDataComponent<string>((root, props: {index, crawlOnView}) => {
                            return new ActionPerformChange({
                                target: root,
                                props
                            })
                        }),
                        new TableDataComponent((root, props: {index, crawlOnView}) => {
                            return new ActionRemoveAction({
                                target: root,
                                props
                            })
                        })
                    )
                )
            )
        });
        this.notify();
    }

    /**
     * Removes a change action identified by its data.
     * 
     * 
     * @param time Date
     * @param category string
     * @param description string
     * @param metadata Key-Value-Object
     * @returns boolean `true` iff removal was successful, `false` if no matching action was found or the removal was not successful
     */
    public removeByData(time: Date, category: string, description: string, metadata: Object): boolean {
        let action = this.changes.filter(c => c.equals(time, category, description, metadata))[0];
        return action && this.remove(action) && action.remove();
    }

    /**
     * Removes the given {@link ChangeAction}.
     * Performs the onRemoval-Action.
     * 
     * @param action {@link ChangeAction} to be removed.
     * @returns boolean `true` iff removal was successful
     */
    public remove(action: ChangeAction): boolean {
        if (this.contains(action)) {
            let index = this.changes.indexOf(action);
            this.changes.splice(index, 1);
            this.table.remove(index);
            action.remove();
            this.notify();
            return true;
        }
        return false;
    }

    /**
     * Performs the action identified by the given data.
     * 
     * @param time Date
     * @param category string
     * @param description string
     * @param metadata Key-Value-Object
     * @returns boolean `true` iff action could perform and removed successfully
     */
    public perform(time: Date, category: string, description: string, metadata: Object): boolean {
        let action = this.changes.filter(c => c.equals(time, category, description, metadata))[0];
        return action && action.perform() && this.remove(action);
    }

    /**
     * Getter for all changes.
     * @returns An {@link Iterable} of {@link ChangeAction}
     */
    public getChanges(): Iterable<ChangeAction> {
        return this.changes;
    }

    /**
     * Getter for the changes in table-display.
     * @returns A {@link Table<string> Table<string>}
     */
    public getChangesTable(): Table<string> {
        return this.table;
    }

    /**
     * Checks if the given ChangeAction is contained in the changes.
     * @param action `True` iff contained
     */
    public contains(action: ChangeAction): boolean;

       /**
     * Checks if the given ChangeActions are contained in the changes.
     * @param actions `True` iff contained
     */
    public contains(...actions: ChangeAction[]): boolean {
        for (let action of actions) {
            if (!this.changes.includes(action)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks if a {@link ChangeAction} matching the given category and metadata is contained.
     * @param category string
     * @param metadata Key-Value-Object
     * @returns `True` if contained
     */
    public containsData(category: string, metadata: Object): boolean {
        return this.changes.filter(action => category == action.getCategory())
            .filter(action => lodash.isEqual(metadata, action.getMetadata()))
            .length > 0;
    }

    /**
     * Add a listener to be called when changes happen.
     * @param listener {@link ChangesListener}
     */
    public addListener(listener: ChangesListener) {
        this.listeners.add(listener);
    }

    /**
     * Remove the given listener when changes happen.
     * @param listener {@link ChangesListener}
     */
    public removeListener(listener: ChangesListener) {
        this.listeners.delete(listener);
    }

    /**
     * Notify all listeners.
     */
    private notify() {
        this.listeners.forEach(listener => listener(this.table));
    }
}