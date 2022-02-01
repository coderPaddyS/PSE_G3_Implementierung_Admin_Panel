/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Table, TableCell, TableData, TableRow, TitleCell, TitleRow } from "$lib/model/table/TableComponents";

/**
 * A generic TableCrawler to crawl a table.
 * Enables to add custom behavior, as it crawls along the table and visits each element if desired.
 * 
 * @param E A type that extends this class to contain type safety and enable access to attributes.
 * 
 * @author Patrick Schneider
 * @version 1.0 
 */
export abstract class TableCrawler<T, E extends TableCrawler<T, E>> {
    
    /**
     * Crawl on a given table element
     * @param crawler The used crawler to refer to
     * @param table {@code iTable<iTableRow} The table to crawl on
     * @returns The crawled-on table with perhaps changed data
     */
    public crawlTable(table: Table<T>): Table<T> {
        return table;
    }

    /**
     * Crawl on a given row element
     * @param crawler The used crawler to refer to
     * @param row {@code iTableRow} The row to crawl on
     * @returns The crawled-on row with perhaps changed data
     */
    public crawlRow(row: TableRow<T>): TableRow<T> {
        return row;
    }

    /**
     * Crawl on a given cell element
     * @param crawler The used crawler to refer to
     * @param cell {@code iTableCell} The cell to crawl on
     * @returns The crawled-on cell with perhaps changed data
     */
    public crawlCell(cell: TableCell<T>): TableCell<T> {
        return cell;
    }

    /**
     * Crawl on a given data element
     * @param crawler The used crawler to refer to
     * @param data {@code iTableData} The data to crawl on
     * @returns The crawled-on data with perhaps changed data
     */
    public crawlData(data: TableData<T>): TableData<T> {
        return data;
    }

    /**
     * Crawl on a given title row element
     * @param crawler The used crawler to refer to
     * @param row {@code iTableRow} The title row to crawl on
     * @returns The crawled-on title row with perhaps changed data
     */
    public crawlTitleRow(titleRow: TitleRow<T>): TitleRow<T> {
        return titleRow;
    }

    /**
     * Crawl on a given title cell element
     * @param crawler The used crawler to refer to
     * @param titlecell {@code iTableCell} The title cell to crawl on
     * @returns The crawled-on title cell with perhaps changed data
     */
    public crawlTitleCell(titleCell: TitleCell<T>): TitleCell<T> {
        return titleCell;
    }

    /**
     * Crawl on a given iTableComponent.
     * @param crawler The crawler referred to
     * @param component {@code iTableComponent} The component to crawl on
     * @returns The crawled-on component with perhaps changed data
     */
    // public crawl(crawler: E, component: TableComponent<T>) {
    //     switch (true) {
    //         case component instanceof Table:      this.crawlTable(crawler, component as Table<T>); break;
    //         case component instanceof TableRow:   this.crawlRow(crawler, component as TableRow<T>); break;
    //         case component instanceof TableCell:  this.crawlCell(crawler, component as TableCell<T>); break;
    //         case component instanceof TableData:  this.crawlData(crawler, component as TableData<T>); break;
    //         case component instanceof TitleRow:   this.crawlTitleRow(crawler, component as TitleRow<T>); break;
    //         case component instanceof TitleCell:  this.crawlTitleCell(crawler, component as TitleCell<T>); break;
    //     }
    // }
}