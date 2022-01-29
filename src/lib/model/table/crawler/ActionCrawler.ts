/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { TableComponent, Table, TableCell, TableData, TableRow, TitleCell, TitleRow } from "../TableComponents";
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

    public crawlTable(crawler: TableActionCrawler<T>, table: Table<T>) {
        crawler.advance(crawler, table);
    }

    public crawlTitleRow(crawler: TableActionCrawler<T>, titleRow: TitleRow<T>): void {
        crawler.advance(crawler, titleRow);
    }

    public crawlRow(crawler: TableActionCrawler<T>, row: TableRow<T>): void {
        crawler.advance(crawler, row);
    }

    public crawlCell(crawler: TableActionCrawler<T>, cell: TableCell<T>): void {
        crawler.advance(crawler, cell);
    }

    public crawlTitleCell(crawler: TableActionCrawler<T>, titleCell: TitleCell<T>): void {
        crawler.advance(crawler, titleCell);
    }

    public crawlData(crawler: TableActionCrawler<T>, data: TableData<T>): void {
        crawler.advance(crawler, data);
    }

    private advance<C extends TableComponent<T>>(crawler: TableActionCrawler<T>, comp: C) {
        if (crawler.index === undefined || crawler.index.length == 0) {
            crawler.action(crawler, comp);
        } else if (crawler.index.length > 1) {
            crawler.crawl(crawler, comp.data[crawler.index.pop()]);
        } else {
            crawler.action(crawler, comp.data[crawler.index.pop()])
        }
    }
}