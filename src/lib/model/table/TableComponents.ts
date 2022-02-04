/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { tail } from "./Types";
import type { Sorter } from "./Types";
import { TableDataAdditions } from "./TableDataAdditions";
import type { TableCrawler } from "./TableCrawler";

/**
 * A function which given an html element root and some values renders its data as a child of root.
 * @param root {@link HTMLElement} the data should be rendered to as a child.
 * @param props An Object containing all needed parameters to render the data.
 * @returns May return an identifier to the created component
 */
export type ComponentFactory = (root: HTMLElement, props?: Object) => any;

/**
 * The common interface of all table data components.
 * 
 * @template T the type of data stored by the table data components
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export interface iTableData<T> {
    type: TableDataAdditions;
    table?: Table<T>,
    data?: T;
    factory?: ComponentFactory;
}

/**
 * The common base of all table components.
 * 
 * @template T the type of data stored by the table components
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export abstract class TableComponent<T> {
    protected data: iTableData<T> | TableComponent<T> | TableComponent<T>[];
    protected filterable: boolean = true;
    protected hidden: boolean = false;
    protected sorter?: Sorter<TableComponent<T>>;

    /**
     * Getter for the child components.
     * @returns the child components
     */
    public getChilds(): TableComponent<T> | iTableData<T> | TableComponent<T>[] {
        return this.data;
    }

    /**
     * Getter for the data contained in this component.
     */
    public abstract getData(): any[];

    /**
     * Let the component be crawled on by a crawler
     * @param crawler the crawler which crawls on the component
     * 
     * @template C {@link TableCrawler TableCrawler<T, C>}
     */
    public abstract getCrawledOn<C extends TableCrawler<T, C>>(crawler: C);

    /**
     * Is this component filterable?
     * @returns `true` iff this component is filterable
     */
    public isFilterable() {
        return this.filterable;
    }

    /**
     * Is this component hidden and should not be shown?
     * @returns `true` iff this component is hidden
     */
    public isHidden(): boolean {
        return this.hidden;
    }

    /**
     * Hide this element to signal that this element should not be rendered.
     */
    public hide() {
        this.hidden = true;
    }

    /**
     * Show this element and signal that this element should be rendered.
     */
    public show() {
        this.hidden = false;
    }
}

/**
 * A basic Table which contains a titlerow and datarows.
 * 
 * @template T the type of data stored by the table components
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class Table<T> extends TableComponent<T> {
    protected data: TableRow<T>[];
    protected title: TitleRow<T>;
    protected filterable: boolean = true;

    /**
     * Construct a new instance
     */
    public constructor() {
        super();
        this.data = new Array();
    }

    /**
     * Getter for the datarows of the table.
     * @returns The {@link TableRow TableRow<T>}s of the table
     */
    public getChilds(): TableRow<T>[] {
        return this.data;
    }

    /**
     * Setter for the datarows of the table.
     * @param rows The {@link TableRow TableRow<T>}s of the table
     */
    public setChilds(rows: TableRow<T>[]) {
        this.data = rows;
    }

    /**
     * Get the data of this table.
     * @returns An Array containing a single Object. This object has the following format:
     *      If there is no title, then the key is the value of the first column, the value the remaining columns
     *      If there is a title, then the key is the value of the title, the value the matching data
     */
    public getData(): any[] {
        let data: Object[] = [];

        if (!this.data) {
            return undefined;
        }

        this.data.forEach((child, index) => {
            let object: Object = {};
            let childData = child.getData();
            if (childData !== undefined) {
                if (this.title) {
                    // There is a title, so the key should be the index-TitleCell data
                    childData.forEach((d, i) => object[this.title.getData()[i].toString()] = d);
                } else {
                    // No title, therefore the key is the first column, the value all remaining columns
                    object[childData[0].toString()] = tail(childData).toString();
                }
            }
            data.push(object);
        });
        return data;
    }

    /**
     * Add the given rows at the bottom of the table.
     * @param rows The {@link TableRow TableRow<T>}s to be added
     * @returns this {@link Table<T>}
     */
    public add(...rows: TableRow<T>[]): Table<T> {
        this.data.push(...rows);
        return this;
    }

    /**
     * Remove the given row from the table.
     * @param index The number of the row to be removed
     * @returns `True` iff the row was present and could be removed.
     */
    public remove(index: number): boolean {
        if (index < 0 || index > this.data.length) {
            return false;
        }
        return this.data.length > index && this.data.splice(index, 1) != undefined;
    }

    /**
     * Set the title of this table
     * @param titlerow A {@link TitleRow TitleRow<T>} to be set as title
     * @returns This {@link Table<T>}
     */
    public setTitle(titlerow: TitleRow<T>): Table<T> {
        this.title = titlerow;
        return this;
    }

    /**
     * Getter fot the title row
     * @returns The by {@link setTitle} set {@link TitleRow TitleRow<T>}
     */
    public getTitle(): TitleRow<T> {
        return this.title;
    }

    public override getCrawledOn<C extends TableCrawler<T, C>>(crawler: C) {
        let newData = crawler.crawlTable(this);
        this.data = newData? newData.data : undefined;
    }

    /**
     * Matches the given data to its title.
     * Must be loq than the title.
     * @param data The data that should be matched to its title.
     * @returns An {@link Object} with the keys set to the title, the values set to the given data in order.
     */
    public matchData(data: T[]): Object {
        let object: Object = {};
        data.forEach((value, index) => object[this.title.getData()[index].toString()] = value);
        return object;
    }
}

