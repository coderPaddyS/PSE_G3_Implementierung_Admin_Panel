import { readable, writable, get } from "svelte/store";
import type { Writable, Readable } from "svelte/store";
import { cloneDeep } from "lodash"

export enum eTableData {
    Table = "table",
    TitleRow = "titlerow",
    Row = "row",
    Cell = "cell"
}

export interface Filterable {
    filterable: boolean
}

export interface iTableData extends Filterable {
    data: any;
}

export interface iTableComponent extends Filterable {
    comp: eTableData;
    data: any[];
}

export interface iTable extends iTableComponent {
    comp: eTableData.Table;
    data: iTableRow[];
}

export interface iTableRow extends iTableComponent {
    comp: eTableData;
    data: iTableCell[];
}

export interface iTableCell extends iTableComponent {
    comp: eTableData.Cell;
    data: any[];
}

export class Table implements iTable {
    comp: eTableData.Table = eTableData.Table;
    data: iTableRow[];
    filterable: boolean = true;

    public constructor() {
        this.data = new Array();
    }

    public add(...entry: iTableRow[]) : Table {
        this.data.push(...entry);
        return this;
    }
}

export class Row implements iTableRow {
    comp: eTableData = eTableData.Row;
    data: iTableCell[];
    filterable: boolean = true;

    public constructor() {
        this.data = new Array();
    }

    public add(...entry: iTableCell[]) : Row {
        this.data.push(...entry);
        return this;
    }
}

export class TitleRow implements iTableRow{
    comp: eTableData = eTableData.TitleRow;
    data: iTableCell[];
    filterable: boolean = false;

    public constructor() {
        this.data = new Array();
    }

    public add(...entry: iTableCell[]) : TitleRow {
        this.data.push(...entry);
        return this;
    }
}

export class Cell implements iTableCell {
    comp: eTableData.Cell = eTableData.Cell;
    data: [TableData] | [Table];
    filterable: boolean = true;

    public constructor(entry: TableData | Table) {
        this.data = [entry];
    }
}

export class TableData implements iTableData {
    data: any;
    filterable: boolean = true;

    public constructor(data: any) {
        this.data = data
    }
}

type Predicate<T> = (t: T) => boolean;
type Function<T> = (t: T) => void;

export let data: Writable<Table> = writable();
export let tableDisplayData: Writable<iTableComponent> = writable();
export let dataFilter: Writable<(a: TableData) => boolean> = writable();
export let sorter: Writable<(a: Row, b: Row) => number> = writable();

data.subscribe(t => {
    if (t && get(dataFilter)) {
        updateDisplayData(t, get(dataFilter))
    }
});

dataFilter.subscribe((filter) => {
    if (get(data) && filter) {
        updateDisplayData(get(data), filter);
    }
})

function updateDisplayData(table: iTable, filter: Predicate<TableData>) {
    let displayData: Table = cloneDeep(get(data)); 
    let crawler = new TableFilterCrawler(filter);
    displayData = crawler.crawlTable(crawler, displayData);
    tableDisplayData.set(displayData);
}

class TableFilterCrawler {

    private filter: Predicate<iTableData>;

    public constructor(filter: Predicate<iTableData>) {
        this.filter = filter;
    }

    public crawlData<T extends iTableData>(crawler: TableFilterCrawler, data: T): T {
        console.log(crawler.filter(data))
        if (crawler.filter(data)) {
            return data;
        }
        return undefined;
    }

    public crawlCell<T extends iTableCell>(crawler: TableFilterCrawler, cell: T): T {
        let filtered = cell.data.map((child) => {
            if (child.comp) {
                return crawler.crawlTable(crawler, child);
            }
            return crawler.crawlData(crawler, child);
        });
        if (filtered.find(e => e !== undefined)) {
            return cell;
        }
        return undefined;
    }

    public crawlRow<T extends iTableRow>(crawler: TableFilterCrawler, row: T): T {
        let filtered = row.data
            .map(cell => crawler.crawlCell(crawler, cell))
            .filter(e => e !== undefined);
        if (filtered.length > 0) {
            return row;
        }
        return undefined
    }

    public crawlTable<T extends iTable>(crawler: TableFilterCrawler, table: T): T {
        
        let filtered: iTableComponent[] = [];
        table.data.forEach(row => {
            if (!row.filterable) {
                filtered.push(row);
            } else {
                let filteredRow = crawler.crawlRow(crawler, row);
                if (filteredRow !== undefined) {
                    filtered.push(filteredRow)
                }
            }
        })
        if (filtered.find(e => e !== undefined && e.filterable) !== undefined) {
            table.data = filtered;
            return table;
        }
        return undefined;
    }
}