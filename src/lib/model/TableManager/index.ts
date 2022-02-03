/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Sorter } from "$lib/model/table/Types"
import { Table, TableCell, TableData, TableDataComponent, TableRow, TitleCell, TitleRow } from "$lib/model/table/TableComponents";
import Action from "$lib/components/table_actions/Action.svelte";
import lodash from "lodash";
import type { ToDisplayData } from "./ToDisplayData";

/**
 * A listener to get notified on table updates.
 */
export type TableListener = (table: Table<string>) => void;

// A rudimentary implementation to sort the table lexicographically
export const lexicographicSorter: Sorter<TableRow<string>> = (a: TableRow<string>, b: TableRow<string>) => {
    if (a.getData()[0] > b.getData()[0]) {
        return [b,a]
    } else {
        return [a, b]
    }
};

/**
 * This class represents a base class to manage a {@link Table Table<string>} with the possibility to update and change values.
 * Allows the notification of listeners on updates and enables to add user events on click of a button with custom behavior.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export abstract class TableManager<T extends ToDisplayData> {

    private table: Table<string>;
    private data: T[];
    private title: T;
    private sorters: Map<string, Sorter<TableRow<string>>>;
    private actions: {onClick: (entry: T) => (() => void)[], text: string}[];
    private actionTitle: string;
    private listeners: Set<TableListener> = new Set();

    /**
     * Construct a new table with initial values.
     * The titles and every entry of data have to match their length, as they define the number of columns.
     * @param title The titles of each column.
     * @param data The displayable data the table should be initiated with.
     * @param sorters The sorting algorithm used to sort the columns by.
     * @param actions   An object containing the actions and the title for the column. The actions are an array of objects,
     *                  containing an array of onClick-functions and a text to display the action.
     */
    public constructor(
        title: T, 
        data?: T[],
        sorters?: Map<string, Sorter<TableRow<string>>>,
        actions?: {actions: {onClick: (entry: T) => (() => void)[], text: string}[], title: string}) {

        if (!this.checkMatchingColumns(data, title)) {
            throw new Error("There has to be a title for every entry of data.toDisplayData");
        }

        this.title = title;
        this.data = data;
        this.sorters = new Map(sorters);
        this.actions = actions.actions;
        this.actionTitle = actions.title;
        this.table = this.createTable();
    }

    private checkMatchingColumns(data: T[], title: T): boolean {
        if (!data) {
            return true;
        }
        return data.filter((entry: T) => entry.toDisplayData().length != title.toDisplayData().length) !== undefined;
    }

    /**
     * Convert the given data to a {@link Table<string>}.
     * @returns {@link Table<string>}
     */
    private createTable(): Table<string> {
        let table = new Table<string>();
        
        // Set the title row
        table.setTitle(new TitleRow<string>().add(
            ...this.title.toDisplayData().map(
                title => new TitleCell<string>(this.sorters.get(title)).set(new TableData<string>(title))
            )
        ));

        // Add a column for actions if wanted.
        if (this.actions && this.actions.length > 0) {
            table.setTitle(table.getTitle().add(new TitleCell<string>().set(new TableData<string>(this.actionTitle))))
        }

        // If data is present ...
        if (this.data) {

            // ... then add each data entry as row
            table.add(
                ...this.data.map(entry => this.buildRow(entry))
            );
        }
        return table;
    }

    /**
     * Builds a table row according to the given element.
     * @param entry The entry to embed into a table row
     * @returns The table row build from entry
     */
    private buildRow(entry: T): TableRow<string> {
        const data = lodash.cloneDeep(entry.toDisplayData());

        // Build the row containing the displayData specified by ToDisplayData::toDisplayData ...
        const row = new TableRow<string>().add(...data.map(
            (datum: string) => {
                
                // ... in normal data cells ...
                return new TableCell<string>().add(new TableData<string>(datum))
            }
        ));

        // ... and if actions are specified ...
        if (this.actions && this.actions.length > 0) {

            // ... append those actions in an Action component inside the table data ...
            row.add(new TableCell<string>().add(
                ...this.actions.map(action => {
                    return new TableDataComponent<string>((root, props: {index, crawlOnView}) => {
                        return new Action({
                                    
                            // ... and giving the respective parameters.
                            target: root,
                            props: {
                                onClick: action.onClick(entry),
                                text: action.text,
                                ...props
                            }
                        })
                    })
                })
            ))
        }
        return row;
    }

    /**
     * Notify the listeners listening on table changes
     */
    private notify() {
        this.listeners.forEach(listener => listener(this.getTable()));
    }

    /**
     * Set the Data of the table accordingly.
     * The titles has to match to a column and all data entries have to match to a column.
     * @param data {@code string[]} the data to display
     */
    public setData(data: T[]) {
        if (!this.checkMatchingColumns(data, this.title)) {
            throw new Error("There has to be a title for every entry of data.toDisplayData");
        }
        this.data = data;
        this.table = this.createTable();
        this.notify();
    }

    /**
     * Add data to the table.
     * The titles and every entry of data have to match their length, as they define the number of columns.
     * @param data The data to be added.
     */
    public addData(...data: T[]) {
        if (!this.checkMatchingColumns(data, this.title)) {
            throw new Error("There has to be a title for every entry of data.toDisplayData");
        }
        this.table.add(...data.map(this.buildRow));
        this.notify();
    }

    /**
     * Remove the given entries from the table.
     * @param entry The entries: {@code string[]} to be removed
     */
    public removeData(...data: T[]) {
        data.forEach(entry => {
            let index = this.data.indexOf(entry);
            if (index >= 0) {
                this.data.splice(index, 1);
                this.table.remove(index);
            }
        });
        this.notify();
    }

    /**
     * Add a listener to be called when changes happen.
     * @param listener {@link TableListener}
     */
    public addListener(listener: TableListener) {
        this.listeners.add(listener);
    }

    /**
     * Remove the given listener.
     * @param listener {@link TableListener}
     */
    public removeListener(listener: TableListener) {
        this.listeners.delete(listener);
    }

    /**
     * Getter for the table representation.
     * @returns {@link Table<string>}
     */
    public getTable(): Table<string> {
        return this.table;
    }

    /**
     * Hide the given entries to be not displayed.
     * Does not delete the entries.
     * 
     * @param data T[]
     */
    public hide(...data: T[]) {
        let notifyObserver: boolean = false;
        data.forEach(entry => {
            let index = this.data.indexOf(entry);
            console.log(index, entry);
            console.log(this.data, this.table);
            if (index >= 0) {
                this.table.getChilds()[index].hide();
                notifyObserver = true;
            }
        });
        if (notifyObserver) {
            this.notify();
        }
    }

    /**
     * Show the given entries if they were hidden.
     * Does not add entries.
     * 
     * @param data T[]
     */
    public show(...data: T[]) {
        let notifyObserver: boolean = false;
        data.forEach(entry => {
            let index = this.data.indexOf(entry);
            if (index > 0) {
                this.table.getChilds()[index].show();
                notifyObserver = true;
            }
        });
        if (notifyObserver) {
            this.notify();
        }
    }
}