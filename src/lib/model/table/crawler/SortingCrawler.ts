/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Table, TableRow } from "../TableComponents";
import { TableCrawler } from "../TableCrawler";
import type { Sorter } from "../Types";

/** 
 * A {@link TableCrawler} to sort the given table by a given {@link Sorter}.
 * Only sorts the direct children of the given table.
 * 
 * @param R The {@link iTableRow} used in this table
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class TableSortingCrawler<T> extends TableCrawler<T,TableSortingCrawler<T>>{

    /**
     * The {@link Sorter} to sort the table by
     */
    private sorter: Sorter<TableRow<T>>;

    /**
     * Construct a new TableSortingCrawler
     * @param sorter {@link Sorter}
     */
    public constructor(sorter: Sorter<TableRow<T>>) {
        super();
        this.sorter = sorter;
    }

    public crawlTable(table: Table<T>) : Table<T> {
        let rows: TableRow<T>[] = table.getChilds();
        if (rows) {
            for (let i: number = 0; i < rows.length; ++i) {
                for (let j: number = i + 1; j < rows.length; ++j) {
                    [rows[i], rows[j]] = this.sorter(rows[i], rows[j]);
                }
            }
        }
        return table;
    }
}