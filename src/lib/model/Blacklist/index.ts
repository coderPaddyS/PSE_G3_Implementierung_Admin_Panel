/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Sorter } from "$lib/model/table/Types"
import { Table, TableCell, TableData, TableDataComponent, TableRow, TitleCell, TitleRow } from "$lib/model/table/TableComponents";
import Action from "$lib/components/table_actions/Action.svelte";
import { Framework } from "$lib/controller/framework";
import lodash from "lodash";

export type BlacklistListener = (blacklist: Table<string>) => void;

/**
 * This class represents the blacklist.
 * It is a two-column table, of which the first one contains the relevant data of the blacklist.
 * The second column contains an action to remove the entries from the blacklist.
 * 
 * @author Patrick Schneider
 * @version 0.5
 */
export class Blacklist {

    private table: Table<string>;
    private data: string[];

    // A rudimentary implementation to sort the table lexicographically
    private sorter: Sorter<TableRow<string>> = (a: TableRow<string>, b: TableRow<string>) => {
        if (a.getData()[0] > b.getData()[0]) {
            return [b,a]
        } else {
            return [a, b]
        }
    };
    private listeners: Set<BlacklistListener> = new Set();

    /**
     * Convert the given data to a {@link Table<string>}.
     * @param data A {@code string[]} containing the data.
     * @returns {@link Table<string>}
     */
    private fromArray(data: string[]): Table<string> {
        let table = new Table<string>();

        // Set the title row
        table.setTitle(new TitleRow<string>().add(
            new TitleCell<string>(this.sorter).set(new TableData<string>("Eintrag")),
            new TitleCell<string>().set(new TableData<string>("Aktionen"))
        ));

        // If data is present
        if (data) {

            // Add the data by mapping each entry (datum) to a TableRow
            // and then adding them in order to the table
            table.add(...data.map((datum: string) => {
                return new TableRow<string>().add(
                    
                    // The cell containing the datum
                    new TableCell<string>().add(new TableData<string>(datum)),

                    // The cell containing the remove action matching this datum
                    new TableCell<string>().add(new TableDataComponent((root, props: {index, crawlOnView}) => {
                        return new Action({
                            target: root,
                            props: {
                                onClick: [
                                    (entry: string[], metadata: Object) => {
                                        Framework.getInstance().addChange(() => {this.removeEntry(entry[0]); return true;}, 
                                        () => {this.show(entry[0]); return true;}, 
                                        "Blacklist", 
                                        "Löschen", 
                                        metadata)
                                    },
                                    (entry: string[], metadata: Object) => this.hide(entry[0])
                                ],
                                text: "Löschen",
                                ...props
                            }
                        })
                    }))
                )
            }));
        }
        return table;
    }

    /**
     * Notify the listeners listening on blacklist changes
     */
    private notify() {
        this.listeners.forEach(listener => listener(this.getTable()));
    }

    /**
     * Create the blacklist and set its data accordingly.
     * Copies the data, changes will not be reflected.
     * @param data If provided sets the data of the table. 
     */
    public constructor(data?: string[]) {
        this.data = data;
        this.table = this.fromArray(lodash.cloneDeep(data));
    }

    /**
     * Set the Data of the table accordingly.
     * Creates a deep copy of the given data, therefore external changes are not reflected.
     * @param data {@code string[]} the data to display
     */
    public setData(data: string[]) {
        this.table = this.fromArray(lodash.cloneDeep(data));
        this.data = data;
        this.notify();
    }

    /**
     * Remove the given entries from the blacklist.
     * @param entry The entries: {@code string[]} to be removed
     */
    public removeEntry(...entry: string[]) {
        this.data = this.data.filter(e => !entry.includes(e));
        this.table = this.fromArray(this.data);
        this.notify();
    }

    /**
     * Add a listener to be called when changes happen.
     * @param listener {@link BlacklistListener}
     */
    public addListener(listener: BlacklistListener) {
        this.listeners.add(listener);
    }

    /**
     * Remove the given listener.
     * @param listener {@link BlacklistListener}
     */
    public removeListener(listener: BlacklistListener) {
        this.listeners.delete(listener);
    }

    /**
     * Getter for the table representation of the blacklist.
     * @returns {@link Table<string>}
     */
    public getTable(): Table<string> {
        return this.table;
    }

    /**
     * Hide the given entry to be not displayed.
     * Does not delete the entry.
     * 
     * @param data string
     */
    public hide(data: string) {
        let notifyObserver: boolean = false;
        this.table.getChilds().forEach((row) => {
            if (row.getData()[0] == data) {
                row.hide();
                notifyObserver = true;
            }
        });
        if (notifyObserver) {
            this.notify();
        }
    }

    /**
     * Show the given entry if it was hidden.
     * Does not add an entry.
     * 
     * @param data string
     */
    public show(data: string) {
        this.table.getChilds().forEach(row => {
            if (row.getData()[0] == data) {
                row.show();
            }
        })
        this.notify();
    }
}