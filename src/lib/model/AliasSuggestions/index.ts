/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Alias } from "../Alias";
import { Table, TableCell, TableData, TableDataComponent, TableRow, TitleCell, TitleRow } from "../table/TableComponents";
import type { Sorter } from "../table/Types";
import Action from "$lib/components/table_actions/Action.svelte";
import { Framework } from "$lib/controller/framework";
import lodash from "lodash";

export type AliasSuggestionsListener = (table: Table<string>) => void;

/**
 * This class represents the official aliasses.
 * 
 * @author Patrick Schneider
 * @version 0.0.1
 */
export class AliasSuggestions {
    protected data: Alias[];
    protected table: Table<string>;
    protected listeners: Set<AliasSuggestionsListener>;

    // A rudimentary implementation to sort the table lexicographically
    private sorter: Sorter<TableRow<string>> = (a: TableRow<string>, b: TableRow<string>) => {
        if (a.getData()[0] > b.getData()[0]) {
            return [b,a]
        } else {
            return [a, b]
        }
    };


    /**
     * Create the blacklist and set its data accordingly.
     * Copies the data, changes will not be reflected.
     * @param data If provided sets the data of the table. 
     */
     public constructor(data?: Alias[]) {
        this.data = data;
        this.table = this.fromArray(lodash.cloneDeep(data));
        this.listeners = new Set();
    }

    /**
     * Convert the given data to a {@link Table<string>}.
     * @param data A {@code string[]} containing the data.
     * @returns {@link Table<string>}
     */
     private fromArray(data: Alias[]): Table<string> {
        let table = new Table<string>();

        // Set the title row
        table.setTitle(new TitleRow<string>().add(
            new TitleCell<string>(this.sorter).set(new TableData<string>("Vorschlag")),
            new TitleCell<string>(this.sorter).set(new TableData<string>("Gebäude")),
            new TitleCell<string>(this.sorter).set(new TableData<string>("Raum")),
            new TitleCell<string>(this.sorter).set(new TableData<string>("Aktionen")),
        ));

        // If data is present
        if (data) {

            // Add the data by mapping each entry (datum) to a TableRow
            // and then adding them in order to the table
            table.add(...data.map((alias: Alias) => {
                return new TableRow<string>().add(
                    
                    // The cell containing the datum
                    new TableCell<string>().add(new TableData<string>(alias.getName())),
                    new TableCell<string>().add(new TableData<string>(alias.getBuilding())),
                    new TableCell<string>().add(new TableData<string>(alias.getRoom())),

                    // The cell containing the remove action matching this datum
                    new TableCell<string>().add(new TableDataComponent((root, props: {index, crawlOnView}) => {
                        return new Action({
                            target: root,
                            props: {
                                onClick: [
                                    () => {
                                        Framework.getInstance().addChange(() => {this.removeEntry(alias); return true;}, 
                                        () => {this.show(alias); return true;}, 
                                        "Alias-Vorschläge", 
                                        "Löschen", 
                                        this.table.matchData(alias.asArrayWithoutId()))
                                    },
                                    () => this.hide(alias)
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

    private notify() {
        this.listeners.forEach(listener => listener(this.table));
    }

    public removeEntry(alias: Alias) {
        let index: number = this.data.indexOf(alias);
        this.data.splice(index, 1);
        this.table.remove(index);
        this.notify();
    }

    public show(alias: Alias) {
        this.table.getChilds().forEach(row => {
            if (lodash.isEqual(row.getData(), alias.asArrayWithoutId())) {
                row.show();
            }
        })
        this.notify();
    }

    public hide(alias: Alias) {
        let notifyObserver: boolean = false;
        this.table.getChilds().forEach((row) => {
            if (lodash.isEqual(row.getData(), alias.asArrayWithoutId())) {
                row.hide();
                notifyObserver = true;
            }
        });
        if (notifyObserver) {
            this.notify();
        }
    }

    /**
     * Set the Data of the table accordingly.
     * Creates a deep copy of the given data, therefore external changes are not reflected.
     * @param data {@code string[]} the data to display
     */
    public setData(data: Alias[]) {
        this.table = this.fromArray(lodash.cloneDeep(data));
        this.data = data;
        this.notify();
    }

    public getTable(): Table<string> {
        return this.table;
    }

    public addListener(update: AliasSuggestionsListener) {
        this.listeners.add(update);
    }
}