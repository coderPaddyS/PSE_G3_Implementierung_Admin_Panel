/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { TableComponent, Table, TableCell, TableData, TableRow, TitleCell, TitleRow, TableDataTable } from "../TableComponents";
import { TableCrawler } from "../TableCrawler";
import type { CrawlerAction } from "../Types";

/**
 * A {@link TableCrawler} to sort the given table by a given {@link Sorter}.
 * Only sorts the direct children of the given table.
 * 
 * @param T The type used in this table
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class TableActionCrawler<T> extends TableCrawler<T,TableActionCrawler<T>>{

    /**
     * The {@link Sorter} to sort the table by
     */
    private action: CrawlerAction<T, TableActionCrawler<T>>;

    private index: Array<number>;

    /**
     * Construct a new TableSortingCrawler
     * @param sorter {@link Sorter}
     */
    public constructor(action: CrawlerAction<T, TableActionCrawler<T>>, index?: Array<number>) {
        super();
        this.action = action;
        this.index = index === undefined ? undefined : index.reverse();
    }

    public crawlTable(table: Table<T>): Table<T> {
        // if (this.index === undefined || this.index.length == 0) {
            
        // }
        return this.advance(table, this.crawlRow);
    }

    public crawlTitleRow(titleRow: TitleRow<T>): TitleRow<T> {
        return this.advance(titleRow, this.crawlTitleCell);
    }

    public crawlRow(row: TableRow<T>): TableRow<T> {
        return this.advance(row, this.crawlCell);
    }

    public crawlCell(cell: TableCell<T>): TableCell<T> {
        return this.advance(cell, this.crawlData);
    }

    public crawlTitleCell(titleCell: TitleCell<T>): TitleCell<T> {
        return this.advance(titleCell, this.crawlData);
    }

    public crawlData(data: TableData<T>): TableData<T> {
        if (data instanceof TableDataTable) {
            return this.advance(data, this.crawlTable)
        }
        return this.advance(data, this.crawlData);
    }

    private advance<C extends TableComponent<T>, R extends TableComponent<T>>(comp: C, crawl: (c: R) => R): C {
        if (this.index === undefined || this.index.length == 0) {
            this.action(this, comp);
        } else if (this.index.length > 1) {
            crawl(comp.getChilds()[this.index.pop()]);
        } else {
            this.action(this, comp.getChilds()[this.index.pop()])
        }
        return comp;
    }
}