/**
 * A basic table row which contains cells.
 * 
 * @template T the type of data stored by the table components
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class TableRow<T> extends TableComponent<T> {
    protected data: TableCell<T>[];
    protected filterable: boolean = true;

    /**
     * Create a new instance.
     * @param filterable Wether this row is filterable or not
     */
    public constructor(filterable?: boolean) {
        super();
        this.filterable = filterable === undefined? true : filterable;
        this.data = new Array();
    }

    /**
     * Getter for the cells in this row.
     * @returns The {@link TableCell TableCell<T>}s of this row
     */
    public override getChilds(): TableCell<T>[] {
        return this.data;
    }

    /**
     * Getter for the data in this row.
     * @returns The data stored in this row
     */
    public override getData(): T[] {
        if (!this.data) {
            return undefined;
        }
        let data: Array<T> = [];
        this.data.forEach(child => {
            let childData = child.getData()
            if (childData !== undefined) {
                data.push(...childData)
            }
        });
        return data;
    }

    /**
     * Add the given cells to the row.
     * @param cells The {@link TableCell TableCell<T>}s to be added
     * @returns this {@link TableRow<T>}
     */
    public add(...cells: TableCell<T>[]): TableRow<T> {
        this.data.push(...cells);
        return this;
    }

    public override getCrawledOn<C extends TableCrawler<T, C>>(crawler: C) {
        let newData = crawler.crawlRow(this);
        this.data = newData? newData.data : undefined;
    }
}

/**
 * A basic table cell which contains table data components.
 * 
 * @template T the type of data stored by the table components
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class TableCell<T> extends TableComponent<T> {
    protected data: TableData<T>[];
    protected filterable: boolean = true;

    /**
     * Create a new instance.
     * @param filterable Wether this cell is filterable or not
     */
    public constructor(filterable?: boolean) {
        super();
        this.data = new Array();
        this.filterable = filterable === undefined? true : filterable;
    }

    /**
     * Getter for the table data components in this cell.
     * @returns The {@link TableData TableData<T>} of this cell
     */
    public override getChilds(): TableData<T>[] {
        return this.data;
    }

    /**
     * Getter for the data contained in this cell.
     * @returns The data contained in this cell
     */
    public override getData(): T[] {
        if (!this.data) {
            return undefined;
        }

        let data: Array<T> = [];
        this.data.forEach(child => {
            let childData = child.getData()
            if (childData !== undefined) {
                data.push(...childData)
            }
        });
        return data;
    }

    /**
     * Add the given data to the cell.
     * @param cells The {@link TableCell TableCell<T>}s to be added
     * @returns this {@link TableCell<T>}
     */
    public add( ...elem: TableData<T>[]): TableCell<T> {
        this.data.push(...elem);
        return this;
    }

    public override getCrawledOn<C extends TableCrawler<T, C>>(crawler: C) {
        let newData = crawler.crawlCell(this);
        this.data = newData? newData.data : undefined;
    }
}

/**
 * A basic table data which contains the data.
 * 
 * @template T the type of data stored by the table components
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class TableData<T> extends TableComponent<T> {
    protected data: iTableData<T>;
    protected filterable: boolean = true;

    /**
     * Construct a new instance.
     * @param data The data stored in this component
     */
    public constructor(data: T) {
        super();
        this.data = {
            data,
            type: TableDataAdditions.VALUE
        };
    }

    /**
     * A normal data component has no childs.
     * @returns undefined
     */
    public override getChilds(): [Table<T>] {
        return undefined;
    }

    /**
     * Getter for the data of this component.
     * @returns An Array containing the data of this component as the only entry
     */
    public override getData(): T[] {
        return this.data ? [this.data.data] : undefined;
    }

    public override getCrawledOn<C extends TableCrawler<T, C>>(crawler: C) {
        let newData = crawler.crawlData(this);
        this.data = newData? newData.data : undefined;
    }

    /**
     * Getter for the type of this component.
     * @returns The {@link TableDataAdditions type} of this component.
     */
    public getType(): TableDataAdditions {
        return this.data.type;
    }

    /**
     * Getter for the component factory.
     * Only returns a value iff {@link getType getType()} == {@link TableDataAdditions.COMPONENT}
     * @returns The {@link ComponentFactory} of this component
     */
    public getFactory(): ComponentFactory {
        return this.data.factory;
    }
}

