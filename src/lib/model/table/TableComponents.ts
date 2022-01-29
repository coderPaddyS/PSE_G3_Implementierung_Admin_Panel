import type { SvelteComponent } from "svelte/internal";
import type { Sorter } from "./Types"
import { TableDataAdditions } from "./TableDataAdditions";

export type SvelteComponentFactory = (root: HTMLElement, props: Object) => SvelteComponent;

export enum eTableData {
    Table = "table",
    TitleRow = "titlerow",
    Row = "row",
    Cell = "cell",
    TitleCell = "titlecell",
    Data = "data"
}

export interface iTableData<T> {
    type: TableDataAdditions;
    data?: T;
    factory?: SvelteComponentFactory;
}
export abstract class TableComponent<T> {
    comp: eTableData;
    data: iTableData<T> | TableComponent<T> | TableComponent<T>[];
    filterable: boolean;
    sorter?: Sorter<TableComponent<T>>

    public getChilds(): TableComponent<T> | iTableData<T> | TableComponent<T>[] {
        return this.data;
    }

    public abstract getData(): T[];
}

export class Table<T> extends TableComponent<T> {
    comp = eTableData.Table;
    data: TableRow<T>[];
    filterable: boolean = true;

    public  constructor() {
        super();
        this.data = new Array();
    }

    public getData(): T[] {
        let data: Array<T> = [];
        this.data.forEach(child => {
            let childData = child.getData()
            if (childData !== undefined) {
                data.push(...childData)
            }
        });
        return data;
    }

    public add(...rows: TableRow<T>[]): Table<T> {
        this.data.push(...rows);
        return this;
    }
}

export class TableRow<T> extends TableComponent<T> {
    comp = eTableData.Row;
    data: TableCell<T>[];
    filterable: boolean = true;

    public constructor(filterable?: boolean) {
        super();
        this.filterable = filterable === undefined? true : filterable;
        this.data = new Array();
    }

    public getData(): T[] {
        let data: Array<T> = [];
        this.data.forEach(child => {
            let childData = child.getData()
            if (childData !== undefined) {
                data.push(...childData)
            }
        });
        return data;
    }

    public add(...cells: TableCell<T>[]): TableRow<T> {
        this.data.push(...cells);
        return this;
    }
}

export class TableCell<T> extends TableComponent<T> {
    comp = eTableData.Cell;
    data: [TableComponent<T>] | TableComponent<T>[];
    filterable: boolean = true;

    public constructor(filterable?: boolean) {
        super();
        this.data = new Array();
        this.filterable = filterable === undefined? true : filterable;
    }

    public getData(): T[] {
        let data: Array<T> = [];
        this.data.forEach(child => {
            let childData = child.getData()
            if (childData !== undefined) {
                data.push(...childData)
            }
        });
        return data;
    }

    public add( ...elem: TableData<T>[] | [Table<T>]): TableCell<T> {
        this.data.push(...elem);
        return this;
    }
}

export class TableData<T> extends TableComponent<T> {
    comp = eTableData.Data;
    data: iTableData<T>;
    filterable: boolean = true;

    public constructor(data: T) {
        super();
        this.data = {
            data,
            type: TableDataAdditions.VALUE
        };
    }

    public override getChilds(): TableComponent<T> | iTableData<T> | TableComponent<T>[] {
        return undefined;
    }

    public getData(): T[] {
        return [this.data.data];
    }
}

export class TableDataHTML<T> implements TableComponent<T> {
    comp = eTableData.Data;
    data: iTableData<T>;
    filterable: boolean = true;

    public constructor(data: T) {
        this.data = {
            data,
            type: TableDataAdditions.HTML
        };
    }

    public getChilds(): TableComponent<T> | iTableData<T> | TableComponent<T>[] {
        return undefined;
    }

    public getData(): T[] {
        return this.data.data === undefined ? undefined : [this.data.data];
    }
}

export class TableDataSvelteComponent<T> implements TableComponent<T> {
    comp = eTableData.Data;
    data: iTableData<T>;
    filterable: boolean = true;

    public constructor(factory: SvelteComponentFactory) {
        this.data = {
            data: undefined,
            type: TableDataAdditions.COMPONENT,
            factory
        };
    }

    public getChilds(): TableComponent<T> | iTableData<T> | TableComponent<T>[] {
        return undefined;
    }

