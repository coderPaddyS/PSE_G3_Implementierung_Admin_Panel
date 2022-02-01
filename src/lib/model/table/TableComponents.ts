import type { SvelteComponent } from "svelte/internal";
import type { Sorter } from "./Types"
import { TableDataAdditions } from "./TableDataAdditions";
import type { TableCrawler } from "./TableCrawler";

export type SvelteComponentFactory = (root: HTMLElement, props?: Object) => SvelteComponent;

export interface iTableData<T> {
    type: TableDataAdditions;
    table?: Table<T>,
    data?: T;
    factory?: SvelteComponentFactory;
}
export abstract class TableComponent<T> {
    protected data: iTableData<T> | TableComponent<T> | TableComponent<T>[];
    protected filterable: boolean;
    protected sorter?: Sorter<TableComponent<T>>

    public getChilds(): TableComponent<T> | iTableData<T> | TableComponent<T>[] {
        return this.data;
    }

    public abstract getData(): T[];

    public abstract getCrawledOn<C extends TableCrawler<T, C>>(crawler: C);

    public isFilterable() {
        return this.filterable;
    }
}

export class Table<T> extends TableComponent<T> {
    protected data: TableRow<T>[];
    protected title: TitleRow<T>;
    protected filterable: boolean = true;

    public constructor() {
        super();
        this.data = new Array();
    }

    public getChilds(): TableRow<T>[] {
        return this.data;
    }

    public setChilds(rows: TableRow<T>[]) {
        this.data = rows;
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

    public setTitle(titlerow: TitleRow<T>): Table<T> {
        this.title = titlerow;
        return this;
    }

    public getTitle(): TitleRow<T> {
        return this.title;
    }

    public override getCrawledOn<C extends TableCrawler<T, C>>(crawler: C) {
        let newData = crawler.crawlTable(this);
        this.data = newData? newData.data : undefined;
    }
}

export class TableRow<T> extends TableComponent<T> {
    protected data: TableCell<T>[];
    protected filterable: boolean = true;

    public constructor(filterable?: boolean) {
        super();
        this.filterable = filterable === undefined? true : filterable;
        this.data = new Array();
    }

    public getChilds(): TableCell<T>[] {
        return this.data;
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

    public override getCrawledOn<C extends TableCrawler<T, C>>(crawler: C) {
        let newData = crawler.crawlRow(this);
        this.data = newData? newData.data : undefined;
    }
}

export class TableCell<T> extends TableComponent<T> {
    protected data: TableData<T>[];
    protected filterable: boolean = true;

    public constructor(filterable?: boolean) {
        super();
        this.data = new Array();
        this.filterable = filterable === undefined? true : filterable;
    }

    public getChilds(): TableData<T>[] {
        return this.data;
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

    public add( ...elem: TableData<T>[]): TableCell<T> {
        this.data.push(...elem);
        return this;
    }

    public override getCrawledOn<C extends TableCrawler<T, C>>(crawler: C) {
        let newData = crawler.crawlCell(this);
        this.data = newData? newData.data : undefined;
    }
}

export class TableData<T> extends TableComponent<T> {
    protected data: iTableData<T>;
    protected filterable: boolean = true;

    public constructor(data: T) {
        super();
        this.data = {
            data,
            type: TableDataAdditions.VALUE
        };
    }

    public override getChilds(): [Table<T>] {
        return undefined;
    }

    public getData(): T[] {
        return [this.data.data];
    }

    public override getCrawledOn<C extends TableCrawler<T, C>>(crawler: C) {
        let newData = crawler.crawlData(this);
        this.data = newData? newData.data : undefined;
    }

    public getType(): TableDataAdditions {
        return this.data.type;
    }

    public getFactory(): SvelteComponentFactory {
        return this.data.factory;
    }
}

export class TableDataHTML<T> extends TableData<T> {

    public constructor(data: T) {
        super(data);
        this.data = {
            data,
            type: TableDataAdditions.HTML
        };
    }

    public getChilds(): [Table<T>] {
        return undefined;
    }

    public getData(): T[] {
        return this.data.data === undefined ? undefined : [this.data.data];
    }
}

export class TableDataSvelteComponent<T> extends TableData<T> {
    protected filterable: boolean = false;

    public constructor(factory: SvelteComponentFactory) {
        super(undefined);
        this.data = {
            type: TableDataAdditions.COMPONENT,
            factory
        };
    }

    public getChilds(): [Table<T>] {
        return undefined;
    }

    public getData(): T[] {
        return this.data.data === undefined ? undefined : [this.data.data];;
    }
}

export class TableDataTable<T> extends TableData<T> {
    protected filterable: boolean = true;

    public constructor(table: Table<T>) {
        super(undefined);
        this.data = {
            table,
            type: TableDataAdditions.TABLE
        }
    }

    public getChilds(): [Table<T>] {
        return [this.data.table];
    }

    public getData(): T[] {
        return this.data.table.getData();
    }
}

export class TitleCell<T> extends TableCell<T> {
    protected data: TableData<T>[];
    protected filterable: boolean = false;
    protected sorter: Sorter<TableRow<T>>;

    public constructor(sorter?: Sorter<TableRow<T>>) {
        super();
        this.data = new Array();
        this.sorter = sorter;
    }

    public set(elem: TableData<T>): TitleCell<T> {
        this.data = [elem];
        return this;
    }

    public getSorter(): Sorter<TableRow<T>> {
        return this.sorter;
    }
}

export class TitleRow<T> extends TableRow<T> {
    protected data: TitleCell<T>[];
    protected filterable: boolean = false;

    public constructor() {
        super(false);
    }

    public add(...cells: TitleCell<T>[]): TitleRow<T> {
        this.data.push(...cells);
        return this;
    }

    public getChilds(): TitleCell<T>[] {
        return this.data;
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