/**
 * A table data component which contains the data and renders to html.
 * 
 * @template T the type of data stored by the table components
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class TableDataHTML<T> extends TableData<T> {

    /**
     * Construct a new instance.
     * @param data The data stored in this component
     */
    public constructor(data: T) {
        super(data);
        this.data = {
            data,
            type: TableDataAdditions.HTML
        };
    }

    public override getChilds(): [Table<T>] {
        return undefined;
    }
}

/**
 * A table data component which contains the data and renders to a custom component.
 * 
 * @template T the type of data stored by the table components
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class TableDataComponent<T> extends TableData<T> {
    protected filterable: boolean = false;

    /**
     * Construct a new instance.
     * @param factory A {@link ComponentFactory} which renders the content
     */
    public constructor(factory: ComponentFactory) {
        super(undefined);
        this.data = {
            type: TableDataAdditions.COMPONENT,
            factory,
        };
    }

    public override getChilds(): [Table<T>] {
        return undefined;
    }

    /**
     * Getter for the data of this component.
     * @returns An Array containing the data of this component as the only entry or `undefined` if the data is `undefined`
     */
    public getData(): T[] {
        return undefined;
    }
}

/**
 * A table data component which contains the data and renders to a {@link Table table}.
 * 
 * @template T the type of data stored by the table components
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class TableDataTable<T> extends TableData<T> {
    protected filterable: boolean = true;

    /**
     * Construct a new instance.
     * @param table The {@link Table Table<T>} to be rendered in this cell
     */
    public constructor(table: Table<T>) {
        super(undefined);
        this.data = {
            table,
            type: TableDataAdditions.TABLE
        }
    }

    /**
     * Getter for the table in this component.
     * @returns An Array containing the {@link Table table} contained in this component.
     */
    public override getChilds(): [Table<T>] {
        return this.data.table? [this.data.table] : undefined;
    }

    /**
     * Getter for the data of the contained table.
     * @returns The data of the contained table
     */
    public override getData(): T[] {
        return this.data.table ? this.data.table.getData() : undefined;
    }
}

/**
 * A basic title cell which contains data.
 * 
 * @template T the type of data stored by the table components
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class TitleCell<T> extends TableCell<T> {
    protected data: TableData<T>[];
    protected filterable: boolean = false;
    protected sorter: Sorter<TableRow<T>>;

    /**
     * Construct a new instance.
     * @param sorter A {@link Sorter} for {@link TableRow TableRow<T>}s to sort the table by this column.
     */
    public constructor(sorter?: Sorter<TableRow<T>>) {
        super();
        this.data = new Array();
        this.sorter = sorter;
    }

    /**
     * Set the data of this title cell.
     * @param elem The {@link TableData<T>} to set the text.
     * @returns This {@link TitleCell}
     */
    public set(elem: TableData<T>): TitleCell<T> {
        this.data = [elem];
        return this;
    }

    /**
     * Getter for the sorter of this element. May be undefined
     * @returns The {@link Sorter}
     */
    public getSorter(): Sorter<TableRow<T>> {
        return this.sorter;
    }

    public override getCrawledOn<C extends TableCrawler<T, C>>(crawler: C) {
        let newData = crawler.crawlTitleCell(this);
        this.data = newData? newData.data : undefined;
    }
}

/**
 * A basic title row which contains title cells.
 * 
 * @template T the type of data stored by the table components
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class TitleRow<T> extends TableRow<T> {
    protected data: TitleCell<T>[];
    protected filterable: boolean = false;

    /**
     * Construct a new instance
     */
    public constructor() {
        super(false);
    }

    /**
     * Add the given title cells to the row.
     * @param cells The {@link TitleCell TitleCell<T>}s to be added
     * @returns this {@link TitleRow<T>}
     */
    public add(...cells: TitleCell<T>[]): TitleRow<T> {
        this.data.push(...cells);
        return this;
    }

    /**
     * Getter for the title cells in this title row.
     * @returns The {@link TitleCell TitleCell<T>}s of this row
     */
    public getChilds(): TitleCell<T>[] {
        return this.data;
    }

    public override getCrawledOn<C extends TableCrawler<T, C>>(crawler: C) {
        let newData = crawler.crawlTitleRow(this);
        this.data = newData? newData.data : undefined;
    }
}