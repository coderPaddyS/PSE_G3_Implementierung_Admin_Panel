/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { Table, TableCell, TableData, TableDataTable, TableRow } from "../TableComponents";
import { TableCrawler } from "../TableCrawler";
import type { CrawlerAction } from "../Types";

/**
 * A {@link TableCrawler} to perform an action onto a table component specified by the index.
 * 
 * @template T The type used in this table
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class TableActionCrawler<T> extends TableCrawler<T,TableActionCrawler<T>>{

    /**
     * The {@link CrawlerAction} to be performed
     */
    private action: CrawlerAction<T, TableActionCrawler<T>>;

    private index: Array<number>;

    /**
     * Construct a new instance.
     * @param action {@link CrawlerAction}
     * @param index An Array specifying the index of the component which should be crawled on.
     */
    public constructor(action: CrawlerAction<T, TableActionCrawler<T>>, index?: Array<number>) {
        super();
        if (action === undefined) {
            throw new Error("a TableActionCrawler needs to have an action, otherwise it is useless");
        }
        this.action = action;
        this.index = index === undefined ? undefined : index.reverse();
    }

    public override crawlTable(table: Table<T>): Table<T> {
        if (table === undefined) {
            return undefined;
        } else if (this.index !== undefined && this.index.length > 0) {
            let index = this.index.pop();
            let length = table.getChilds().length;
            if (length < index || index < 0) {
                console.log(length, index);
                throw new Error(`index ${index} is out of bounce. Maximum: ${length}, Minimum: 0`);
            }
            this.crawlRow(table.getChilds()[index]);
        } else {
            this.action(this, table);
            table.getChilds().forEach(child => this.crawlRow(child));
        }
        return table;
    }

    public override crawlRow(row: TableRow<T>): TableRow<T> {
        if (row === undefined) {
            return undefined;
        } else if (this.index !== undefined && this.index.length > 0) {
            let index = this.index.pop();
            let length = row.getChilds().length;
            if (length < index || index < 0) {
                throw new Error(`index ${index} is out of bounce. Maximum: ${length}, Minimum: 0`);
            }
            this.crawlCell(row.getChilds()[index]);
        } else {
            this.action(this, row);
            row.getChilds().forEach(child => this.crawlCell(child));
        }
        return row;
    }

    public override crawlCell(cell: TableCell<T>): TableCell<T> {
        if (cell === undefined) {
            return undefined;
        } else if (this.index !== undefined && this.index.length > 0) {
            let index = this.index.pop();
            let length = cell.getChilds().length;
            if (length < index || index < 0) {
                throw new Error(`index ${index} is out of bounce. Maximum: ${length}, Minimum: 0`);
            }
            this.crawlData(cell.getChilds()[index]);
        } else {
            this.action(this, cell);
            cell.getChilds().forEach(child => this.crawlData(child));
        }
        return cell;
    }

    public override crawlData(data: TableData<T>): TableData<T> {
        if (data === undefined) {
            return undefined;
        } else if (this. index !== undefined && this.index.length > 0 && data instanceof TableDataTable) {
            let index = this.index.pop();
            let length = data.getChilds().length;
            if (length < index || index < 0) {
                throw new Error(`index ${index} is out of bounce. Maximum: ${length}, Minimum: 0`);
            }
            this.crawlTable(data.getChilds()[index]);
        } else if (this.index !== undefined && this.index.length > 0) {
            throw new Error(`${typeof data} does not have any child components.`);
        } else {
            this.action(this, data);
            if (data instanceof TableDataTable) {
                this.crawlTable(data.getChilds()[0])
            }
        }
        return data;
    }
}