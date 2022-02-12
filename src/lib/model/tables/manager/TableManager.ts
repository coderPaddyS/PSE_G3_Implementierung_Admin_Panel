/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Sorter, DataObject } from "$lib/model/recursive_table/Types"
import { Table, TableCell, TableData, TableDataComponent, TableDataTable, TableRow, TitleCell, TitleRow } from "$lib/model/recursive_table/TableComponents";
import type { ComponentFactory } from "$lib/model/recursive_table/TableComponents";
import lodash from "lodash";
import type { ToDisplayData } from "./ToDisplayData";
import type { FilterStrategy } from "./filter/FilterStrategy";
import type { TableDisplayInformation } from "./TableDisplayInformation";

/**
 * A function to produce a component which can perform actions.
 */
export type ActionComponentFactory = (onClick: (() => void)[], text: string) => ComponentFactory;

/**
 * A listener to get notified on table updates.
 */
export type TableListener = (table: Table<string>) => void;

/**
 * Producer for a lexicograpical sorter given an index.
 * @param index The index of the column to sort by
 * @returns Sorter<TableRow<string>> which sorts lexicographically
 */
export const lexicographicSorter: (index: number) => Sorter<TableRow<string>> = 
    index => {
        return (a: TableRow<string>, b: TableRow<string>) => {
            if (a.getData()[index] > b.getData()[index]) {
                return [b,a]
            } else {
                return [a, b]
            }
        };
    }

/**
 * This class represents a base class to manage a {@link Table Table<string>} with the possibility to update and change values.
 * Allows the notification of listeners on updates and enables to add user events on click of a button with custom behavior.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export abstract class TableManager<R extends ToDisplayData, T extends ToDisplayData> {

    private name: string;
    private table: Table<string>;
    private data: R[];
    private dataToBeAdded: R[];
    private title: T;
    private sorters: Map<string, Sorter<TableRow<string>>>;
    private actionFactory: ActionComponentFactory = undefined;
    private actions: {onClick: (entry: R) => (() => void)[], text: string}[];
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
        name: string,
        title: T, 
        data?: R[],
        sorters?: Map<string, Sorter<TableRow<string>>>,
        actions?: {actions: {onClick: (entry: R) => (() => void)[], text: string}[], title: string}) {

        if (!this.checkMatchingColumns(data, title)) {
            throw new Error("There has to be a title for every entry of data.toDisplayData");
        }
        this.title = title;
        this.data = [];
        this.dataToBeAdded = data;
        this.sorters = new Map(sorters);
        this.actions = actions.actions;
        this.actionTitle = actions.title;
        this.table = this.createTable();
        this.name = name;
    }

    private checkMatchingColumns(data: R[], title: T): boolean {
        if (!data) {
            return true;
        }
        return data.filter((entry: R) => entry.toDisplayData().length != title.toDisplayData().length) !== undefined;
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
                title => new TitleCell<string>(this.sorters.get(title.toString())).set(new TableData<string>(title.toString()))
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
    private buildRow(entry: R): TableRow<string> {
        const data: (string | DataObject<string>)[] = lodash.cloneDeep(entry.toDisplayData());

        // Build the row containing the displayData specified by ToDisplayData::toDisplayData ...
        const row = new TableRow<string>().add(...data.map(
            (datum) => {

                let cell = new TableCell<string>();

                if (typeof datum === 'string') {
                    cell.add(new TableData<string>(datum));
                } else {
                    cell.add(new TableDataTable<string>(new Table<string>().rowsFromObject(datum)));
                }
                
                // ... in normal data cells ...
                return cell;
            }
        ));

        // ... and if actions are specified ...
        if (this.actions && this.actions.length > 0) {

            // ... append those actions in an Action component inside the table data ...
            row.add(new TableCell<string>().add(
                ...this.actions.map(action => {
                    return new TableDataComponent<string>(this.actionFactory(action.onClick(entry), action.text));
                })
            ))
        }
        return row;
    }

    /**
     * Notify the listeners listening on table changes
     */
    private notify() {
        this.listeners.forEach(listener => listener(this.table));
    }

    /**
     * Set the Data of the table accordingly.
     * The titles has to match to a column and all data entries have to match to a column.
     * @param data {@code string[]} the data to display
     */
    protected setData(data: R[]) {
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
    protected addData(...data: R[]) {
        if (!this.checkMatchingColumns(data, this.title)) {
            throw new Error("There has to be a title for every entry of data.toDisplayData");
        }
        this.dataToBeAdded.push(...data);
        this.notify();
    }

    /**
     * Remove the given entries from the table.
     * @param entry The entries: {@code string[]} to be removed
     */
    protected removeData(...data: R[]) {
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
     * @returns A {@link Table<string>}
     */
    public async getTable(): Promise<Table<string>> {
        await this.fetchData().then(data => {
            if (data) {
                this.setData(data)
            }
        });
        this.data.push(...this.dataToBeAdded)
        this.table.add(...this.dataToBeAdded.map(entry => this.buildRow(entry)));
        this.dataToBeAdded = [];

        return this.table;
    }

    /**
     * Getter for the table without updating the data by fetching it.
     * @returns Table<string>
     */
    protected getTableWithoutFetch(): Table<string> {
        return this.table;
    }

    /**
     * Hide the given entries to be not displayed.
     * Does not delete the entries.
     * 
     * @param data R[]
     */
    public hide(...data: R[]) {
        let notifyObserver: boolean = false;
        data.forEach(entry => {
            let indices: Array<number> = [];
            this.data.forEach((datum, index) => {
                if (lodash.isEqual(entry, datum)) {
                    indices.push(index);
                }
            })
            indices.forEach((index) => {
                this.table.getChildren()[index].hide();
                notifyObserver = true;
            })
        });
        if (notifyObserver) {
            this.notify();
        }
    }

    /**
     * Show the given entries if they were hidden.
     * Does not add entries.
     * 
     * @param data R[]
     */
    public show(...data: R[]) {
        let notifyObserver: boolean = false;
        data.forEach(entry => {
            let index = this.data.indexOf(entry);
            if (index > 0) {
                this.table.getChildren()[index].show();
                notifyObserver = true;
            }
        });
        if (notifyObserver) {
            this.notify();
        }
    }

    /**
     * A method to check if the given entry is contained in this manager.
     * @param entry R
     * @returns true if contained
     */
    public contains(entry: R): boolean {
        return this.data.includes(entry)
    }

    /**
     * Filter the data in this manager by the given predicate.
     * @param predicate A predicate which accepts the entry, its index and the whole array as parameters.
     * @returns All entries for which {@code predicate} evaluates as true
     */
    protected filter(predicate: (value: R, index?: number, array?: R[]) => boolean): R[] {
        return this.data.filter(predicate);
    }

    /**
     * Set the factory to produce the action components.
     * @param factory {@link ActionComponentFactory}
     */
    public setActionComponentFactory(factory: ActionComponentFactory) {
        this.actionFactory = factory;
    }

    /**
     * Getter for the {@link TableDisplayInformation}.
     * @returns The {@link TableDisplayInformation} of this table
     */
    public getTableDisplayInformation(): TableDisplayInformation<string, Table<string>> {
        return {
            supplier: () => this.getTable(),
            updater: (listener) => this.addListener(listener),
            filterableData: () => this.filterableData(),
            size: async () => this.size().then(size => size? size: this.data.length),
            tableTitle: () => this.name
        }
    }

    protected abstract fetchData(): Promise<R[]>;

    protected abstract size(): Promise<number>;

    public abstract filterableData(): [number, FilterStrategy<string>][];
}