    public getData(): T[] {
        return this.data.data === undefined ? undefined : [this.data.data];;
    }
}

export class TitleCell<T> extends TableCell<T> {
    comp = eTableData.TitleCell;
    data: TableComponent<T>[];
    filterable: boolean = false;
    sorter: Sorter<TableComponent<T>>;

    public constructor(sorter?: Sorter<TableComponent<T>>) {
        super();
        this.data = new Array();
        this.sorter = sorter;
    }

    public set(elem: TableData<T>): TitleCell<T> {
        this.data = [elem];
        return this;
    }
}

export class TitleRow<T> extends TableRow<T> {
    comp = eTableData.TitleRow;
    data: TitleCell<T>[];
    filterable: boolean = false;

    public constructor() {
        super(false);
    }

    public add(...cells: TitleCell<T>[]): TitleRow<T> {
        this.data.push(...cells);
        return this;
    }
}


// export interface iTableData<T extends iTableData<T>> {
//     comp: eTableData.Data;
//     data: T | iTable<T;
// }

// export interface iTableCell<T extends iTableData<T>, C extends iTableCell<T, C>> {
//     comp: eTableData.Cell;
//     data: T[];
// }

// export interface iTableRow<T extends iTableData<T>, C extends iTableCell<T, C>, R extends iTableRow<T, C, R>> {
//     comp: eTableData.Row;
//     data: C[];
// }

// export interface iTable<T extends iTableData<T>, C extends iTableCell<T, C>, R extends iTableRow<T, C, R>, TA extends iTable<T, C, R, TA>> {
//     comp: eTableData.Table;
//     data: R[];
// }

// export interface Filterable {
//     filterable: boolean
// }

// export interface iTableData<T> extends iTableComponent<T> {
//     data: T;
// }

// export interface iTableComponent<T, D extends iTableData<T>, C extends iTableCell<T, D>, R extends iTableRow<T, D, C>> extends Filterable {
//     comp: eTableData;
//     data: T[];
// }

// export interface iTable<T, D extends iTableData<T>, C extends iTableCell<T, D>, R extends iTableRow<T, D, C>> extends iTableComponent<T, D, C, R> {
//     data: R[];
// }

// export interface iTableRow<T, D extends iTableData<T>, C extends iTableCell<T,D>> extends iTableComponent<T, D, C, R> {
//     data: C[];
// }

// export interface iTableCell<T, D extends iTableData<T>> extends iTableComponent<D> {
//     data: D[];
// }

// export class Table<R extends iTableRow> implements iTable<R> {
//     comp: eTableData = eTableData.Table;
//     data: R[];
//     filterable: boolean = true;

//     public constructor() {
//         this.data = new Array();
//     }

//     public add(...entry: R[]) : Table<R> {
//         this.data.push(...entry);
//         return this;
//     }
// }

// export class Row implements iTableRow {
//     comp: eTableData = eTableData.Row;
//     data: iTableCell[];
//     filterable: boolean = true;

//     public constructor() {
//         this.data = new Array();
//     }

//     public add(...entry: iTableCell[]) : Row {
//         this.data.push(...entry);
//         return this;
//     }
// }

// export class TitleRow implements iTableRow {
//     comp: eTableData = eTableData.TitleRow;
//     data: iTableCell[];
//     filterable: boolean = false;

//     public constructor() {
//         this.data = new Array();
//     }

//     public add(...entry: iTableCell[]) : TitleRow {
//         this.data.push(...entry);
//         return this;
//     }
// }

// export class TitleCell implements iTableCell {
//     comp: eTableData = eTableData.TitleCell;
//     data: [TableData];
//     filterable: boolean = false;
//     sorter?: Sorter<iTableRow>;

//     public constructor(entry: TableData, sorter?: Sorter<iTableComponent>) {
//         this.data = [entry]
//         this.sorter = sorter;
//     }
// }

// export class Cell<R extends iTableRow> implements iTableCell {
//     comp: eTableData = eTableData.Cell;
//     data: [TableData] | [Table<R>];
//     filterable: boolean = true;

//     public constructor(entry: TableData | Table<R>) {
//         this.data = [entry];
//     }
// }

// export class TableData implements iTableData {
//     comp: eTableData = eTableData.Data;
//     data: any;
//     filterable: boolean = true;

//     public constructor(data: any) {
//         this.data = data
//     }
// }

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