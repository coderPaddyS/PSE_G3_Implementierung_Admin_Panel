/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { TableComponent, Table, TableCell, TableData, TableRow, TitleCell, TitleRow, TableDataTable } from "../TableComponents";
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
        this.action = action;
        this.index = index === undefined ? undefined : index.reverse();
    }

    public override crawlTable(table: Table<T>): Table<T> {
        return this.advance(table, this.crawlRow);
    }

    public override crawlTitleRow(titleRow: TitleRow<T>): TitleRow<T> {
        return this.advance(titleRow, this.crawlTitleCell);
    }

    public override crawlRow(row: TableRow<T>): TableRow<T> {
        return this.advance(row, this.crawlCell);
    }

    public override crawlCell(cell: TableCell<T>): TableCell<T> {
        return this.advance(cell, this.crawlData);
    }

    public override crawlTitleCell(titleCell: TitleCell<T>): TitleCell<T> {
        return this.advance(titleCell, this.crawlData);
    }

    public override crawlData(data: TableData<T>): TableData<T> {
        if (data instanceof TableDataTable) {
            return this.advance(data, this.crawlTable)
        }
        return this.advance(data, this.crawlData);
    }

    /**
     * Crawl onto the component and advance by using the index.
     * @param comp The {@link TableComponent} to crawl on
     * @param crawl The method used to crawl onto the component. Needed due to missing dynamic binding.
     * @returns The given comp
     * 
     * @template C Something that extends {@link TableComponent TableComponent<T>}
     * @template R Something that extends {@link TableComponent TableComponent<T>} and is the child of C.
     */
    private advance<C extends TableComponent<T>, R extends TableComponent<T>>(comp: C, crawl: (c: R) => R): C {
        if (this.index === undefined || this.index.length == 0) {
            // Perform the action on this element.
            this.action(this, comp);
        } else if (this.index.length > 1) {
            // crawl onto the specified index of the child
            crawl(comp.getChilds()[this.index.pop()]);
        } else {
            // Perform the action on the next element. Saves a recursion step
            this.action(this, comp.getChilds()[this.index.pop()])
        }
        return comp;
    }
}