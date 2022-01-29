import type { Sorter } from "$lib/model/table/Types"
import { Table, TableCell, TableData, TableDataSvelteComponent, TableRow, TitleCell, TitleRow } from "$lib/model/table/TableComponents";
import ActionRemove from "$lib/components/table_actions/ActionRemove.svelte";

export type BlacklistListener = (blacklist: Table<string>) => void;

export class Blacklist {

    private table: Table<string>;
    private data: any[];
    // A rudimentary implementation to sort the table lexicographically
    private sorter: Sorter<TableRow<string>> = (a: TableRow<string>, b: TableRow<string>) => {
        if (a.data[0].data[0].data > b.data[0].data[0].data) {
            return [b,a]
        } else {
            return [a, b]
        }
    };
    private listeners: Set<BlacklistListener> = new Set();

    private fromArray(data: any[]): Table<string> {
        let table = new Table<string>();
        table.add(new TitleRow<string>().add(
            new TitleCell<string>(this.sorter).set(new TableData<string>("Eintrag")),
            new TitleCell<string>().set(new TableData<string>("Aktionen"))
        ));
        table.add(...data.map((datum: string) => {
            return new TableRow<string>().add(
                new TableCell<string>().add(new TableData<string>(datum)),
                new TableCell<string>().add(new TableDataSvelteComponent((root, props: {index, crawlOnView}) => {
                    return new ActionRemove({
                        target: root,
                        props: {
                            removeFromSource: (entry: string[]) => {this.removeEntry(entry[0])},
                            ...props
                        }
                    })
                }))
            )
        }));
        return table;
    }

    private updateListeners() {
        this.listeners.forEach(listener => listener(this.getTable()));
    }

    public constructor(data: any[]) {
        this.table = this.fromArray(data);
        this.data = data;
    }

    public setData(data: any[]) {
        this.table = this.fromArray(data);
        this.data = data;
        this.updateListeners();
    }

    public removeEntry(...entry: any[]) {
        this.data = this.data.filter(e => !entry.includes(e));
        this.table = this.fromArray(this.data);
        this.updateListeners();
    }

    public addListener(listener: BlacklistListener) {
        this.listeners.add(listener);
    }

    public removeListener(listener: BlacklistListener) {
        this.listeners.delete(listener);
    }

    public getTable(): Table<string> {
        return this.table;
    }
}