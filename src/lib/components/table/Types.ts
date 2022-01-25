import type { Sorter } from "./Store"

export enum eTableData {
    Table = "table",
    TitleRow = "titlerow",
    Row = "row",
    Cell = "cell",
    TitleCell = "titlecell",
    Data = "data"
}

export interface Filterable {
    filterable: boolean
}

export interface iTableData extends iTableComponent {
    data: any;
}

export interface iTableComponent extends Filterable {
    comp: eTableData;
    data: any[];
    sorter?: Sorter<iTableRow>;
}

export interface iTable<R extends iTableRow> extends iTableComponent {
    data: R[];
}

export interface iTableRow extends iTableComponent {
    data: iTableCell[];
}

export interface iTableCell extends iTableComponent {
    data: any[];
}

export class Table<R extends iTableRow> implements iTable<R> {
    comp: eTableData = eTableData.Table;
    data: R[];
    filterable: boolean = true;

    public constructor() {
        this.data = new Array();
    }

    public add(...entry: R[]) : Table<R> {
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

export class TitleRow implements iTableRow {
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

export class TitleCell implements iTableCell {
    comp: eTableData = eTableData.TitleCell;
    data: [TableData];
    filterable: boolean = false;
    sorter?: Sorter<iTableRow>;

    public constructor(entry: TableData, sorter?: Sorter<iTableComponent>) {
        this.data = [entry]
        this.sorter = sorter;
    }
}

export class Cell<R extends iTableRow> implements iTableCell {
    comp: eTableData = eTableData.Cell;
    data: [TableData] | [Table<R>];
    filterable: boolean = true;

    public constructor(entry: TableData | Table<R>) {
        this.data = [entry];
    }
}

export class TableData implements iTableData {
    comp: eTableData = eTableData.Data;
    data: any;
    filterable: boolean = true;

    public constructor(data: any) {
        this.data = data
    }
}

// data.subscribe(t => {
//     if (t && get(dataFilter) && get(dataSorter)) {
//         updateDisplayData(t, get(dataFilter), get(dataSorter))
//     }
// });

// dataFilter.subscribe((filter) => {
//     if (get(data) && filter && get(dataSorter)) {
//         updateDisplayData(get(data), filter, get(dataSorter));
//     }
// })

// dataSorter.subscribe((dataSorter) => {
//     if (get(data) && get(dataFilter) && dataSorter) {
//         updateDisplayData(get(data), get(dataFilter), dataSorter);
//     }
// })

// function updateDisplayData<R extends iTableRow>(table: iTable<R>, filter: Predicate<TableData>, sorter: Sorter<R>) {
//     let displayData: iTable<R> = cloneDeep(get(data)); 
//     let filteringCrawler = new TableFilterCrawler<R>(filter);
//     displayData = filteringCrawler.crawlTable(filteringCrawler, displayData);
//     let sortingCrawler = new TableSortingCrawler<R>(sorter);
//     displayData = sortingCrawler.crawlTable(sortingCrawler, displayData);
//     tableDisplayData.set(displayData);
// }