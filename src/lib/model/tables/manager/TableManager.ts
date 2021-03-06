/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Sorter, DataObject, Predicate } from "$lib/model/recursive_table/Types"
import { Table, TableCell, TableData, TableDataComponent, TableDataTable, TableRow, TitleCell, TitleRow } from "$lib/model/recursive_table/TableComponents";
import type { ComponentFactory } from "$lib/model/recursive_table/TableComponents";
import lodash from "lodash";
import type { ToDisplayData } from "./ToDisplayData";
import type { FilterStrategy } from "./filter/FilterStrategy";
import type { TableDisplayInformation } from "./TableDisplayInformation";
import type { Listener } from "$lib/model/Listener";
import { Observable } from "$lib/model/Listener";

/**
 * A function to produce a component which can perform actions.
 */
export type ActionComponentFactory = (onClick: (() => void)[], text: string) => ComponentFactory;

/**
 * Producer for a lexicographical sorter given an index.
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
 * Producer for a numeric sorter given an index.
 * @param index The index of the column to sort by
 * @returns Sorter<TableRow<string>> which sorts numerically
 */
export const numericSorter: (index: number) => Sorter<TableRow<string>> = 
    index => {
        return (a: TableRow<string>, b: TableRow<string>) => {
            if (Number(a.getData()[index]) < Number(b.getData()[index])) {
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
    private table: Observable<Table<string>>;
    private data: R[];
    private dataToBeAdded: R[];
    private title: T;
    private sorters: Map<string, Sorter<TableRow<string>>>;
    private actionFactory: ActionComponentFactory = undefined;
    private actions: {onClick: (entry: R) => (() => void)[], text: string}[];
    private actionTitle: string;
    private listeners: Set<Listener<Table<string>>> = new Set();
    private showEntry: Predicate<DataObject<string>>;

    /**
     * Construct a new table with initial values.
     * The titles and every entry of data have to match their length, as they define the number of columns.
     * @param title The titles of each column.
     * @param data The displayable data the table should be initiated with.
     * @param sorters The sorting algorithm used to sort the columns by.
     * @param actions   An object containing the actions and the title for the column. The actions are an array of objects,
     *                  containing an array of onClick-functions and a text to display the action.
     * @param showEntry A predicate which is executed on any new element to decide whether it gets shown or not.
     */
    public constructor(
        name: string,
        title: T, 
        data?: R[],
        sorters?: Map<string, Sorter<TableRow<string>>>,
        actions?: {actions: {onClick: (entry: R) => (() => void)[], text: string}[], title: string},
        showEntry?: Predicate<DataObject<string>>) {

        if (!this.checkMatchingColumns(data, title)) {
            throw new Error("There has to be a title for every entry of data.toDisplayData");
        }
        this.title = title;
        this.data = [];
        this.dataToBeAdded = data ? data : [];
        this.sorters = new Map(sorters);
        this.actions = actions? actions.actions : undefined;
        this.actionTitle = actions? actions.title : undefined;
        this.table = new Observable(undefined);
        this.name = name;
        this.showEntry = showEntry;
        this.createTable();
        this.table.setNotificationInterceptor(table => lodash.cloneDeep(table))
    }

    private checkMatchingColumns(data: R[], title: T): boolean {
        if (!data || data.length == 0) {
            return true;
        }
        let matches = true;
        data.forEach((entry: R) => {
            if (entry) {
                matches = matches && entry.toDisplayData().length == title.toDisplayData().length
            } else {
                matches = undefined;
            }
        });
        return matches;
    }

    /**
     * Convert the given data to a {@link Table<string>} and updates the table.
     */
    private createTable()    {
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
            table.add(...this.data.map(entry => this.buildRow(entry)));
        }
        this.table.set(table);
    }

    /**
     * Builds a table row according to the given element.
     * @param entry The entry to embed into a table row
     * @returns The table row build from entry
     */
    private buildRow(entry: R): TableRow<string> {
        const data: (string | DataObject<string>)[] = lodash.cloneDeep(entry.toDisplayData());
        let isNormal = true;

        // Build the row containing the displayData specified by ToDisplayData::toDisplayData ...
        const row = new TableRow<string>().add(...data.map(
            (datum) => {

                let cell = new TableCell<string>();

                if (typeof datum === 'string') {
                    cell.add(new TableData<string>(datum));
                } else {
                    isNormal = false;
                    cell.add(new TableDataTable<string>(new Table<string>().rowsFromObject(datum)));
                }
                
                // ... in normal data cells ...
                return cell;
            }
        ));

        // ... and if actions are specified ...
        if (this.actions && this.actions.length > 0 && this.actionFactory) {

            // ... append those actions in an Action component inside the table data ...
            row.add(new TableCell<string>().add(
                ...this.actions.map(action => {
                    return new TableDataComponent<string>(this.actionFactory(action.onClick(entry), action.text));
                })
            ))
        }

        if (this.showEntry && isNormal && !this.showEntry(this.table.get().matchData(data as string[]))) {
            row.hide();
        }

        return row;
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
        this.dataToBeAdded = [];
        this.data = data;
        this.createTable();
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
    }

    /**
     * Remove the given entries from the table.
     * @param entry The entries: {@code string[]} to be removed
     */
    protected removeData(...data: R[]) {
        if (!data) {
            return;
        }
        let [indices, remaining] = this.getIndices(this.data, data);
        indices.sort((a, b) => b - a).forEach(index => this.data.splice(index, 1));

        [indices,] = this.getIndices(this.dataToBeAdded, remaining);
        indices.sort((a, b) => b - a).forEach(index => this.dataToBeAdded.splice(index, 1));

        this.updateTable();
    }

    /**
     * Add a listener to be called when changes happen.
     * @param listener {@link Listener Listener<Table<string>>}
     */
    public addListener(listener: Listener<Table<string>>) {
        this.table.add(listener);
    }

    /**
     * Remove the given listener.
     * @param listener {@link Listener Listener<Table<string>>}
     */
    public removeListener(listener: Listener<Table<string>>) {
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
        this.updateTable();

        return this.table.get();
    }

    private updateTable() {
        this.data.push(...this.dataToBeAdded);
        this.dataToBeAdded = [];
        this.createTable();
    }

    /**
     * Getter for the table without updating the data by fetching it.
     * @returns Table<string>
     */
    protected getTableWithoutFetch(): Table<string> {
        return this.table.get();
    }

    private getIndices(source: R[], toFind: R[]): [number[], R[]] {
        let indices = [];
        let remaining = toFind;

        source.forEach((entry, index) => {
            for (let i = remaining.length; i >= 0; i--) {
                if (lodash.isEqual(remaining[i], entry)) {
                    indices.push(index);
                    remaining.splice(i, 1);
                    break;
                }
            }
        });

        return [indices, remaining];
    }

    /**
     * Hide the given entries to be not displayed.
     * Does not delete the entries.
     * 
     * @param data R[]
     */
    public hide(...data: R[]) {
        if (!data) {
            return;
        }
        this.updateTable();
        this.table.update(table => {
            data.forEach(entry => {
                let indices: Array<number> = [];
                this.data.forEach((datum, index) => {
                    if (lodash.isEqual(entry, datum)) {
                        indices.push(index);
                    }
                })
                indices.forEach((index) => {
                    table.getChildren()[index].hide();
                })
            });
            
            return table;
        });
    }

    /**
     * Show the given entries if they were hidden.
     * Does not add entries.
     * 
     * @param data R[]
     */
    public show(...data: R[]) {
        if (!data) {
            return;
        }
        this.table.update(table => {
            data.forEach(entry => {
                let indices: Array<number> = [];
                this.data.forEach((datum, index) => {
                    if (lodash.isEqual(entry, datum)) {
                        indices.push(index);
                    }
                })
                indices.forEach((index) => {
                    table.getChildren()[index].show();
                })
            });
            return table;
        });
    }

    /**
     * A method to check if the given entry is contained in this manager.
     * @param entry R
     * @returns true if contained
     */
    public contains(entry: R): boolean {
        return this.data.filter(e => lodash.isEqual(entry, e)).length > 0 
            || this.dataToBeAdded.filter(e => lodash.isEqual(entry, e)).length > 0;
    }

    /**
     * Filter the data in this manager by the given predicate.
     * @param predicate A predicate which accepts the entry, its index and the whole array as parameters.
     * @returns All entries for which {@code predicate} evaluates as true
     */
    protected filter(predicate: (value: R, index?: number, array?: R[]) => boolean): R[] {
        return [...this.data.filter(predicate), ...this.dataToBeAdded.filter(predicate)];
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