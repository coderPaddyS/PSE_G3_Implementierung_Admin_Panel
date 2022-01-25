/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { iTable, iTableRow } from "../Types";
import { TableCrawler } from "../TableCrawler";
import type { Sorter } from "../Store";

/**
 * A {@link TableCrawler} to sort the given table by a given {@link Sorter}.
 * Only sorts the direct children of the given table.
 * 
 * @param R The {@link iTableRow} used in this table
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class TableSortingCrawler<R extends iTableRow> extends TableCrawler<TableSortingCrawler<R>>{

    /**
     * The {@link Sorter} to sort the table by
     */
    private sorter: Sorter<R>;

    /**
     * Construct a new TableSortingCrawler
     * @param sorter {@link Sorter}
     */
    public constructor(sorter: Sorter<R>) {
        super();
        this.sorter = sorter;
    }

    public crawlTable(crawler: TableSortingCrawler<R>, table: iTable<R>) : iTable<R> {
        for (let i: number = 1; i < table.data.length; ++i) {
            for (let j: number = i + 1; j < table.data.length; ++j) {
                [table.data[i], table.data[j]] = crawler.sorter(table.data[i], table.data[j]);
            }
        }
        return table;
    }
}