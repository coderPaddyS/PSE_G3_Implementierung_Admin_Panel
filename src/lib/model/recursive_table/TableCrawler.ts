/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Table, TableCell, TableData, TableRow, TitleCell, TitleRow } from "$lib/model/recursive_table/TableComponents";

/**
 * A generic TableCrawler to crawl a table.
 * Enables to add custom behavior, as it crawls along the table and visits each element if desired.
 * 
 * @template T The type of the table data this crawler crawls on.
 * @template E A type that extends this class to contain type safety and enable access to attributes.
 * 
 * @author Patrick Schneider
 * @version 1.1
 */
export abstract class TableCrawler<T, E extends TableCrawler<T, E>> {
    
    /**
     * Crawl on a given table element
     * @param table {@code iTable<iTableRow} The table to crawl on
     * @returns The crawled-on table with perhaps changed data
     */
    public crawlTable(table: Table<T>): Table<T> {
        return table;
    }

    /**
     * Crawl on a given row element
     * @param row {@code iTableRow} The row to crawl on
     * @returns The crawled-on row with perhaps changed data
     */
    public crawlRow(row: TableRow<T>): TableRow<T> {
        return row;
    }

    /**
     * Crawl on a given cell element
     * @param cell {@code iTableCell} The cell to crawl on
     * @returns The crawled-on cell with perhaps changed data
     */
    public crawlCell(cell: TableCell<T>): TableCell<T> {
        return cell;
    }

    /**
     * Crawl on a given data element
     * @param data {@code iTableData} The data to crawl on
     * @returns The crawled-on data with perhaps changed data
     */
    public crawlData(data: TableData<T>): TableData<T> {
        return data;
    }

    /**
     * Crawl on a given title row element
     * @param row {@code iTableRow} The title row to crawl on
     * @returns The crawled-on title row with perhaps changed data
     */
    public crawlTitleRow(titleRow: TitleRow<T>): TitleRow<T> {
        return titleRow;
    }

    /**
     * Crawl on a given title cell element
     * @param titlecell {@code iTableCell} The title cell to crawl on
     * @returns The crawled-on title cell with perhaps changed data
     */
    public crawlTitleCell(titleCell: TitleCell<T>): TitleCell<T> {
        return titleCell;
    }
}